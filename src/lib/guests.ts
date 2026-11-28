import "server-only";
import { randomBytes } from "node:crypto";
import { event } from "@/config/event";
import { db } from "./db";
import { arrivalLabel, type Arrival } from "./rsvp-schema";

export type Guest = {
  id: string;
  token: string;
  response: "attending" | "declined";
  full_name: string;
  phone: string | null;
  arrival: Arrival | null;
  needs_parking: boolean;
  whatsapp_sent: boolean;
  reminder_sent_at: string | null;
  checked_in_at: string | null;
  created_at: string;
};

export const newToken = () => randomBytes(16).toString("base64url");

/**
 * Saves an acceptance, keyed on phone number. A phone already on the list is
 * updated and keeps its token. A new phone is only added while fewer than
 * `capacity` guests are attending; returns null when the event is full.
 */
export async function saveAttending(input: { fullName: string; phone: string; arrival: Arrival }) {
  const needsParking = input.arrival === "self_drive" || input.arrival === "driver";

  const updated = (await db()`
    update guests set
      response = 'attending',
      full_name = ${input.fullName},
      arrival = ${input.arrival},
      needs_parking = ${needsParking}
    where phone = ${input.phone}
    returning *
  `) as Guest[];
  if (updated[0]) return updated[0];

  const inserted = (await db()`
    insert into guests (token, response, full_name, phone, arrival, needs_parking)
    select ${newToken()}, 'attending', ${input.fullName}, ${input.phone}, ${input.arrival}, ${needsParking}
    where (select count(*) from guests where response = 'attending') < ${event.capacity}
    on conflict (phone) where phone is not null
    do update set
      response = 'attending',
      full_name = excluded.full_name,
      arrival = excluded.arrival,
      needs_parking = excluded.needs_parking
    returning *
  `) as Guest[];
  return inserted[0] ?? null;
}

export async function saveDeclined(fullName: string) {
  await db()`
    insert into guests (token, response, full_name)
    values (${newToken()}, 'declined', ${fullName})
  `;
}

export async function isFull() {
  const rows = (await db()`
    select count(*)::int as attending from guests where response = 'attending'
  `) as { attending: number }[];
  return rows[0].attending >= event.capacity;
}

/**
 * The approved WhatsApp templates' button URL has a stray literal "{{1}}" before
 * the token (…/p/%7B%7B1%7D%7D<token>). Strip it so those buttons still open the pass.
 */
function cleanToken(raw: string) {
  let token = raw;
  try {
    token = decodeURIComponent(raw);
  } catch {}
  return token.replace(/^\{\{1\}\}/, "");
}

export async function findByToken(rawToken: string) {
  const token = cleanToken(rawToken);
  if (!/^[A-Za-z0-9_-]{10,64}$/.test(token)) return null;
  const rows = (await db()`select * from guests where token = ${token} limit 1`) as Guest[];
  return rows[0] ?? null;
}

export type CheckinGuest = {
  token: string;
  fullName: string;
  arrival: string;
  status: "valid" | "arrived" | "unknown";
  checkedInAt: string | null;
};

export function toCheckinGuest(guest: Guest | null, token: string): CheckinGuest {
  if (!guest || guest.response !== "attending") {
    return { token, fullName: "", arrival: "", status: "unknown", checkedInAt: null };
  }
  return {
    token: guest.token,
    fullName: guest.full_name,
    arrival: arrivalLabel(guest.arrival),
    status: guest.checked_in_at ? "arrived" : "valid",
    checkedInAt: guest.checked_in_at ? new Date(guest.checked_in_at).toISOString() : null,
  };
}

/** Marks the guest as arrived. Returns null if the token isn't an attending guest. */
export async function checkIn(token: string) {
  if (!/^[A-Za-z0-9_-]{10,64}$/.test(token)) return null;
  const updated = (await db()`
    update guests set checked_in_at = now()
    where token = ${token} and response = 'attending' and checked_in_at is null
    returning checked_in_at
  `) as { checked_in_at: string }[];
  if (updated[0]) return { checkedInAt: new Date(updated[0].checked_in_at).toISOString(), already: false };

  const guest = await findByToken(token);
  if (!guest || guest.response !== "attending" || !guest.checked_in_at) return null;
  return { checkedInAt: new Date(guest.checked_in_at).toISOString(), already: true };
}

export async function counts() {
  const rows = (await db()`
    select
      count(*) filter (where response = 'attending')::int as attending,
      count(*) filter (where response = 'attending' and checked_in_at is not null)::int as admitted,
      count(*) filter (where response = 'attending' and needs_parking)::int as cars,
      count(*) filter (where response = 'declined')::int as declined
    from guests
  `) as { attending: number; admitted: number; cars: number; declined: number }[];
  return rows[0];
}

export async function allGuests() {
  return (await db()`select * from guests order by lower(full_name), created_at`) as Guest[];
}

export async function markPassSent(id: string, sent: boolean) {
  await db()`update guests set whatsapp_sent = ${sent} where id = ${id}`;
}

/** Attending guests whose WhatsApp pass hasn't gone through yet (for the daily retry). */
export async function guestsAwaitingPass(limit: number) {
  return (await db()`
    select * from guests
    where response = 'attending' and phone is not null and not whatsapp_sent
    order by created_at
    limit ${limit}
  `) as Guest[];
}

/**
 * Claims up to `limit` attending guests who haven't had a reminder, stamping
 * them so an overlapping run can't pick the same guests. Call
 * `releaseReminder` for any send that fails so the next run retries it.
 */
export async function claimReminders(limit: number) {
  return (await db()`
    update guests set reminder_sent_at = now()
    where id in (
      select id from guests
      where response = 'attending' and phone is not null and reminder_sent_at is null
      order by created_at
      limit ${limit}
    ) and reminder_sent_at is null
    returning *
  `) as Guest[];
}

export async function releaseReminder(id: string) {
  await db()`update guests set reminder_sent_at = null where id = ${id}`;
}
