import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

export const STAFF_COOKIE = "f50_staff";
const MAX_AGE = 60 * 60 * 24 * 7;

/** host can use /admin and /door; door1 and door2 can use /door only. Passwords live in env vars. */
const ACCOUNTS = {
  host: { env: "HOST_PASSWORD", admin: true },
  door1: { env: "DOOR1_PASSWORD", admin: false },
  door2: { env: "DOOR2_PASSWORD", admin: false },
} as const;

export type StaffUser = keyof typeof ACCOUNTS;

const isAccount = (name: string): name is StaffUser => Object.hasOwn(ACCOUNTS, name);

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("SESSION_SECRET is not set");
  return s;
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Returns the account name when the username and password match, otherwise null. */
export function checkLogin(username: string, password: string): StaffUser | null {
  const name = username.trim().toLowerCase();
  // Compare against a dummy when the username is unknown so timing doesn't reveal valid names.
  const expected = isAccount(name) ? process.env[ACCOUNTS[name].env] : undefined;
  const ok = safeEqual(password, expected || "\0unset");
  return ok && expected && isAccount(name) ? name : null;
}

export async function startStaffSession(user: StaffUser) {
  const payload = `${user}.${Date.now() + MAX_AGE * 1000}`;
  (await cookies()).set(STAFF_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endStaffSession() {
  (await cookies()).delete(STAFF_COOKIE);
}

export async function staffUser(): Promise<StaffUser | null> {
  // Session checks compare against the current time, so they must run at request time.
  await connection();
  const value = (await cookies()).get(STAFF_COOKIE)?.value;
  if (!value) return null;
  const [user, expires, sig, ...rest] = value.split(".");
  if (rest.length || !user || !expires || !sig || !isAccount(user)) return null;
  try {
    if (!safeEqual(sig, sign(`${user}.${expires}`))) return null;
  } catch {
    return null;
  }
  return Number(expires) > Date.now() ? user : null;
}

/** Any staff account: door check-in and the staff view of a pass. */
export async function isStaff() {
  return (await staffUser()) !== null;
}

/** Only the host account: the guest list. */
export async function isHost() {
  const user = await staffUser();
  return user !== null && ACCOUNTS[user].admin;
}
