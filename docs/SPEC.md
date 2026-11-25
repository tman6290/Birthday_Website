# Spec

## Event config

`src/config/event.ts`:

```ts
export const event = {
  celebrant: "Funsho",
  theme: "Royal Heritage",
  dateLabel: "Wednesday, 30 December 2026",
  programme: [
    { kicker: "An intimate hour of", title: "Hymns, Praise & Thanksgiving", time: "12:00 noon – 1:00 pm" },
    { kicker: null, title: "Reception", time: "2:00 pm – 8:00 pm" },
  ],
  venue: {
    name: "Brava Event Center",
    address: "Plot 8, Guinness Road, Off Akilo Road, Ikeja",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Brava+Event+Center+Guinness+Road+Ikeja+Lagos",
  },
  dressCode: {
    ladies: "Elegant dresses in shades of green or champagne gold, complemented with emerald green fascinators.",
    gentlemen: "English suits or distinguished native attire.",
  },
  contacts: [
    { name: "Bukola", phone: "+2348035117901", display: "+234 803 511 7901" },
    { name: "Blay", phone: "+2348167470038", display: "+234 816 747 0038" },
  ],
} as const;
```

## Pages

### `/` The invitation

**Intro overlay** (envelope animation, see DESIGN.md). Ends on the invitation card:

- You are invited to celebrate
- Funsho
- at fifty
- Wednesday, 30 December 2026 · Brava Event Center, Ikeja
- Buttons: **Accept with pleasure** · **Decline with regret**
- Link: Read the details first (closes the overlay)

**Page below the overlay**, one column:

- Hero: Nº 50 · Celebrating · Funsho · THEME · ROYAL HERITAGE
- THE DAY: the date, then each programme item with its time
- THE VENUE: name, address, link "Open in Maps"
- DRESS CODE: LADIES and GENTLEMEN lines
- Kindly respond: the same two buttons
- Contacts: "Bukola · +234 803 511 7901" and "Blay · +234 816 747 0038", each a tap-to-call link
- Footer band: Strictly by invitation · Adults only

**Accept sheet**

- Title: Your details
- FULL NAME
- EMAIL
- PHONE NUMBER
- HOW WILL YOU ARRIVE? (select)
  - I'll drive myself
  - A driver will bring me
  - Uber or Bolt
  - Someone will drop me off
- Button: Confirm attendance (shows "Sending…" while waiting)
- Errors: Enter your full name · Enter a valid email address · Enter a valid phone number · Choose how you'll arrive · Something went wrong. Please try again.

**After accepting** the sheet shows the pass:

- See you on the 30th, {firstName}.
- Your pass is below and in your inbox. Please show it at the entrance.
- The pass (see below)
- Button: Save pass (downloads the QR as a PNG)

If the email failed, the second line reads: Your pass is below. Please save it and show it at the entrance.

**Decline sheet**

- Title: We'll miss you
- FULL NAME
- Button: Send
- After: Thank you, {firstName}. We've let the family know.

### `/p/[token]` The pass

Opened from the email link or by scanning the QR.

- For guests: ENTRY PASS · full name · QR · date · times · venue · Save pass.
- For signed-in staff: a check-in card instead (see Door).
- Unknown token: This pass isn't recognised.

### `/door` Check-in

1. Password screen (ADMIN_PASSWORD). Label: PASSWORD. Button: Sign in. Error: That password isn't right.
2. Camera scanner (`qr-scanner`, back camera). On a scan whose path is `/p/{token}`, pause and show the check-in card.
3. Check-in card:
   - Valid, not yet arrived: green panel, full name, arrival method, button **Admit**.
   - Already arrived: amber panel, "Already admitted at {time}".
   - Unknown or declined: red panel, "Not on the list".
   - Button: Scan next.
4. Top line: {admitted} of {attending} admitted.

Staff can also scan with the phone camera. That opens `/p/[token]`, which shows the check-in card when the browser is signed in.

### `/admin` Guest list

Password screen as above, then:

- Three figures: Attending · Cars to park · Declined
- Table, alphabetical: Name · Phone · Email · Arrival · Parking (Yes or blank) · Arrived (time or blank)
- Declined guests listed below in a short second table: Name · Date responded
- Button: Print. Print CSS: A4, hides buttons, repeats the table header on each page, adds an empty tick box column for paper check-in.

## Data

`db/schema.sql`:

```sql
create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  response text not null check (response in ('attending', 'declined')),
  full_name text not null,
  email text,
  phone text,
  arrival text check (arrival in ('self_drive', 'driver', 'ride_hailing', 'drop_off')),
  needs_parking boolean not null default false,
  email_sent boolean not null default false,
  checked_in_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists guests_email_key on guests (lower(email)) where email is not null;
```

## Rules

- `POST /api/rsvp` takes `{ response: "accept", fullName, email, phone, arrival }` or `{ response: "decline", fullName }`, validated with zod.
- Phone: strip spaces. `0803...` (11 digits) becomes `+234803...`.
- `needs_parking` is true for `self_drive` and `driver`.
- Same email accepting twice: update the existing row, keep its token, send the email again.
- Token: 16 random bytes, base64url. The QR contains `${NEXT_PUBLIC_SITE_URL}/p/${token}` and nothing else.
- Send the email after saving. If it fails, still return success with `emailSent: false`.
- `GET /api/pass/[token]/qr` returns the QR PNG.
- `POST /api/checkin` with `{ token }`, staff only. If already checked in, return the existing time.
- Staff session: one signed, httpOnly cookie set after the correct ADMIN_PASSWORD. Lasts 7 days. Shared by `/door` and `/admin`.

## Email

- Nodemailer over SMTP (env vars in `.env.example`).
- Subject: Your entry pass · Funsho at 50
- HTML with tables and inline styles, 600px, ivory background, wine header, Georgia for serif. QR attached inline as `cid:pass-qr` (Gmail blocks base64 images).

Body:

> Dear {firstName},
>
> Thank you for accepting. We look forward to celebrating Funsho with you.
>
> [QR]
>
> {fullName}
> Please show this pass at the entrance.
>
> Wednesday, 30 December 2026
> Hymns, Praise & Thanksgiving · 12:00 noon – 1:00 pm
> Reception · 2:00 pm – 8:00 pm
> Brava Event Center, Plot 8, Guinness Road, Off Akilo Road, Ikeja
>
> Dress code
> Ladies: elegant dresses in shades of green or champagne gold, complemented with emerald green fascinators.
> Gentlemen: English suits or distinguished native attire.
>
> Questions? Bukola, +234 803 511 7901 · Blay, +234 816 747 0038
>
> [View your pass online]
>
> Strictly by invitation · Adults only

## Metadata

- Title: Funsho at 50 · Royal Heritage
- Description: Wednesday 30 December 2026 · Brava Event Center, Ikeja
- Open Graph image: `public/og.jpg`, a 1200x630 crop of the invitation card (WhatsApp uses it for the link preview).
- `robots: noindex`.
