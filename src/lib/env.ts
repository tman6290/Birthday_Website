import "server-only";

/** Env values pasted into a dashboard can carry stray spaces or quotes; ignore them. */
export function envValue(name: string) {
  const v = process.env[name]?.trim();
  if (!v) return undefined;
  const quoted = v.match(/^(['"])(.*)\1$/);
  return quoted ? quoted[2] : v;
}
