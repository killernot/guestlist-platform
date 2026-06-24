/* ============================================================
   CTA SECTION COMPONENT
   Single call-to-action with warm brand gradient
   ============================================================ */

import Link from "next/link";

export default function CTASection() {
  return (
    <section className="relative overflow-hidden px-4 py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(232,122,36,0.08)] via-[var(--color-bg-base)] to-[rgba(245,197,66,0.04)]" />

      {/* Decorative glow orbs */}
      <div className="pointer-events-none absolute top-0 left-1/4 h-64 w-64 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(232,122,36,0.12)_0%,transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(245,197,66,0.08)_0%,transparent_70%)] blur-3xl" />

      {/* Subtle grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Decorative top accent */}
        <div className="mb-8 flex justify-center">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-[var(--color-neon-orange)] to-transparent" />
        </div>

        <h2 className="font-[var(--font-display)] text-3xl font-bold leading-tight text-[var(--color-text-primary)] sm:text-4xl md:text-5xl lg:text-6xl">
          Ready for your next
          <br />
          <span className="text-gradient">night out?</span>
        </h2>

        <p className="mx-auto mt-6 max-w-xl font-[var(--font-body)] text-base text-[var(--color-text-secondary)] sm:text-lg">
          Discover exclusive events, secure your spot on the guestlist,
          and experience Manila nightlife without the wait.
        </p>

        <div className="mt-10">
          <Link
            href="/events"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-[var(--radius-button)] bg-gradient-to-r from-[var(--color-neon-orange)] to-[var(--color-neon-gold)] px-8 py-4 font-[var(--font-display)] text-sm font-semibold tracking-wider uppercase text-[var(--color-text-inverse)] shadow-[0_0_24px_rgba(232,122,36,0.25)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_32px_rgba(232,122,36,0.4)]"
          >
            <span className="relative z-10">Explore Events</span>
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

        {/* Decorative bottom accent */}
        <div className="mt-12 flex justify-center">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-[var(--color-neon-gold)] to-transparent" />
        </div>
      </div>
    </section>
  );
}
