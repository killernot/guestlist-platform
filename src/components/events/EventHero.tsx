/* ============================================================
   EVENT HERO COMPONENT
   Hero section for the Event Detail page.
   Cover image, title, venue, date/time, availability badge.
   ============================================================ */

import type { EventDetail } from "../../lib/event-mappers";
import { getAvailability, formatEventDate, formatEventTime } from "../../lib/event-utils";

interface EventHeroProps {
  event: EventDetail;
}

export default function EventHero({ event }: EventHeroProps) {
  const badge = getAvailability(event.capacity, event.reservations);
  const dateLabel = formatEventDate(event.startDate);
  const timeLabel = formatEventTime(event.startDate);

  return (
    <section className="relative overflow-hidden">
      {/* Cover image or gradient placeholder */}
      {event.coverImage ? (
        <div className="relative aspect-[21/9] w-full overflow-hidden sm:aspect-[21/7]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.coverImage}
            alt=""
            className="h-full w-full object-cover"
          />
          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-base)] via-[var(--color-bg-base)]/60 to-transparent" />
        </div>
      ) : (
        <div className="relative flex aspect-[21/9] w-full items-center justify-center bg-gradient-to-br from-[rgba(232,122,36,0.12)] to-[rgba(245,197,66,0.06)] sm:aspect-[21/7]">
          <div className="h-24 w-24 rounded-full bg-[var(--color-bg-elevated)] opacity-30" />
        </div>
      )}

      {/* Content overlay */}
      <div className="absolute inset-0 flex items-end">
        <div className="w-full px-4 pb-6 sm:px-8 sm:pb-10 lg:px-12 lg:pb-12">
          <div className="mx-auto max-w-5xl">
            {/* Availability badge */}
            <span
              className="mb-3 inline-block rounded-[var(--radius-badge)] px-3 py-1 font-[var(--font-body)] text-[11px] font-semibold tracking-wide uppercase sm:mb-4"
              style={{
                color: badge.color,
                backgroundColor: badge.bgColor,
              }}
            >
              {badge.label}
            </span>

            {/* Title */}
            <h1 className="font-[var(--font-display)] text-3xl font-bold leading-tight text-[var(--color-text-primary)] sm:text-4xl md:text-5xl lg:text-6xl">
              {event.title}
            </h1>

            {/* Venue */}
            <p className="mt-2 font-[var(--font-body)] text-base text-[var(--color-text-secondary)] sm:mt-3 sm:text-lg md:text-xl">
              {event.venue}
            </p>

            {/* Date & Time */}
            <div className="mt-3 flex flex-wrap items-center gap-2 font-[var(--font-mono)] text-xs text-[var(--color-text-tertiary)] sm:mt-4 sm:gap-3 sm:text-sm">
              <time dateTime={event.startDate}>{dateLabel}</time>
              {timeLabel && (
                <>
                  <span className="opacity-40">•</span>
                  <time dateTime={event.startDate}>{timeLabel}</time>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
