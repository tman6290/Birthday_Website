"use server";

import { counts, findByToken, toCheckinGuest } from "@/lib/guests";
import { isStaff, passwordMatches, startStaffSession } from "@/lib/session";

export async function signIn(_prev: { error?: string }, formData: FormData): Promise<{ error?: string; ok?: boolean }> {
  const password = String(formData.get("password") ?? "");
  if (!passwordMatches(password)) {
    await new Promise((r) => setTimeout(r, 600));
    return { error: "That password isn't right." };
  }
  await startStaffSession();
  return { ok: true };
}

export async function lookupPass(token: string) {
  if (!(await isStaff())) throw new Error("Not signed in");
  return toCheckinGuest(await findByToken(token), token);
}

export async function doorCounts() {
  if (!(await isStaff())) throw new Error("Not signed in");
  const c = await counts();
  return { admitted: c.admitted, attending: c.attending };
}
