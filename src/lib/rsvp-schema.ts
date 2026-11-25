import { z } from "zod";

export const arrivalOptions = [
  { value: "self_drive", label: "I'll drive myself" },
  { value: "driver", label: "A driver will bring me" },
  { value: "ride_hailing", label: "Bolt or similar" },
  { value: "drop_off", label: "Someone will drop me off" },
] as const;

export type Arrival = (typeof arrivalOptions)[number]["value"];

export const arrivalLabel = (value: string | null) =>
  arrivalOptions.find((o) => o.value === value)?.label ?? "";

/** Strip spaces; 0803... (11 digits) becomes +234803... */
export function normalisePhone(raw: string) {
  const compact = raw.replace(/[\s-]/g, "");
  if (/^0\d{10}$/.test(compact)) return `+234${compact.slice(1)}`;
  return compact;
}

/** +2348035117901 becomes +234 803 511 7901 for display. */
export function formatPhone(phone: string | null) {
  if (!phone) return "";
  const m = phone.match(/^\+234(\d{3})(\d{3})(\d{4})$/);
  return m ? `+234 ${m[1]} ${m[2]} ${m[3]}` : phone;
}

const fullName = z
  .string({ error: "Enter your full name" })
  .trim()
  .min(2, { error: "Enter your full name" })
  .max(120, { error: "Enter your full name" });

export const acceptSchema = z.object({
  response: z.literal("accept"),
  fullName,
  phone: z
    .string({ error: "Enter a valid phone number" })
    .transform(normalisePhone)
    .pipe(z.string().regex(/^\+?\d{7,15}$/, { error: "Enter a valid phone number" })),
  arrival: z.enum(["self_drive", "driver", "ride_hailing", "drop_off"], { error: "Choose how you'll arrive" }),
});

export const declineSchema = z.object({
  response: z.literal("decline"),
  fullName,
});

export const rsvpSchema = z.discriminatedUnion("response", [acceptSchema, declineSchema]);

export const firstNameOf = (fullName: string) => fullName.trim().split(/\s+/)[0] ?? fullName;
