import "server-only";
import type { Guest } from "./guests";

export async function sendPassEmail(guest: Guest): Promise<boolean> {
  void guest;
  return false;
}
