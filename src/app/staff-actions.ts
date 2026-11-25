"use server";

import { counts, findByToken, toCheckinGuest } from "@/lib/guests";
import { checkLogin, isStaff, startStaffSession } from "@/lib/session";

type SignInState = { error?: string; ok?: boolean; username?: string };

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const username = String(formData.get("username") ?? "").slice(0, 50);
  const user = checkLogin(username, String(formData.get("password") ?? ""));
  if (!user) {
    await new Promise((r) => setTimeout(r, 600));
    return { error: "That username or password isn't right.", username };
  }
  await startStaffSession(user);
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
