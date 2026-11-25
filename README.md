# Funsho at 50

Guest website for Funsho's 50th birthday. Royal Heritage. Wednesday 30 December 2026, Brava Event Center, Ikeja.

## How it works

Funsho sends the link to her guests on WhatsApp. Guests open it, open the invitation, and accept or decline. Accepting asks for name, WhatsApp number and how they'll arrive, then shows a QR entry pass and sends it to their WhatsApp. Five days before the event, everyone attending gets a WhatsApp reminder. Replying again with the same number shows the same pass and sends it again. Once 400 guests have accepted, the link shows "This event is full".

At the entrance, staff open `/door` on a phone, sign in as `door1` or `door2`, and scan the pass. The screen shows the guest's name and an Admit button, or warns if the pass was already used or isn't on the list.

The organiser signs in to `/admin` as `host` to see who's coming, how many cars need parking, and to print the list.

## Cost

Vercel Hobby and Neon's free tier cost nothing. WhatsApp messages are paid to Meta directly, about ₦14 each as utility messages: one pass per guest plus one reminder, so roughly ₦11,000 for 400 guests.

## Setup

```bash
npm install
cp .env.example .env.local
npm run db:setup
npm run dev
```

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | The live URL. QR codes point here, so set it before the production build |
| `DATABASE_URL` | Neon connection string |
| `HOST_PASSWORD` | Account `host`: `/admin` and `/door` |
| `DOOR1_PASSWORD`, `DOOR2_PASSWORD` | Accounts `door1`, `door2`: `/door` only |
| `SESSION_SECRET` | Any 32+ random characters. Changing it signs every staff phone out |
| `WHATSAPP_TOKEN` | Permanent access token from a Meta system user. Empty turns WhatsApp off |
| `WHATSAPP_PHONE_NUMBER_ID` | From WhatsApp Manager, API Setup |
| `CRON_SECRET` | Any long random string. Vercel Cron uses it to call `/api/cron/whatsapp` |
| `WHATSAPP_TEST_TO` | Optional, local only: your number for `npm run whatsapp:test` |

The guest limit is `capacity` and the reminder date is `reminderDate`, both in `src/config/event.ts`.

## WhatsApp templates

Create two templates in WhatsApp Manager, category **Utility**, language **English**. Both have an **Image** header, `{{1}}` = first name in the body, and one **Visit website** button with a dynamic URL `https://<your site>/p/{{1}}`.

- `funsho_pass`: the entry pass, sent when a guest accepts.
- `funsho_reminder`: sent from `reminderDate`, once a day at 09:00 Lagos time, to everyone attending who hasn't had one. New WhatsApp accounts can message 250 people a day, so the rest go the next morning.

Test with `npm run whatsapp:test` (pass) or `npm run whatsapp:test reminder`, after RSVPing with the number in `WHATSAPP_TEST_TO`.

## Deploy

Push to GitHub, import into Vercel, add the env vars, deploy. Set the function region to Frankfurt (fra1) to sit next to a Neon database in AWS Frankfurt. Send yourself a test RSVP before sharing the link.
