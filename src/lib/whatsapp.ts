import "server-only";
import { envValue } from "./env";
import { siteUrl } from "./qr";

/**
 * WhatsApp Cloud API (Meta). Messages to guests are pre-approved "utility"
 * templates created in WhatsApp Manager. Both templates take:
 *   header: an image (the guest's QR pass, fetched by Meta from our public QR route)
 *   body:   {{1}} = guest's first name
 *   button: a URL button "https://<site>/p/{{1}}" where {{1}} = pass token
 */
export const TEMPLATES = {
  pass: envValue("WHATSAPP_PASS_TEMPLATE") ?? "funsho_pass",
  reminder: envValue("WHATSAPP_REMINDER_TEMPLATE") ?? "funsho_reminder",
} as const;

type TemplateKind = keyof typeof TEMPLATES;

export function whatsappEnabled() {
  return Boolean(envValue("WHATSAPP_TOKEN") && envValue("WHATSAPP_PHONE_NUMBER_ID"));
}

/** +2348035117901 becomes 2348035117901, the format the API expects. */
export const toWhatsAppNumber = (phone: string) => phone.replace(/[^\d]/g, "");

export function buildTemplateMessage(
  kind: TemplateKind,
  guest: { phone: string; firstName: string; token: string },
) {
  return {
    messaging_product: "whatsapp",
    to: toWhatsAppNumber(guest.phone),
    type: "template",
    template: {
      name: TEMPLATES[kind],
      language: { code: envValue("WHATSAPP_TEMPLATE_LANG") ?? "en" },
      components: [
        {
          type: "header",
          parameters: [{ type: "image", image: { link: `${siteUrl()}/api/pass/${guest.token}/qr` } }],
        },
        { type: "body", parameters: [{ type: "text", text: guest.firstName }] },
        { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: guest.token }] },
      ],
    },
  };
}

/** Sends one template message. Returns true when Meta accepted it. Never throws. */
export async function sendTemplate(
  kind: TemplateKind,
  guest: { phone: string; firstName: string; token: string },
): Promise<boolean> {
  if (!whatsappEnabled()) return false;
  const version = envValue("WHATSAPP_API_VERSION") ?? "v23.0";
  const url = `https://graph.facebook.com/${version}/${envValue("WHATSAPP_PHONE_NUMBER_ID")}/messages`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${envValue("WHATSAPP_TOKEN")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildTemplateMessage(kind, guest)),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      console.error(`WhatsApp ${kind} failed (${res.status})`, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error(`WhatsApp ${kind} failed`, err);
    return false;
  }
}
