/* ============================================================
   HOMEPAGE — Phase 3 Redesign
   Nightlife-first hero, honest messaging, warm brand palette
   ============================================================ */

import Head from "next/head";
import Link from "next/link";
import EventGrid from "../src/components/home/EventGrid";
import StatsSection from "../src/components/home/StatsSection";
import CTASection from "../src/components/home/CTASection";

interface Event {
  id: string;
  name: string;
  slug: string;
  date: string;
  venue: string;
  capacity: number;
  bannerUrl?: string | null;
  description?: string | null;
}

interface HomePageProps {
  events: Event[];
  stats: {
    totalEvents: number;
    totalReservations: number;
  };
}

export async function getServerSideProps() {
  try {
    const { default: prisma } = await import("../lib/prism");

    const [events, totalEvents, totalReservations] = await Promise.all([
      prisma.event.findMany({
        orderBy: { date: "asc" },
        where: { date: { gte: new Date() } },
        take: 6,
        include: {
          reservations: {
            where: { status: "APPROVED" },
            select: { guestCount: true },
          },
        },
      }),
      prisma.event.count(),
      prisma.reservation.count(),
    ]);

    return {
      props: {
        events: events.map((e) => ({
          id: e.id,
          name: e.name,
          slug: e.slug,
          date: e.date.toISOString(),
          venue: e.venue,
          capacity: e.capacity,
          bannerUrl: e.bannerUrl ?? null,
          description: e.description ?? null,
          reservations: e.reservations?.map((r: any) => ({ guestCount: r.guestCount })) ?? [],
        })),
        stats: {
          totalEvents,
          totalReservations,
        },
      },
    };
  } catch {
    return {
      props: {
        events: [],
        stats: { totalEvents: 0, totalReservations: 0 },
      },
    };
  }
}

/* ---- Hero Section — Nightlife-first ---- */
function HeroSection() {
  return (
    <section className="relative min-h-[92vh] overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[var(--color-bg-base)]">
        {/* Warm ambient glow — top center */}
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <div className="h-[500px] w-[700px] -translate-y-10 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(232,122,36,0.12)_0%,rgba(245,197,66,0.05)_40%,transparent_70%)]" />
        </div>
        {/* Bottom warm ambient */}
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-[300px] w-[500px] -translate-x-1/2 translate-y-1/3 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(245,197,66,0.06)_0%,transparent_70%)]" />
        {/* Subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
        {/* Noise texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />
      </div>

      {/* Main content */}
      <main className="relative z-10 flex min-h-[92vh] flex-col items-center justify-center px-4 pt-20 pb-20 text-center">
        {/* Status badge — honest, no fake metrics */}
        <div className="mb-8 inline-flex items-center gap-2.5 rounded-[var(--radius-badge)] border border-[var(--color-border-default)] bg-white/[0.04] px-4 py-2 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-neon-gold)] animate-pulse" />
          <span className="font-[var(--font-body)] text-xs font-medium tracking-wide text-[var(--color-text-secondary)]">
            New platform — first events dropping soon
          </span>
        </div>

        {/* Headline — direct, premium, no fluff */}
        <h1 className="max-w-4xl font-[var(--font-display)] text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          <span className="text-[var(--color-text-primary)]">Your Night. </span>
          <span className="text-gradient">Your Spot.</span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 max-w-lg font-[var(--font-body)] text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg md:text-xl">
          Skip the line. Guestlist access to Manila&apos;s best clubs,
          events, and DJ sets — straight from your phone.
        </p>

        {/* Single primary CTA */}
        <div className="mt-10">
          <Link
            href="/events"
            className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-[var(--radius-button)] bg-gradient-to-r from-[var(--color-neon-orange)] to-[var(--color-neon-gold)] px-10 py-4 font-[var(--font-display)] text-sm font-semibold tracking-widest uppercase text-[var(--color-text-inverse)] shadow-[0_0_24px_rgba(232,122,36,0.25)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_32px_rgba(232,122,36,0.4)] sm:text-base"
          >
            <span className="relative z-10">Find Your Next Night Out</span>
            <svg
              className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>

        {/* Trust line — honest, no fake numbers */}
        <p className="mt-6 font-[var(--font-body)] text-xs text-[var(--color-text-tertiary)] sm:text-sm">
          Free guestlist • No credit card required • Built in Manila
        </p>

        {/* Scroll indicator */}
        <div className="mt-16 flex flex-col items-center gap-2 opacity-30">
          <span className="font-[var(--font-mono)] text-[10px] tracking-[0.2em] uppercase text-[var(--color-text-tertiary)]">
            Explore
          </span>
          <div className="h-8 w-5 rounded-full border border-[var(--color-text-tertiary)] p-1">
            <div className="h-2 w-full animate-bounce rounded-full bg-[var(--color-text-tertiary)]" />
          </div>
        </div>
      </main>
    </section>
  );
}

