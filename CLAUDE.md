# CLAUDE.md

A small guest website for Funsho's 50th birthday. Funsho is the celebrant, a woman (she/her). Theme: Royal Heritage. Wednesday 30 December 2026, Brava Event Center, Ikeja, Lagos.

The flow, and nothing more:

1. A guest opens the link from WhatsApp and sees an animated invitation.
2. They accept or decline.
3. Accepting asks for name, phone and how they'll arrive. After 400 acceptances the link shows "This event is full".
4. They get a QR entry pass on screen and save it. No email: Funsho sends the link on WhatsApp herself.
5. At the door, staff scan the QR to confirm the guest and mark them as arrived.
6. The organiser sees and prints the guest list with the number of cars to park.

Keep it this small. Do not add features that are not in `docs/SPEC.md`.

## Read first

- `docs/SPEC.md`: pages, data, rules and every word of copy. Use the copy verbatim.
- `docs/DESIGN.md`: colours, type, layout, the envelope animation.
- `reference/invite-card.jpeg`: the printed invitation. The site must feel like the same stationery.
- `Prompts.md`: build order.

## Stack

- Next.js, latest stable, App Router, TypeScript, `src/` directory, npm.
- Tailwind CSS v4, tokens in `src/app/globals.css` under `@theme`.
- `motion` for the envelope intro and the form sheet only.
- `next/font/google`: Cormorant Garamond, Pinyon Script, Jost.
- Neon Postgres (Vercel Marketplace) with `@neondatabase/serverless` and plain SQL.
- `zod`, `qrcode`, `qr-scanner`, `server-only`.
- No UI kit, no icon library.
- Everything must run free: Vercel Hobby, Neon free tier. Never add a paid service or a package that needs one (no WhatsApp Business API, no email provider).

## Rules

- Event details live only in `src/config/event.ts`.
- Files that touch the database or secrets start with `import "server-only"`.
- Mobile first. Check 360, 390, 768 and 1280 widths.
- Real buttons and labels, visible focus ring, respect `prefers-reduced-motion`.
- Run `npm run lint` and `npm run build` before each commit. One prompt, one commit.

## Keep it from looking machine-made

- No gradients beyond the gold foil text, no glassmorphism, no glows, no heavy shadows.
- No emoji. No icon sets. Only the few ornaments in `docs/DESIGN.md`.
- No stat rows, numbered steps, feature cards or "how it works" sections.
- No helper text under fields, no tooltips, no footnotes, no toasts.
- No copy outside `docs/SPEC.md`. If a string is missing, keep it short and plain, no em dashes, no exclamation marks.
