/* ============================================================
   EVENT MAPPERS
   Prisma Event → UI EventDetail
   Isolates UI from database schema.
   ============================================================ */

import type { Event, Reservation } from "@prisma/client";

/* ---- UI-facing types (no Prisma imports needed by components) ---- */

export interface UIReservation {
  id: string;
  guestCount: number;
  status: string;
}

export interface EventDetail {
  id: string;
  slug: string;
  title: string;
  venue: string;
  startDate: string;
  coverImage: string | null;
  description: string | null;
  capacity: number;
  reservations: UIReservation[];
}

/* ---- Mapper ---- */

/**
 * Map a Prisma Event (with nested reservations) to the UI-facing EventDetail.
 * `slug` is derived from the event id (or could be a URL-safe name).
 */
export function mapEventToDetail(event: Event & { reservations: Reservation[] }): EventDetail {
  return {
    id: event.id,
    slug: event.id,
    title: event.name,
    venue: event.venue,
    startDate: event.date.toISOString(),
    coverImage: event.bannerUrl ?? null,
    description: event.description ?? null,
    capacity: event.capacity,
    reservations: event.reservations.map((r) => ({
      id: r.id,
      guestCount: r.guestCount,
      status: r.status,
    })),
  };
}
