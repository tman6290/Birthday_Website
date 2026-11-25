// Sends the pass (default) or reminder template to the guest whose WhatsApp
// number is WHATSAPP_TEST_TO. RSVP with that number on the site first.
//   npm run whatsapp:test            -> pass
//   npm run whatsapp:test reminder   -> reminder
//   npm run whatsapp:test -- --dry   -> print the request without sending
import { db } from "../src/lib/db";
import type { Guest } from "../src/lib/guests";
import { siteUrl } from "../src/lib/qr";
import { firstNameOf, normalisePhone } from "../src/lib/rsvp-schema";
import { buildTemplateMessage, sendTemplate, whatsappEnabled } from "../src/lib/whatsapp";

const kind = process.argv.includes("reminder") ? "reminder" : "pass";
const dry = process.argv.includes("--dry");
const to = process.env.WHATSAPP_TEST_TO;

if (!to) {
  console.error("Set WHATSAPP_TEST_TO in .env.local to the WhatsApp number you RSVP'd with.");
  process.exit(1);
}

const rows = (await db()`select * from guests where phone = ${normalisePhone(to)} limit 1`) as Guest[];
const guest = rows[0];
if (!guest) {
  console.error(`No guest with ${normalisePhone(to)}. RSVP on the site with that number first.`);
  process.exit(1);
}

const recipient = { phone: guest.phone ?? "", firstName: firstNameOf(guest.full_name), token: guest.token };

if (dry) {
  console.log(JSON.stringify(buildTemplateMessage(kind, recipient), null, 2));
  process.exit(0);
}
if (siteUrl().includes("localhost")) {
  console.error("Meta can't fetch the QR image from localhost. Set NEXT_PUBLIC_SITE_URL in .env.local to the live site.");
  process.exit(1);
}
if (!whatsappEnabled()) {
  console.error("Set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID in .env.local.");
  process.exit(1);
}

const sent = await sendTemplate(kind, recipient);
console.log(sent ? `Sent the ${kind} template to ${recipient.phone}` : "Not sent. The error is above.");
process.exit(sent ? 0 : 1);
