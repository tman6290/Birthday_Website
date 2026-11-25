import { event } from "@/config/event";
import { claimReminders, guestsAwaitingPass, markPassSent, releaseReminder, type Guest } from "@/lib/guests";
import { firstNameOf } from "@/lib/rsvp-schema";
import { sendTemplate, whatsappEnabled } from "@/lib/whatsapp";

export const maxDuration = 60;

/** Today's date in Lagos as YYYY-MM-DD. */
const lagosToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date());

/** Runs `fn` over `items`, a few at a time, and counts the successes. */
async function inBatches(items: Guest[], fn: (g: Guest) => Promise<boolean>) {
  let ok = 0;
  for (let i = 0; i < items.length; i += 8) {
    const results = await Promise.all(items.slice(i, i + 8).map(fn));
    ok += results.filter(Boolean).length;
  }
  return ok;
}

const recipient = (g: Guest) => ({ phone: g.phone ?? "", firstName: firstNameOf(g.full_name), token: g.token });

/**
 * Called once a day by Vercel Cron (vercel.json). Vercel sends
 * `Authorization: Bearer $CRON_SECRET`. Each run stays under Meta's daily
 * limit on new recipients (WHATSAPP_DAILY_LIMIT, default 240).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false }, { status: 401 });
  }
  if (!whatsappEnabled()) return Response.json({ ok: true, skipped: "WhatsApp is not configured" });

  let budget = Number(process.env.WHATSAPP_DAILY_LIMIT) || 240;

  // 1. Passes that didn't go through when the guest RSVP'd.
  const awaiting = await guestsAwaitingPass(budget);
  const passes = await inBatches(awaiting, async (g) => {
    const sent = await sendTemplate("pass", recipient(g));
    if (sent) await markPassSent(g.id, true);
    return sent;
  });
  budget -= awaiting.length;

  // 2. Reminders, from the reminder date until the day before the event.
  const today = lagosToday();
  let reminders = 0;
  let remindersFailed = 0;
  if (today >= event.reminderDate && today < event.eventDate && budget > 0) {
    const batch = await claimReminders(budget);
    reminders = await inBatches(batch, async (g) => {
      const sent = await sendTemplate("reminder", recipient(g));
      if (!sent) await releaseReminder(g.id);
      return sent;
    });
    remindersFailed = batch.length - reminders;
  }

  return Response.json({ ok: true, today, passes, passesFailed: awaiting.length - passes, reminders, remindersFailed });
}
