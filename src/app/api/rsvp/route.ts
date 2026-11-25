import { sendPassEmail } from "@/lib/email";
import { markEmailSent, saveAttending, saveDeclined } from "@/lib/guests";
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

    const { guest, isNew } = await saveAttending(data);
    let emailSent = false;
    try {
      emailSent = await sendPassEmail(guest);
    } catch (err) {
      console.error("Pass email failed", err);
    }
    await markEmailSent(guest.id, emailSent).catch((err) => console.error(err));

    // A repeat accept only re-sends the pass to the inbox on file, so knowing
    // someone's email address is not enough to see their pass.
    if (!isNew) {
      if (!emailSent) return Response.json({ ok: false, errors: {} }, { status: 502 });
      return Response.json({ ok: true, firstName, emailSent, token: null });
    }

    return Response.json({ ok: true, firstName, token: guest.token, emailSent });
  } catch (err) {
    console.error("RSVP failed", err);
    return Response.json({ ok: false, errors: {} }, { status: 500 });
  }
}
