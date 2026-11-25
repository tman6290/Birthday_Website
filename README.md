# Funsho at 50

Guest website for Funsho's 50th birthday. Royal Heritage. Wednesday 30 December 2026, Brava Event Center, Ikeja.

## How it works

Funsho sends the link to her guests on WhatsApp. Guests open it, open the invitation, and accept or decline. Accepting asks for name, phone and how they'll arrive, then shows a QR entry pass to save. Replying again with the same phone number shows the same pass. Once 400 guests have accepted, the link shows "This event is full".

At the entrance, staff open `/door` on a phone, sign in as `door1` or `door2`, and scan the pass. The screen shows the guest's name and an Admit button, or warns if the pass was already used or isn't on the list.

The organiser signs in to `/admin` as `host` to see who's coming, how many cars need parking, and to print the list.

## Cost

Nothing. Vercel Hobby hosts it and Neon's free tier stores the RSVPs. No email or WhatsApp service is used.

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

The guest limit is `capacity` in `src/config/event.ts`.

## Deploy

Push to GitHub, import into Vercel, add the env vars, deploy. Set the function region to Frankfurt (fra1) to sit next to a Neon database in AWS Frankfurt. Send yourself a test RSVP before sharing the link.
