import { saveAttending, saveDeclined } from "@/lib/guests";
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

    return Response.json({ ok: true, firstName, token: guest.token });
  } catch (err) {
    console.error("RSVP failed", err);
    return Response.json({ ok: false, errors: {} }, { status: 500 });
  }
}
