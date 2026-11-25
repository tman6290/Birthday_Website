import { z } from "zod";

export const arrivalOptions = [
  { value: "self_drive", label: "I'll drive myself" },
  { value: "driver", label: "A driver will bring me" },
  { value: "ride_hailing", label: "Uber or Bolt" },
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

const fullName = z
  .string({ error: "Enter your full name" })
  .trim()
  .min(2, { error: "Enter your full name" })
  .max(120, { error: "Enter your full name" });

export const acceptSchema = z.object({
  response: z.literal("accept"),
  fullName,
  email: z
    .string({ error: "Enter a valid email address" })
    .trim()
    .max(200, { error: "Enter a valid email address" })
    .pipe(z.email({ error: "Enter a valid email address" })),
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
