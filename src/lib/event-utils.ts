/* ============================================================
   EVENT UTILITIES
   Capacity calculations, availability badges, date formatting
   ============================================================ */

export type AvailabilityStatus = "available" | "limited" | "sold_out";

export interface AvailabilityBadge {
  label: string;
  color: string;
  bgColor: string;
}

/**
 * Calculate capacity percentage (0–100).
 * reservations is an array of reservation objects (each may have guestCount).
 * Falls back to array length if no guestCount property.
 */
export function calcCapacityPercent(
  capacity: number,
  reservations: { guestCount?: number }[]
): number {
  if (capacity <= 0) return 100;
  const reserved = reservations.reduce(
    (sum, r) => sum + (r.guestCount ?? 1),
    0
  );
  return Math.min(100, Math.round((reserved / capacity) * 100));
}

/**
 * Determine availability badge from capacity percentage.
 *   0–74%  → Available  (green)
 *   75–99% → Limited   (amber)
 *   100%+  → Sold Out  (tertiary/muted)
 */
export function getAvailability(
  capacity: number,
  reservations: { guestCount?: number }[]
): AvailabilityBadge {
  const pct = calcCapacityPercent(capacity, reservations);

  if (pct >= 100) {
    return { label: "Sold Out", color: "var(--color-text-tertiary)", bgColor: "var(--color-bg-elevated)" };
  }
  if (pct >= 75) {
    return { label: "Limited", color: "var(--color-neon-amber)", bgColor: "rgba(245, 158, 11, 0.15)" };
  }
  return { label: "Available", color: "var(--color-neon-green)", bgColor: "rgba(34, 197, 94, 0.15)" };
}

/**
 * Format a date string into a readable date label.
 * e.g. "Sat, Jun 20"
 */
export function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "TBA";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date string into a time label.
 * e.g. "10:00 PM"
 */
export function formatEventTime(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
