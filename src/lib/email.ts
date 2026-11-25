import "server-only";
import nodemailer from "nodemailer";
import { event } from "@/config/event";
import type { Guest } from "./guests";
import { passUrl, qrPng } from "./qr";
import { firstNameOf } from "./rsvp-schema";

const SUBJECT = "Your entry pass · Funsho at 50";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const sentenceCase = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

function transport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  const port = Number(SMTP_PORT || 465);
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

type PassEmail = { fullName: string; token: string };

export function renderPassEmail({ fullName, token }: PassEmail) {
  const firstName = firstNameOf(fullName);
  const url = passUrl(token);
  const [service, reception] = event.programme;
  const contacts = event.contacts.map((c) => `${c.name}, ${c.display}`).join(" · ");
  const venueLine = `${event.venue.name}, ${event.venue.address}`;
  const ladies = sentenceCase(event.dressCode.ladies);

  const serif = "Georgia, 'Times New Roman', serif";
  const sans = "Helvetica, Arial, sans-serif";

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(SUBJECT)}</title>
</head>
<body style="margin:0;padding:0;background-color:#FBF6EC;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FBF6EC;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#FBF6EC;border:1px solid #C9A24D;">
<tr><td align="center" style="background-color:#7B2A2E;padding:28px 24px;">
<p style="margin:0;font-family:${sans};font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#E8CD8F;">${esc(event.theme)}</p>
<p style="margin:8px 0 0;font-family:${serif};font-size:30px;font-style:italic;color:#FBF6EC;">Funsho at 50</p>
</td></tr>
<tr><td style="padding:32px 32px 8px;font-family:${serif};font-size:18px;line-height:1.55;color:#2B2220;">
<p style="margin:0 0 14px;">Dear ${esc(firstName)},</p>
<p style="margin:0;">Thank you for accepting. We look forward to celebrating Funsho with you.</p>
</td></tr>
<tr><td align="center" style="padding:24px 32px 8px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:#F3E7CF;border:1px solid #C9A24D;">
<tr><td align="center" style="padding:24px 28px;">
<p style="margin:0 0 14px;font-family:${sans};font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#7B2A2E;">Entry pass</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF;border:1px solid #C9A24D;">
<tr><td style="padding:8px;"><img src="cid:pass-qr" width="220" height="220" alt="Entry pass QR code" style="display:block;width:220px;height:220px;border:0;"></td></tr>
</table>
<p style="margin:16px 0 4px;font-family:${serif};font-size:22px;color:#2B2220;">${esc(fullName)}</p>
<p style="margin:0;font-family:${serif};font-size:16px;color:#2B2220;">Please show this pass at the entrance.</p>
</td></tr>
</table>
</td></tr>
<tr><td style="padding:24px 32px 0;font-family:${serif};font-size:17px;line-height:1.6;color:#2B2220;">
<p style="margin:0;font-size:20px;">${esc(event.dateLabel)}</p>
<p style="margin:6px 0 0;">${esc(service.title)} · ${esc(service.time)}<br>${esc(reception.title)} · ${esc(reception.time)}<br>${esc(venueLine)}</p>
</td></tr>
<tr><td style="padding:24px 32px 0;font-family:${serif};font-size:17px;line-height:1.6;color:#2B2220;">
<p style="margin:0 0 6px;font-family:${sans};font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#7B2A2E;">Dress code</p>
<p style="margin:0;">Ladies: ${esc(ladies)}<br>Gentlemen: ${esc(event.dressCode.gentlemen)}</p>
</td></tr>
<tr><td style="padding:24px 32px 0;font-family:${serif};font-size:17px;line-height:1.6;color:#2B2220;">
<p style="margin:0;">Questions? ${esc(contacts)}</p>
</td></tr>
<tr><td align="center" style="padding:28px 32px 32px;">
<a href="${esc(url)}" style="display:inline-block;background-color:#7B2A2E;color:#FBF6EC;font-family:${sans};font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 26px;border-radius:4px;">View your pass online</a>
</td></tr>
<tr><td align="center" style="background-color:#7B2A2E;padding:16px 24px;font-family:${sans};font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#FBF6EC;">Strictly by invitation · Adults only</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    `Dear ${firstName},`,
    "",
    "Thank you for accepting. We look forward to celebrating Funsho with you.",
    "",
    fullName,
    "Please show this pass at the entrance.",
    "",
    event.dateLabel,
    `${service.title} · ${service.time}`,
    `${reception.title} · ${reception.time}`,
    venueLine,
    "",
    "Dress code",
    `Ladies: ${ladies}`,
    `Gentlemen: ${event.dressCode.gentlemen}`,
    "",
    `Questions? ${contacts}`,
    "",
    `View your pass online: ${url}`,
    "",
    "Strictly by invitation · Adults only",
  ].join("\n");

  return { subject: SUBJECT, html, text };
}

export async function sendPassTo(to: string, pass: PassEmail): Promise<boolean> {
  const t = transport();
  if (!t) {
    console.warn("SMTP is not configured; pass email not sent");
    return false;
  }
  const { subject, html, text } = renderPassEmail(pass);
  const png = await qrPng(pass.token);
  await t.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
    text,
    attachments: [{ filename: "entry-pass.png", content: png, contentType: "image/png", cid: "pass-qr" }],
  });
  return true;
}

export async function sendPassEmail(guest: Guest): Promise<boolean> {
  if (!guest.email) return false;
  return sendPassTo(guest.email, { fullName: guest.full_name, token: guest.token });
}
