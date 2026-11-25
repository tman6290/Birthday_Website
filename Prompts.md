# Prompts

Paste these into Claude Code in order. Check the result in the browser before moving on.

---

## 1. Set up

```
Read CLAUDE.md, docs/SPEC.md and docs/DESIGN.md.

This folder already has files, so run create-next-app (TypeScript, Tailwind, ESLint, App Router, src/, npm) in a temporary sibling folder and move the result in here without overwriting README.md, CLAUDE.md, Prompts.md, .gitignore, docs/ or reference/. Delete the temp folder.

Install motion, zod, qrcode, nodemailer, @neondatabase/serverless, qr-scanner, server-only, and the @types for qrcode and nodemailer.

Create src/config/event.ts from the spec. Add the fonts and colour tokens. Copy reference/invite-card.jpeg to public/ and make public/og.jpg as a 1200x630 crop. Add the metadata. Remove the starter page content.

Lint, build, commit.
```

---

## 2. The invitation page

```
Build / from docs/SPEC.md and docs/DESIGN.md: the envelope intro, the invitation card, and the page below it. Buttons can do nothing yet.

Draw the ornaments to match the ones on reference/invite-card.jpeg. Make the intro skippable and keyboard accessible, with the reduced-motion fallback.

Check it at 360, 390, 768 and 1280 and compare it with the invitation card. Lint, build, commit.
```

---

## 3. RSVP and the pass

```
Build the RSVP from docs/SPEC.md: db/schema.sql and an npm script to apply it, POST /api/rsvp, the accept and decline sheets, the pass shown after accepting, GET /api/pass/[token]/qr, and the /p/[token] page.

Leave email as a stub that returns false for now.

Test: accept, decline, accept again with the same email (same token), and a phone starting with 0. Lint, build, commit.
```

---

## 4. Email

```
Replace the email stub with nodemailer, following the Email section of docs/SPEC.md. Add an npm script that sends a sample pass to EMAIL_TEST_TO.

Send one to yourself and check that it looks right in Gmail on a phone and that the QR scans. Lint, build, commit.
```

---

## 5. Door and guest list

```
Build the staff password cookie, /door with the camera scanner and check-in card, POST /api/checkin, the staff view of /p/[token], and /admin with the figures, tables and print layout. All from docs/SPEC.md.

Test on a phone: sign in at /door, scan a pass, admit, scan again. Check the print preview. Lint, build, commit.
```

---

## 6. Finish and deploy

```
Re-read the "Keep it from looking machine-made" section in CLAUDE.md and fix anything that breaks it. Do a last pass for keyboard use, contrast and mobile layout.

Then help me deploy to Vercel: confirm .env.example is complete, and once I've connected Neon and added the env vars, apply the schema and test a real RSVP on the live URL. Commit.
```
