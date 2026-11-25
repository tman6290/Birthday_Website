const TZ = "Africa/Lagos";

export function formatTime(iso: string | Date | null) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true })
    .format(new Date(iso))
    .replace(/\s?([ap])\.?m\.?/i, " $1m")
    .toLowerCase();
}

export function formatDate(iso: string | Date | null) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso),
  );
}
