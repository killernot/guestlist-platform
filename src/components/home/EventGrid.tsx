/* ============================================================
   EVENT GRID SECTION
   Responsive grid of event cards with loading skeleton
   ============================================================ */

import Link from "next/link";
import EventCard from "../events/EventCard";

interface EventGridProps {
  events: Array<{
    id: string;
    name: string;
    date: string;
    venue: string;
    capacity: number;
    bannerUrl?: string | null;
    description?: string | null;
    reservations?: { guestCount: number }[];
  }>;
  isLoading?: boolean;
}

function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
      {/* Image placeholder */}
      <div className="aspect-[16/9] animate-pulse bg-[var(--color-bg-elevated)]" />
      {/* Content placeholder */}
      <div className="p-4 sm:p-5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-[var(--color-bg-elevated)]" />
        <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-[var(--color-bg-elevated)]" />
        <div className="mt-3 flex gap-3">
          <div className="h-3 w-20 animate-pulse rounded bg-[var(--color-bg-elevated)]" />
          <div className="h-3 w-16 animate-pulse rounded bg-[var(--color-bg-elevated)]" />
        </div>
      </div>
    </div>
  );
}

export default function EventGrid({
  events,
  isLoading = false,
}: EventGridProps) {
  if (isLoading) {
    return (
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h2 className="font-[var(--font-display)] text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
              Featured Events
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="font-[var(--font-display)] text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
            Featured Events
          </h2>
          <p className="mt-4 font-[var(--font-body)] text-[var(--color-text-secondary)]">
            No upcoming events at the moment. Check back soon!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative px-4 py-16 sm:py-20">
      {/* Section gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-bg-surface)]/30 to-transparent" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h2 className="font-[var(--font-display)] text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl md:text-4xl">
            Featured Events
          </h2>
          <p className="mt-3 font-[var(--font-body)] text-base text-[var(--color-text-secondary)]">
            Hand-picked events you don&apos;t want to miss
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              slug={event.id}
              title={event.name}
              venue={event.venue}
              startDate={event.date}
              coverImage={event.bannerUrl ?? null}
              capacity={event.capacity}
              reservations={event.reservations ?? []}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/events"
            className="group inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-6 py-3 font-[var(--font-body)] text-sm font-medium text-[var(--color-text-secondary)] transition-all duration-300 hover:border-[var(--color-neon-orange)]/40 hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] hover:shadow-[0_0_16px_rgba(232,122,36,0.1)]"
          >
            View All Events
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
