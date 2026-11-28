import { db } from "@/lib/db";
import { envValue } from "@/lib/env";

/**
 * Meta's WhatsApp webhook. Configure it in the Meta app (WhatsApp, Configuration)
 * with this URL and CRON_SECRET as the verify token, subscribed to "messages".
 * Delivery reports are saved to whatsapp_events so failed sends show Meta's reason.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const secret = envValue("CRON_SECRET");
  if (secret && params.get("hub.mode") === "subscribe" && params.get("hub.verify_token") === secret) {
    return new Response(params.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

type Status = { id?: string; status?: string; recipient_id?: string; errors?: unknown };

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const statuses: Status[] = (body?.entry ?? [])
    .flatMap((e: { changes?: { value?: { statuses?: Status[] } }[] }) => e.changes ?? [])
    .flatMap((c: { value?: { statuses?: Status[] } }) => c.value?.statuses ?? [])
    .slice(0, 50);

  for (const s of statuses) {
    if (s.status === "failed") console.error("WhatsApp delivery failed", JSON.stringify(s.errors));
    await db()`
      insert into whatsapp_events (message_id, status, recipient, errors)
      values (${String(s.id ?? "").slice(0, 200)}, ${String(s.status ?? "").slice(0, 20)},
              ${String(s.recipient_id ?? "").slice(0, 20)}, ${s.errors ? JSON.stringify(s.errors) : null})
    `;
  }
  return new Response("ok");
}
