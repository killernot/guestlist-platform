/* ============================================================
   EVENT CARD COMPONENT — Phase 3 Upgrade
   Nightlife-first design, warm brand palette, real urgency
   ============================================================ */

import Link from "next/link";
import { getAvailability, formatEventDate, formatEventTime } from "../../lib/event-utils";

export interface EventCardProps {
  id: string;
  slug: string;
  title: string;
  venue: string;
  startDate: string;
  coverImage?: string | null;
  capacity: number;
  reservations: { guestCount?: number }[];
}

export default function EventCard({
  id,
  slug,
  title,
  venue,
  startDate,
  coverImage,
  capacity,
  reservations,
}: EventCardProps) {
  const badge = getAvailability(capacity, reservations);
  const dateLabel = formatEventDate(startDate);
  const timeLabel = formatEventTime(startDate);

  const reservationCount = reservations.length;
  const reservedCount = reservations.reduce((s, r) => s + (r.guestCount ?? 1), 0);
  const spotsLeft = Math.max(0, capacity - reservedCount);
  const capacityFilledPercent = capacity > 0 ? Math.round((reservedCount / capacity) * 100) : 0;
  const isAlmostFull = capacityFilledPercent >= 80 && spotsLeft > 0;
  const isFillingFast = capacityFilledPercent >= 60 && capacityFilledPercent < 80;
  const isTrending = reservationCount > capacity * 0.3;
  const isHot = reservationCount > capacity * 0.6;

  const eventDate = new Date(startDate);
  const now = new Date();
  const daysSinceCreated = Math.floor((now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
  const isNew = daysSinceCreated >= 0 && daysSinceCreated <= 5;

  return (
    <Link
      href={`/events/${slug}`}
      className="group block outline-none"
      aria-label={`${title} at ${venue} on ${dateLabel}`}
    >
      <article
        className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] transition-all duration-300 hover:border-[var(--color-neon-orange)]/40 hover:shadow-[0_0_20px_rgba(232,122,36,0.12)] focus-visible:border-[var(--color-neon-orange)] focus-visible:ring-2 focus-visible:ring-[var(--color-neon-orange)]/40"
        tabIndex={-1}
      >
        {/* Cover image */}
        {coverImage ? (
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <img
              src={coverImage}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-surface)] via-[var(--color-bg-surface)]/20 to-transparent" />
          </div>
        ) : (
          <div className="relative flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br from-[rgba(232,122,36,0.08)] to-[rgba(245,197,66,0.05)]">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-text-tertiary)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-30"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}

        {/* Urgency badges — top-left */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {isNew && (
            <span className="inline-flex items-center gap-1 rounded-[var(--radius-badge)] bg-[var(--color-neon-gold)]/20 px-2.5 py-1 font-[var(--font-body)] text-[10px] font-bold uppercase tracking-wide text-[var(--color-neon-gold)]">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              New
            </span>
          )}
          {isAlmostFull && (
            <span className="inline-flex items-center gap-1 rounded-[var(--radius-badge)] bg-[var(--color-neon-red)]/20 px-2.5 py-1 font-[var(--font-body)] text-[10px] font-bold uppercase tracking-wide text-[var(--color-neon-red)] animate-pulse">
              Only {spotsLeft} left
            </span>
          )}
          {isFillingFast && !isAlmostFull && (
            <span className="inline-flex items-center gap-1 rounded-[var(--radius-badge)] bg-[var(--color-neon-amber)]/20 px-2.5 py-1 font-[var(--font-body)] text-[10px] font-bold uppercase tracking-wide text-[var(--color-neon-amber)]">
              Filling Fast
            </span>
          )}
        </div>

        {/* Availability badge — top-right */}
        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
          <span
            className="rounded-[var(--radius-badge)] px-3 py-1 font-[var(--font-body)] text-[11px] font-semibold tracking-wide uppercase"
            style={{
              color: badge.color,
              backgroundColor: badge.bgColor,
            }}
          >
            {badge.label}
          </span>
          {isTrending && (
            <span className="flex items-center gap-1 rounded-[var(--radius-badge)] bg-[var(--color-neon-amber)]/20 px-2 py-0.5 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neon-amber)]">
              {isHot && <span className="text-xs">🔥</span>}
              Trending
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          {/* Social proof — real data only */}
          {reservationCount > 0 && (
            <div className="mb-2 flex items-center gap-3 font-[var(--font-body)] text-[11px] text-[var(--color-text-tertiary)]">
              <span className="flex items-center gap-1">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[var(--color-text-tertiary)]"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                {reservationCount} going
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="font-[var(--font-display)] text-lg font-bold leading-tight text-[var(--color-text-primary)] transition-colors duration-200 group-hover:text-[var(--color-neon-orange)] sm:text-xl">
            {title}
          </h3>

          {/* Venue */}
          <p className="mt-1.5 flex items-center gap-1.5 font-[var(--font-body)] text-sm text-[var(--color-text-secondary)]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-70">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {venue}
          </p>

          {/* Date & Time */}
          <div className="mt-3 flex items-center gap-2 font-[var(--font-mono)] text-xs text-[var(--color-text-tertiary)]">
            <time dateTime={startDate}>{dateLabel}</time>
            {timeLabel && (
              <>
                <span className="opacity-40">•</span>
                <time dateTime={startDate}>{timeLabel}</time>
              </>
            )}
          </div>

          {/* Capacity bar */}
          <div className="mt-3">
            <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--color-bg-elevated)]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(capacityFilledPercent, 2)}%`,
                  background: isAlmostFull
                    ? "linear-gradient(90deg, #EF4444 0%, #F87171 100%)"
                    : isFillingFast
                    ? "linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)"
                    : "linear-gradient(90deg, #E87A24 0%, #F5C542 100%)",
                }}
              />
            </div>
            <p className="mt-1 text-[10px] text-[var(--color-text-tertiary)]">
              {spotsLeft} of {capacity} spots remaining
            </p>
          </div>

          {/* CTA */}
          <div className="mt-4 flex items-center justify-center gap-2 rounded-[var(--radius-button)] bg-gradient-to-r from-[var(--color-neon-orange)] to-[var(--color-neon-gold)] px-4 py-2.5 font-[var(--font-display)] text-sm font-semibold tracking-wide text-[var(--color-text-inverse)] transition-all duration-300 group-hover:shadow-[0_0_16px_rgba(232,122,36,0.2)] group-hover:scale-[1.02]">
            Reserve Spot
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  );
}