/* ---- Featured Events Preview (below hero) ---- */
function FeaturedPreview({ events }: { events: Event[] }) {
  if (events.length === 0) return null;

  return (
    <section className="relative px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h2 className="font-[var(--font-display)] text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl md:text-4xl">
            Upcoming Events
          </h2>
          <p className="mt-3 font-[var(--font-body)] text-base text-[var(--color-text-secondary)]">
            Secure your spot before it&apos;s too late
          </p>
        </div>

        {/* Compact event list */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.slice(0, 6).map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug || event.id}`}
              className="group flex items-center gap-4 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]/60 p-4 backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-neon-orange)]/30 hover:bg-[var(--color-bg-surface)] hover:shadow-[0_0_16px_rgba(232,122,36,0.1)]"
            >
              {/* Date badge */}
              <div className="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-[var(--radius-input)] bg-gradient-to-br from-[var(--color-neon-orange)]/15 to-[var(--color-neon-gold)]/10 border border-[var(--color-neon-orange)]/20">
                <span className="font-[var(--font-mono)] text-[10px] font-bold uppercase text-[var(--color-neon-orange)]">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    month: "short",
                  })}
                </span>
                <span className="font-[var(--font-display)] text-lg font-bold text-[var(--color-text-primary)]">
                  {new Date(event.date).getDate()}
                </span>
              </div>

              {/* Event info */}
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-[var(--font-body)] text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-neon-orange)]">
                  {event.name}
                </h3>
                <p className="mt-0.5 truncate font-[var(--font-body)] text-xs text-[var(--color-text-tertiary)]">
                  {event.venue}
                </p>
              </div>

              {/* Arrow */}
              <svg
                className="h-4 w-4 flex-shrink-0 text-[var(--color-text-tertiary)] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[var(--color-neon-orange)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/events"
            className="font-[var(--font-body)] text-sm font-medium text-[var(--color-neon-orange)] transition-colors duration-200 hover:text-[var(--color-neon-gold)]"
          >
            View all events →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---- Empty State ---- */
function EmptyState() {
  return (
    <section className="relative px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
          <svg className="h-7 w-7 text-[var(--color-neon-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="font-[var(--font-display)] text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
          First events are being curated
        </h2>
        <p className="mt-4 font-[var(--font-body)] text-base text-[var(--color-text-secondary)]">
          We are working with Manila&apos;s best venues and DJs to bring you
          something worth waiting for.
        </p>
        <div className="mt-8">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-6 py-3 font-[var(--font-body)] text-sm font-medium text-[var(--color-text-secondary)] transition-all duration-300 hover:border-[var(--color-neon-orange)]/40 hover:text-[var(--color-text-primary)]"
          >
            Get notified when events drop
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---- Main Page Component ---- */
export default function HomePage({ events, stats }: HomePageProps) {
  return (
    <>
      <Head>
        <title>GUESTLIST — Your Night. Your Spot.</title>
        <meta
          name="description"
          content="Guestlist access to Manila's best clubs, events, and DJ sets. Skip the line. Reserve your spot."
        />
      </Head>

      <div className="min-h-screen bg-[var(--color-bg-base)]">
        {/* Hero Section */}
        <HeroSection />

        {/* Gradient divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-neon-orange)]/20 to-transparent" />

        {/* Featured Events Preview or Empty State */}
        {events.length > 0 ? (
          <FeaturedPreview events={events} />
        ) : (
          <EmptyState />
        )}

        {/* Gradient divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border-default)] to-transparent" />

        {/* Full Event Grid */}
        <EventGrid events={events} />

        {/* Stats Section */}
        <StatsSection totalEvents={stats.totalEvents} totalReservations={stats.totalReservations} />

        {/* CTA Section */}
        <CTASection />

        {/* Footer */}
        <footer className="border-t border-[var(--color-border-default)] px-4 py-8 text-center">
          <p className="font-[var(--font-mono)] text-xs text-[var(--color-text-tertiary)]">
            © 2026 GUESTLIST — All rights reserved. Made in Manila.
          </p>
        </footer>
      </div>
    </>
  );
}
