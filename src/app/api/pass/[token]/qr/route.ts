import { findByToken } from "@/lib/guests";
import { qrPng } from "@/lib/qr";

export async function GET(request: Request, ctx: RouteContext<"/api/pass/[token]/qr">) {
  const { token } = await ctx.params;
  const guest = await findByToken(token);
  if (!guest || guest.response !== "attending") {
    return new Response("Not found", { status: 404 });
  }

  const png = await qrPng(guest.token);
  const download = new URL(request.url).searchParams.has("download");
  const filename = `funsho-at-50-pass-${guest.full_name.replace(/[^A-Za-z0-9]+/g, "-").toLowerCase()}.png`;

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=3600",
      ...(download ? { "Content-Disposition": `attachment; filename="${filename}"` } : {}),
    },
  });
}
