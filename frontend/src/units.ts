/**
 * One way to write every quantity on screen. Precision matches what the
 * reading can honestly support: waves to a tenth of a metre, wind and
 * distance to the whole unit, money grouped the Indian way.
 */

const INDIAN = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";

/** ₹ with lakh grouping: 125000 → "₹1,25,000". */
export function rupees(n: number | null | undefined): string {
  return n == null || !Number.isFinite(n) ? DASH : `₹${INDIAN.format(Math.round(n))}`;
}

/** Wave or swell height in metres, one decimal. */
export function metres(n: number | null | undefined): string {
  return n == null || !Number.isFinite(n) ? DASH : n.toFixed(1);
}

/** Wind or boat speed in km/h, whole number. */
export function kmh(n: number | null | undefined): string {
  return n == null || !Number.isFinite(n) ? DASH : String(Math.round(n));
}

/** Distance in km: one decimal under 10 km, where it matters; whole beyond. */
export function kilometres(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return DASH;
  return n < 10 ? n.toFixed(1) : String(Math.round(n));
}

/** 95 → "1 h 35 min"; 40 → "40 min". */
export function duration(minutes: number | null | undefined): string {
  if (minutes == null || !Number.isFinite(minutes)) return DASH;
  const m = Math.round(minutes);
  const h = Math.floor(m / 60);
  return h ? `${h} h${m % 60 ? ` ${m % 60} min` : ""}` : `${m} min`;
}

/** 18.922, 72.835 → "18.922° N, 72.835° E" (hemispheres spelled, never a bare minus). */
export function position(lat: number, lon: number, places = 3): string {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(places)}° ${ns}, ${Math.abs(lon).toFixed(places)}° ${ew}`;
}
