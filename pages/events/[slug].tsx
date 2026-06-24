import Head from "next/head";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";

interface EventDetailProps {
  event: {
    id: string;
    name: string;
    date: string;
    venue: string;
    capacity: number;
    description: string | null;
    bannerUrl: string | null;
    approvedCount: number;
  };
}

/* ---- Helper Functions ---- */

function getCapacityColor(percent: number): string {
  if (percent > 50) return "var(--color-neon-green)";
  if (percent >= 20) return "var(--color-neon-amber)";
  return "var(--color-neon-red)";
}

function getCapacityGradient(percent: number): string {
  if (percent > 50) {
    return "linear-gradient(90deg, #22C55E 0%, #4ADE80 100%)";
  }
  if (percent >= 20) {
    return "linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)";
  }
  return "linear-gradient(90deg, #EF4444 0%, #F87171 100%)";
}

export default function EventDetail({ event }: EventDetailProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    instagram: "",
    guestCount: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const remaining = event.capacity - event.approvedCount;
  const capacityPercent = Math.round((remaining / event.capacity) * 100);
  const filledPercent = event.capacity > 0 ? Math.round((event.approvedCount / event.capacity) * 100) : 0;
  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = new Date(event.date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const isAlmostFullDetail = capacityPercent < 20 && remaining > 0;
  const isFillingFastDetail = capacityPercent >= 20 && capacityPercent <= 50;


  /* Sticky bar visibility */
  const handleScroll = useCallback(() => {
    if (!formRef.current) return;
    const rect = formRef.current.getBoundingClientRect();
    const isFormInView = rect.top < window.innerHeight && rect.bottom > 0;
    setShowStickyBar(!isFormInView);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          eventId: event.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error || "Failed to create reservation. Please try again."
        );
        return;
      }

      setSuccess(true);
      router.push(
        `/reservation-success?code=${encodeURIComponent(data.reservationCode)}&name=${encodeURIComponent(data.fullName)}&event=${encodeURIComponent(event.name)}&date=${encodeURIComponent(event.date)}&venue=${encodeURIComponent(event.venue)}&guests=${encodeURIComponent(String(data.guestCount))}`
      );
    } catch {
      setError(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: event.name,
      text: `Join me at ${event.name} at ${event.venue}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  if (router.isFallback) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-base)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-neon-orange)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
      <Head>
        <title>{`${event.name} | GUESTLIST`}</title>
        <meta
          name="description"
          content={event.description || "Reserve your spot before the doors open."}
        />
        <meta property="og:title" content={event.name} />
        <meta property="og:description" content={event.description || ""} />
        {event.bannerUrl && <meta property="og:image" content={event.bannerUrl} />}
        <meta property="og:type" content="website" />
      </Head>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[var(--color-border-default)] bg-[var(--color-bg-base)]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/events"
            className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Events
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-[var(--radius-badge)] border border-[var(--color-border-default)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
              aria-label="Share event"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Share
            </button>
            <Link
              href="/"
              className="font-[var(--font-display)] text-lg font-bold tracking-tight text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-neon-orange)]"
            >
              <span className="text-[var(--color-neon-orange)]">G</span>UESTLIST
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-0 sm:px-6">
        {/* Hero Section */}
        <div className="relative -mx-4 sm:-mx-6">
          <div className="relative h-[280px] w-full overflow-hidden sm:h-[380px] md:h-[460px]">
            {event.bannerUrl ? (
              <img
                src={event.bannerUrl}
                alt={event.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[rgba(232,122,36,0.15)] via-[var(--color-bg-elevated)] to-[rgba(245,197,66,0.08)]">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-base)] via-[var(--color-bg-base)]/40 to-transparent" />
          </div>

          {/* Event title overlay */}
          <div className="absolute inset-x-0 bottom-0 px-4 pb-8 sm:px-6 sm:pb-12">
            <div className="mx-auto max-w-5xl">
              {/* Availability badge */}
              {isAlmostFullDetail && (
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-[var(--radius-badge)] bg-[var(--color-neon-red)]/20 px-3 py-1 font-[var(--font-body)] text-[11px] font-bold uppercase tracking-wide text-[var(--color-neon-red)] animate-pulse">
                  Almost Full — {remaining} spots left
                </span>
              )}
              {isFillingFastDetail && !isAlmostFullDetail && (
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-[var(--radius-badge)] bg-[var(--color-neon-amber)]/20 px-3 py-1 font-[var(--font-body)] text-[11px] font-bold uppercase tracking-wide text-[var(--color-neon-amber)]">
                  Filling Fast
                </span>
              )}

              <h1 className="font-[var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                {event.name}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--color-text-secondary)]">
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {formattedDate} • {formattedTime}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {event.venue}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="py-8 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Left: Event Info */}
            <div className="lg:col-span-2">
              <div className="space-y-8">
                {/* Description */}
                {event.description && (
                  <div>
                    <h2 className="mb-3 font-[var(--font-display)] text-sm font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                      About This Event
                    </h2>
                    <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                      {event.description}
                    </p>
                  </div>
                )}

                {/* DJ Lineup */}
                <div>
                  <h2 className="mb-3 font-[var(--font-display)] text-sm font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    Lineup
                  </h2>
                  <div className="space-y-2">
                    {["TBA", "TBA", "TBA"].map((dj, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-[var(--radius-input)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-elevated)] font-[var(--font-mono)] text-xs font-bold text-[var(--color-neon-orange)]">
                          {i + 1}
                        </div>
                        <span className="font-[var(--font-body)] text-sm text-[var(--color-text-secondary)]">{dj}</span>
                        {i === 0 && <span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">Headliner</span>}
                        {i === 1 && <span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">Support</span>}
                        {i === 2 && <span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">Opener</span>}
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-[var(--color-text-tertiary)]">
                    Lineup announced closer to the event date.
                  </p>
                </div>

                {/* Venue Info */}
                <div>
                  <h2 className="mb-3 font-[var(--font-display)] text-sm font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    Venue
                  </h2>
                  <div className="rounded-[var(--radius-input)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4">
                    <p className="font-[var(--font-body)] text-sm font-semibold text-[var(--color-text-primary)]">
                      {event.venue.split(",")[0]}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                      {event.venue.split(",").slice(1).join(",").trim() || "Metro Manila"}
                    </p>
                    <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
                      Doors open 1 hour before the event starts. Present your reservation code at the guestlist entrance.
                    </p>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div>
                  <h2 className="mb-3 font-[var(--font-display)] text-sm font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    Availability
                  </h2>
                  <div className="rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-[var(--color-text-secondary)]">
                        {remaining} spots remaining
                      </span>
                      <span
                        className="font-mono text-xs font-bold"
                        style={{ color: getCapacityColor(capacityPercent) }}
                      >
                        {capacityPercent}% open
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-elevated)]">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.max(capacityPercent, 2)}%`,
                          background: getCapacityGradient(capacityPercent),
                        }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
                      {event.approvedCount} of {event.capacity} spots filled
                    </p>
                  </div>
                </div>

                {/* Event Policies */}
                <div>
                  <h2 className="mb-3 font-[var(--font-display)] text-sm font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    Policies
                  </h2>
                  <ul className="space-y-2 text-xs text-[var(--color-text-tertiary)]">
                    <li className="flex items-start gap-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      21+ only for all events
                    </li>
                    <li className="flex items-start gap-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Guestlist reservation does not guarantee entry (venue capacity limits apply)
                    </li>
                    <li className="flex items-start gap-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Arrive 30 min before cutoff to secure your spot
                    </li>
                    <li className="flex items-start gap-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      No refunds — guestlist is free, but no-shows may be flagged
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right: Reservation Form */}
            <div className="lg:col-span-3">
              <div ref={formRef} className="rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-6 sm:p-8">
                <h2 className="mb-1 font-[var(--font-display)] text-xl font-bold">
                  Reserve Your Spot
                </h2>
                <p className="mb-3 text-sm text-[var(--color-text-tertiary)]">
                  Fill out the form below to join the guestlist.
                </p>

                {/* Trust signal */}
                <div className="mb-5 flex items-center gap-2 rounded-[var(--radius-input)] border border-[var(--color-neon-green)]/20 bg-[var(--color-neon-green)]/5 px-3 py-2 text-xs text-[var(--color-neon-green)]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>No account needed • Book in 30 seconds</span>
                </div>

                {/* Urgency Banner */}
                {isAlmostFullDetail && (
                  <div className="mb-5 flex flex-col gap-1.5 rounded-[var(--radius-input)] border border-[var(--color-neon-red)]/30 bg-[var(--color-neon-red)]/10 px-4 py-3 animate-pulse">
                    <span className="flex items-center gap-2 text-sm font-bold text-[var(--color-neon-red)]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      Almost Full — Only {remaining} Spots Left
                    </span>
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      Secure your spot before they are gone
                    </span>
                  </div>
                )}
                {isFillingFastDetail && !isAlmostFullDetail && (
                  <div className="mb-5 flex flex-col gap-1.5 rounded-[var(--radius-input)] border border-[var(--color-neon-amber)]/30 bg-[var(--color-neon-amber)]/10 px-4 py-3">
                    <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-neon-amber)]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                      </svg>
                      Popular Event — {filledPercent}% Filled
                    </span>
                  </div>
                )}

                {/* Interested counter */}
                <div className="mb-4 flex items-center gap-2 font-[var(--font-body)] text-xs text-[var(--color-text-tertiary)]">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-neon-green)] opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-neon-green)]"></span>
                  </span>
                  <span>
                    <span className="font-semibold text-[var(--color-text-secondary)]">{event.approvedCount}</span> people have reserved for this event
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Full Name */}
                  <div className="relative">
                    <label htmlFor="fullName" className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                      Full Name <span className="text-[var(--color-neon-red)]">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full rounded-[var(--radius-input)] border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] transition-all duration-200 focus:border-[var(--color-neon-orange)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(232,122,36,0.12)]"
                    />
                  </div>

                  {/* Mobile */}
                  <div className="relative">
                    <label htmlFor="mobile" className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                      Mobile Number <span className="text-[var(--color-neon-red)]">*</span>
                    </label>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      required
                      inputMode="tel"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="+63 9XX XXX XXXX"
                      className="w-full rounded-[var(--radius-input)] border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] transition-all duration-200 focus:border-[var(--color-neon-orange)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(232,122,36,0.12)]"
                    />
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      inputMode="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="w-full rounded-[var(--radius-input)] border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] transition-all duration-200 focus:border-[var(--color-neon-orange)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(232,122,36,0.12)]"
                    />
                  </div>

                  {/* Instagram */}
                  <div className="relative">
                    <label htmlFor="instagram" className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                      Instagram Username
                    </label>
                    <input
                      type="text"
                      id="instagram"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleChange}
                      placeholder="@username"
                      className="w-full rounded-[var(--radius-input)] border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] transition-all duration-200 focus:border-[var(--color-neon-orange)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(232,122,36,0.12)]"
                    />
                  </div>

                  {/* Guest Count */}
                  <div className="relative">
                    <label htmlFor="guestCount" className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                      Number of Guests
                    </label>
                    <select
                      id="guestCount"
                      name="guestCount"
                      value={formData.guestCount}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-[var(--radius-input)] border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-[var(--color-text-primary)] transition-all duration-200 focus:border-[var(--color-neon-orange)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(232,122,36,0.12)]"
                    >
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "Guest" : "Guests"}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="pointer-events-none absolute right-4 top-[38px] h-4 w-4 text-[var(--color-text-tertiary)]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-start gap-2 rounded-[var(--radius-input)] border border-[var(--color-neon-red)]/30 bg-[var(--color-neon-red)]/10 px-4 py-3 text-sm text-[var(--color-neon-red)]">
                      <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Success Message */}
                  {success && (
                    <div className="flex items-start gap-2 rounded-[var(--radius-input)] border border-[var(--color-neon-green)]/30 bg-[var(--color-neon-green)]/10 px-4 py-3 text-sm text-[var(--color-neon-green)]">
                      <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <span>Reservation confirmed! Redirecting...</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || remaining <= 0}
                    className="group relative w-full overflow-hidden rounded-[var(--radius-button)] bg-gradient-to-r from-[var(--color-neon-orange)] to-[var(--color-neon-gold)] px-6 py-3.5 font-[var(--font-display)] text-sm font-semibold tracking-wide text-[var(--color-text-inverse)] transition-all duration-300 hover:shadow-[0_0_24px_rgba(232,122,36,0.3)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processing...
                        </>
                      ) : remaining <= 0 ? (
                        "Event Full"
                      ) : (
                        <>
                          Reserve Your Spot
                          <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </>
                      )}
                    </span>
                  </button>
                </form>

                {/* Trust signals */}
                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-tertiary)]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    No payment required
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-tertiary)]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Instant confirmation
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-tertiary)]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Venue-approved
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Mobile CTA */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-40
          border-t border-[var(--color-border-default)]
          bg-[var(--color-bg-base)]/80 backdrop-blur-xl
          px-4 pb-[env(safe-area-inset-bottom,0px)]
          transition-transform duration-300 ease-in-out
          md:hidden
          ${showStickyBar ? "translate-y-0" : "translate-y-full"}
        `}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-[var(--font-display)] text-sm font-bold text-[var(--color-text-primary)]">
              {event.name}
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              {remaining} spots left
            </p>
          </div>
          <a
            href="#reserve-form"
            onClick={(e) => {
              e.preventDefault();
              formRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
            className="ml-4 shrink-0 rounded-[var(--radius-button)] bg-gradient-to-r from-[var(--color-neon-orange)] to-[var(--color-neon-gold)] px-5 py-2.5 font-[var(--font-display)] text-sm font-semibold text-[var(--color-text-inverse)] shadow-lg transition-all duration-300 hover:shadow-[0_0_16px_rgba(232,122,36,0.3)]"
          >
            Reserve Spot
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-[var(--color-border-default)] py-6 text-center font-[var(--font-mono)] text-xs text-[var(--color-text-tertiary)]">
        © 2026 GUESTLIST — All rights reserved. Made in Manila.
      </footer>
    </div>
  );
}

export const getServerSideProps = async (context: { params: { slug: string } }) => {
  const { slug } = context.params;

  try {
    const { default: prisma } = await import("../../lib/prism");

    const event = await prisma.event.findFirst({
      where: {
        OR: [
          { id: slug },
          { name: { contains: slug.replace(/-/g, " ") } },
        ],
      },
      include: {
        reservations: {
          where: { status: "APPROVED" },
          select: { id: true },
        },
      },
    });

    if (!event) {
      return { notFound: true };
    }

    return {
      props: {
        event: {
          id: event.id,
          name: event.name,
          date: event.date.toISOString(),
          venue: event.venue,
          capacity: event.capacity,
          description: event.description,
          bannerUrl: event.bannerUrl,
          approvedCount: event.reservations.length,
        },
      },
    };
  } catch {
    return { notFound: true };
  }
};
