import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "./db";
import type { Arrival } from "./rsvp-schema";

export type Guest = {
  id: string;
  token: string;
  response: "attending" | "declined";
  full_name: string;
  email: string | null;
  phone: string | null;
  arrival: Arrival | null;
  needs_parking: boolean;
  email_sent: boolean;
  checked_in_at: string | null;
  created_at: string;
};

export const newToken = () => randomBytes(16).toString("base64url");

export async function saveAttending(input: {
  fullName: string;
  email: string;
  phone: string;
  arrival: Arrival;
}) {
  const needsParking = input.arrival === "self_drive" || input.arrival === "driver";
  const rows = (await db()`
    insert into guests (token, response, full_name, email, phone, arrival, needs_parking)
    values (${newToken()}, 'attending', ${input.fullName}, ${input.email}, ${input.phone}, ${input.arrival}, ${needsParking})
    on conflict ((lower(email))) where email is not null
    do update set
      response = 'attending',
      full_name = excluded.full_name,
      email = excluded.email,
      phone = excluded.phone,
      arrival = excluded.arrival,
      needs_parking = excluded.needs_parking
    returning *
  `) as Guest[];
  return rows[0];
}

export async function saveDeclined(fullName: string) {
  await db()`
    insert into guests (token, response, full_name)
    values (${newToken()}, 'declined', ${fullName})
  `;
}

export async function markEmailSent(id: string, sent: boolean) {
  await db()`update guests set email_sent = ${sent} where id = ${id}`;
}

export async function findByToken(token: string) {
  if (!/^[A-Za-z0-9_-]{10,64}$/.test(token)) return null;
  const rows = (await db()`select * from guests where token = ${token} limit 1`) as Guest[];
  return rows[0] ?? null;
}
