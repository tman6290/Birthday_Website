# Funsho at 50

Guest website for Funsho's 50th birthday. Royal Heritage. Wednesday 30 December 2026, Brava Event Center, Ikeja.

## How it works

Guests open the link, open the invitation, and accept or decline. Accepting asks for name, email, phone and how they'll arrive. They get a QR pass on screen and by email.

At the entrance, staff open `/door` on a phone, sign in, and scan the pass. The screen shows the guest's name and an Admit button, or warns if the pass was already used or isn't on the list.

The organiser opens `/admin` to see who's coming, how many cars need parking, and to print the list.

## Cost

Nothing. Vercel Hobby hosts it, Neon's free tier stores the RSVPs, and a Gmail account sends the emails (about 500 a day).

## Setup

```bash
npm install
cp .env.example .env.local
npm run db:setup
npm run dev
```

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | The live URL. QR codes point here |
| `DATABASE_URL` | Set by Vercel when you connect Neon |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Gmail: `smtp.gmail.com`, `465`, the address, an app password |
| `EMAIL_FROM` | Must be the same Gmail address |
| `EMAIL_TEST_TO` | For the test email script |
| `ADMIN_PASSWORD` | For `/door` and `/admin` |
| `SESSION_SECRET` | Any 32+ random characters |

Gmail app password: turn on 2-Step Verification, then create one under Security, App passwords.

## Deploy

Push to GitHub, import into Vercel, connect Neon under Storage, add the env vars, deploy. Then `vercel env pull .env.local` and `npm run db:setup`. Send yourself a test RSVP before sharing the link.
