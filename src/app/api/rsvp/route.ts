import { markPassSent, saveAttending, saveDeclined } from "@/lib/guests";
import { sendTemplate } from "@/lib/whatsapp";
import { firstNameOf, rsvpSchema } from "@/lib/rsvp-schema";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, errors: {} }, { status: 400 });
  }

  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] ??= issue.message;
    }
    return Response.json({ ok: false, errors }, { status: 400 });
  }

  const data = parsed.data;
  const firstName = firstNameOf(data.fullName);

  try {
    if (data.response === "decline") {
      await saveDeclined(data.fullName);
      return Response.json({ ok: true, firstName });
    }

    const guest = await saveAttending(data);
    if (!guest) return Response.json({ ok: false, full: true, errors: {} }, { status: 409 });

    // Send the pass to WhatsApp after saving. A failure here doesn't fail the
    // RSVP: the pass is on screen, and the daily job retries unsent passes.
    const whatsappSent = guest.phone
      ? await sendTemplate("pass", { phone: guest.phone, firstName, token: guest.token })
      : false;
    await markPassSent(guest.id, whatsappSent).catch((err) => console.error(err));

    return Response.json({ ok: true, firstName, token: guest.token, whatsappSent });
  } catch (err) {
    console.error("RSVP failed", err);
    return Response.json({ ok: false, errors: {} }, { status: 500 });
  }
}
