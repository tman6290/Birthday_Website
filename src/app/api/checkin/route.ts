import { z } from "zod";
import { checkIn } from "@/lib/guests";
import { isStaff } from "@/lib/session";

const body = z.object({ token: z.string().min(1).max(100) });

export async function POST(request: Request) {
  if (!(await isStaff())) return Response.json({ ok: false }, { status: 401 });

  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });

  try {
    const result = await checkIn(parsed.data.token);
    if (!result) return Response.json({ ok: false }, { status: 404 });
    return Response.json({ ok: true, ...result });
  } catch (err) {
    console.error("Check-in failed", err);
    return Response.json({ ok: false }, { status: 500 });
  }
}
