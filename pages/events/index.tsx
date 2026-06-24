import Head from "next/head";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";

interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  capacity: number;
  description?: string | null;
  bannerUrl?: string | null;
}

interface EventsPageProps {
  events: Event[];
}

type FilterChip = "all" | "today" | "week" | "weekend";

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isThisWeek(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return d >= startOfWeek && d < endOfWeek;
}

function isWeekend(dateStr: string): boolean {
  const d = new Date(dateStr);
  const day = d.getDay();
  return day === 0 || day === 6;
}

function EventCard({ event }: { event: Event }) {
  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const formattedTime = new Date(event.date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-neon-orange)]/30 hover:shadow-[0_0_16px_rgba(232,122,36,0.1)]"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--color-bg-elevated)]">
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[rgba(232,122,36,0.08)] to-[rgba(245,197,66,0.04)]">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-30">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--color-bg-surface)] to-transparent" />
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-[var(--font-display)] text-base font-semibold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-neon-orange)]">
          {event.name}
        </h3>
        <div className="mt-2 flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{formattedDate} • {formattedTime}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{event.venue}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
            {event.capacity} capacity
          </span>
          <span className="rounded-[var(--radius-badge)] bg-[var(--color-neon-green)]/15 px-2 py-0.5 font-[var(--font-body)] text-[10px] font-bold uppercase text-[var(--color-neon-green)]">
            Guestlist Open
          </span>
        </div>
      </div>
    </Link>
  );
}

function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
      <div className="aspect-[16/10] animate-pulse bg-[var(--color-bg-elevated)]" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--color-bg-elevated)]" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-[var(--color-bg-elevated)]" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-[var(--color-bg-elevated)]" />
      </div>
    </div>
  );
}

const FILTERS: { key: FilterChip; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "weekend", label: "Weekend" },
];

export default function EventsPage({ events }: EventsPageProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterChip>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(t);
  }, []);

  const filteredEvents = useMemo(() => {
    let result = events;

    if (activeFilter === "today") {
      result = result.filter((e) => isToday(e.date));
    } else if (activeFilter === "week") {
      result = result.filter((e) => isThisWeek(e.date));
    } else if (activeFilter === "weekend") {
      result = result.filter((e) => isWeekend(e.date));
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q)
      );
    }

    return result;
  }, [events, search, activeFilter]);

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
      <Head>
        <title>Events | GUESTLIST</title>
        <meta
          name="description"
          content="Browse upcoming events and reserve your spot on the guestlist."
        />
      </Head>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[var(--color-border-default)] bg-[var(--color-bg-base)]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="font-[var(--font-display)] text-lg font-bold tracking-tight text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-neon-orange)]"
          >
            <span className="text-[var(--color-neon-orange)]">G</span>UESTLIST
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
            >
              Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="font-[var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">
            Upcoming Events
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Browse events and secure your spot on the guestlist.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative w-full sm:max-w-sm">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events or venues..."
              className="w-full rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]/80 py-2.5 pl-11 pr-4 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] backdrop-blur-xl transition-all duration-200 focus:border-[var(--color-neon-orange)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(232,122,36,0.12)]"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
                  activeFilter === f.key
                    ? "border border-[var(--color-neon-orange)] bg-[var(--color-neon-orange)]/15 text-[var(--color-neon-orange)]"
                    : "border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-text-primary)]">
              No events found
            </h3>
            <p className="mt-1 max-w-sm text-sm text-[var(--color-text-tertiary)]">
              {search
                ? `No events match "${search}". Try a different search term.`
                : "There are no events matching this filter. Check back soon!"}
            </p>
            <button
              onClick={() => {
                setSearch("");
                setActiveFilter("all");
              }}
              className="mt-4 rounded-[var(--radius-button)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-4 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[var(--color-border-default)] py-6 text-center font-[var(--font-mono)] text-xs text-[var(--color-text-tertiary)]">
        © 2026 GUESTLIST — All rights reserved. Made in Manila.
      </footer>
    </div>
  );
}

export const getServerSideProps = async () => {
  try {
    const { default: prisma } = await import("../../lib/prism");

    const events = await prisma.event.findMany({
      orderBy: { date: "asc" },
      take: 50,
    });

    return {
      props: {
        events: events.map((e) => ({
          id: e.id,
          name: e.name,
          slug: e.name.toLowerCase().replace(/\s+/g, "-"),
          date: e.date.toISOString(),
          venue: e.venue,
          capacity: e.capacity,
          description: e.description,
          bannerUrl: e.bannerUrl,
        })),
      },
    };
  } catch {
    return { props: { events: [] } };
  }
};
