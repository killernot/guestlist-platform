import Head from "next/head";
import Link from "next/link";

interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  capacity: number;
  description?: string | null;
}

export default function Hero({ events }: { events: Event[] }) {
  return (
    <>
      <Head>
        <title>SaloSaloSessionsPH — Underground Manila Collective</title>
        <meta
          name="description"
          content="SaloSaloSessionsPH — Manila's underground house & electronic collective. Join the guestlist. Feel the signal."
        />
      </Head>

      {/* ── Full-bleed background layer ── */}
      <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg-base)]">
        {/* Noise texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />

        {/* Radial glow — purple/pink aura behind wordmark */}
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <div className="h-[600px] w-[800px] -translate-y-20 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.18)_0%,rgba(236,72,153,0.08)_40%,transparent_70%)]" />
        </div>

        {/* Banderitas string — decorative triangle pennant banner */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 flex justify-center overflow-hidden">
          <svg
            viewBox="0 0 1440 60"
            className="w-full max-w-[1440px] opacity-30"
            preserveAspectRatio="none"
          >
            {/* String */}
            <path d="M0 8 Q720 30 1440 8" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
            {/* Triangular pennants */}
            {Array.from({ length: 18 }).map((_, i) => {
              const x = 40 + i * 78;
              const y = 8 + Math.sin((i / 17) * Math.PI) * 18;
              const colors = ["#A855F7", "#EC4899", "#F59E0B", "#3B82F6", "#22C55E"];
              const color = colors[i % colors.length];
              return (
                <polygon
                  key={i}
                  points={`${x - 18},${y} ${x + 18},${y} ${x},${y + 28}`}
                  fill={color}
                  opacity={0.6}
                />
              );
            })}
          </svg>
        </div>

        {/* ── Main content ── */}
        <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-20 pb-16 text-center">
          {/* Puzzle icon */}
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--color-border-default)] bg-white/5 backdrop-blur-md">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.315 8.685a.98.98 0 0 1 .837-.276c.47.07.802.48.968.925a2.501 2.501 0 1 0 3.214-3.214c-.446-.166-.855-.497-.925-.968a.979.979 0 0 1 .276-.837l1.61-1.61a2.404 2.404 0 0 1 1.705-.707c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z" />
            </svg>
          </div>

          {/* Wordmark */}
          <h1 className="font-[var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl lg:text-8xl">
            <span className="text-[var(--color-text-primary)]">SALO</span>
            <span className="text-[var(--color-text-primary)]">SALO</span>
            <span className="text-[var(--color-text-primary)]">SESSIONS</span>
            <span className="ml-2 text-[#F59E0B]">PH</span>
          </h1>

          {/* Tagline */}
          <p className="mt-4 max-w-lg font-[var(--font-body)] text-base text-[var(--color-text-secondary)] sm:text-lg md:text-xl">
            Manila's underground house &amp; electronic collective.
            <br className="hidden sm:block" />
            <span className="text-[var(--color-text-tertiary)]">
              Feel the signal. Join the session.
            </span>
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/events"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-[var(--radius-button)] border border-[var(--color-border-default)] bg-white/10 px-8 py-3.5 font-[var(--font-display)] text-sm font-semibold tracking-wider text-white backdrop-blur-xl transition-all duration-300 hover:border-[var(--color-neon-purple)] hover:bg-[var(--color-neon-purple)]/20 hover:shadow-[var(--shadow-glow)]"
            >
              <span className="relative z-10">JOIN THE GUESTLIST</span>
              <svg
                className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-[var(--color-border-default)] bg-transparent px-6 py-3.5 font-[var(--font-display)] text-xs font-medium tracking-widest text-[var(--color-text-tertiary)] backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-secondary)]"
            >
              LOGIN
            </Link>
          </div>

          {/* Upcoming events glass panel */}
          {events.length > 0 && (
            <div className="mt-16 w-full max-w-3xl">
              <div className="rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
                <h2 className="mb-4 font-[var(--font-display)] text-xs font-semibold tracking-[0.2em] text-[var(--color-text-tertiary)]">
                  UPCOMING SESSIONS
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {events.slice(0, 6).map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="group rounded-[var(--radius-input)] border border-[var(--color-border-default)] bg-white/[0.02] p-4 text-left transition-all duration-200 hover:border-[var(--color-neon-purple)]/40 hover:bg-white/[0.05]"
                    >
                      <h3 className="font-[var(--font-body)] text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-neon-purple)]">
                        {event.name}
                      </h3>
                      <p className="mt-1 font-[var(--font-mono)] text-xs text-[var(--color-text-tertiary)]">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                        {event.venue}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bottom banderitas accent */}
          <div className="pointer-events-none mt-auto pt-16 opacity-20">
            <div className="flex justify-center gap-1">
              {Array.from({ length: 40 }).map((_, i) => {
                const colors = ["#A855F7", "#EC4899", "#F59E0B", "#3B82F6", "#22C55E", "#EF4444"];
                return (
                  <div
                    key={i}
                    className="h-3 w-2"
                    style={{
                      backgroundColor: colors[i % colors.length],
                      clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 py-6 text-center font-[var(--font-mono)] text-xs text-[var(--color-text-tertiary)]">
          © 2026 SaloSaloSessionsPH — All rights reserved.
        </footer>
      </div>
    </>
  );
}
