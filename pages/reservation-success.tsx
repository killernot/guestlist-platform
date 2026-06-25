import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function ReservationSuccess() {
  const router = useRouter();
  const code = typeof router.query.code === "string" ? router.query.code : null;
  const name = typeof router.query.name === "string" ? router.query.name : null;
  const event = typeof router.query.event === "string" ? router.query.event : null;
  const date = typeof router.query.date === "string" ? router.query.date : null;
  const venue = typeof router.query.venue === "string" ? router.query.venue : null;
  const guests = typeof router.query.guests === "string" ? router.query.guests : null;
  const qrToken = typeof router.query.token === "string" ? router.query.token : null;
  const [mounted, setMounted] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `qr-${code || "reservation"}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      }, "image/png");
    };
    img.src = url;
  };

  const statusLabel = qrToken ? "Confirmed" : "Pending Approval";
  const statusColor = qrToken
    ? "bg-[var(--color-neon-green)]/20 text-[var(--color-neon-green)] border-[var(--color-neon-green)]/40"
    : "bg-[var(--color-neon-amber)]/20 text-[var(--color-neon-amber)] border-[var(--color-neon-amber)]/40";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
      <Head>
        <title>Reservation Confirmed | Guest List Platform</title>
        <meta
          name="description"
          content="Your guest list reservation has been confirmed. See you at the event!"
        />
      </Head>

      {/* Confetti CSS Animation */}
      <div className="confetti-container pointer-events-none absolute inset-0 overflow-hidden print:hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              backgroundColor: [
                "var(--color-neon-purple)",
                "var(--color-neon-pink)",
                "var(--color-neon-blue)",
                "var(--color-neon-green)",
                "var(--color-neon-amber)",
              ][i % 5],
              width: `${4 + Math.random() * 6}px`,
              height: `${4 + Math.random() * 6}px`,
            }}
          />
        ))}
      </div>

      {/* Radial glow background */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center print:hidden">
        <div className="h-[600px] w-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.08)_0%,transparent_70%)]" />
      </div>

      <main className="relative z-10 flex min-h-screen flex-col items-center px-4 py-8 sm:py-12 lg:py-16">
        {/* Success Checkmark */}
        <div
          className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[var(--color-neon-green)]/50 bg-[var(--color-neon-green)]/10 transition-all duration-700 sm:mb-8 sm:h-24 sm:w-24 ${
            mounted ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <svg
            className={`h-10 w-10 text-[var(--color-neon-green)] transition-all duration-700 delay-300 sm:h-12 sm:w-12 ${
              mounted ? "scale-100 opacity-100" : "scale-0 opacity-0"
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Title */}
        <h1
          className={`mb-2 font-[var(--font-display)] text-3xl font-bold tracking-tight transition-all duration-700 delay-200 sm:text-4xl lg:text-5xl ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          You&apos;re In!
        </h1>
        <p
          className={`mb-8 text-center text-sm text-[var(--color-text-secondary)] transition-all duration-700 delay-300 sm:text-base ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          Your reservation has been confirmed.
        </p>

        {/* Main Content: Side-by-side on desktop, stacked on mobile */}
        <div
          className={`w-full max-w-5xl transition-all duration-700 delay-500 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
            {/* Left Column: QR Code */}
            <div className="flex flex-col items-center lg:flex-shrink-0">
              {/* Reservation Code */}
              {code && (
                <div className="mb-6 text-center">
                  <p className="mb-1 font-[var(--font-display)] text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
                    Reservation Code
                  </p>
                  <p className="font-[var(--font-mono)] text-2xl font-bold tracking-[0.15em] text-[var(--color-text-primary)] sm:text-3xl">
                    {code}
                  </p>
                </div>
              )}

              {/* QR Code Card */}
              <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-neon-blue)]/30 bg-[var(--color-bg-surface)] px-6 py-6 backdrop-blur-xl sm:px-8">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-neon-blue)]/5 to-[var(--color-neon-purple)]/5" />
                <div className="relative flex flex-col items-center">
                  <p className="mb-4 font-[var(--font-display)] text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
                    Check-In QR Code
                  </p>
                  {qrToken && code ? (
                    <div ref={qrRef} className="rounded-xl bg-white p-4">
                      <QRCodeSVG
                        value={`${typeof window !== "undefined" ? window.location.origin : ""}/checkin?token=${qrToken}&code=${code}`}
                        size={256}
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                  ) : (
                    <div className="flex h-[256px] w-[256px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-base)]">
                      <svg
                        className="mb-3 h-10 w-10 text-[var(--color-text-tertiary)]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <rect x="7" y="7" width="3" height="3" />
                        <rect x="14" y="7" width="3" height="3" />
                        <rect x="7" y="14" width="3" height="3" />
                        <rect x="14" y="14" width="3" height="3" />
                      </svg>
                      <p className="px-6 text-center text-sm text-[var(--color-text-tertiary)]">
                        Your QR code will appear after your reservation is approved.
                      </p>
                    </div>
                  )}

                  {/* Instruction text */}
                  {qrToken && (
                    <p className="mt-4 flex items-center gap-2 text-center text-sm font-medium text-[var(--color-neon-amber)]">
                      <svg
                        className="h-4 w-4 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Present this QR at the entrance
                    </p>
                  )}

                  {/* Download Button */}
                  {qrToken && (
                    <button
                      onClick={handleDownloadQR}
                      className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-[var(--color-neon-blue)]/40 bg-[var(--color-neon-blue)]/10 px-5 py-2.5 font-[var(--font-display)] text-sm font-medium tracking-wide text-[var(--color-neon-blue)] transition-all duration-300 hover:border-[var(--color-neon-blue)]/60 hover:bg-[var(--color-neon-blue)]/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] print:hidden"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download QR as PNG
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="flex-1">
              {/* Status Badge */}
              <div className="mb-6 flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${statusColor}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {statusLabel}
                </span>
              </div>

              {/* Details Card */}
              <div className="rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]/80 p-6 backdrop-blur-xl sm:p-8">
                <h3 className="mb-6 font-[var(--font-display)] text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
                  Reservation Details
                </h3>

                <div className="space-y-4">
                  {name && (
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm text-[var(--color-text-tertiary)]">Guest Name</span>
                      <span className="text-base font-semibold text-[var(--color-text-primary)]">
                        {name}
                      </span>
                    </div>
                  )}
                  {event && (
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm text-[var(--color-text-tertiary)]">Event</span>
                      <span className="text-right text-base font-semibold text-[var(--color-neon-purple)]">
                        {event}
                      </span>
                    </div>
                  )}
                  {formattedDate && (
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm text-[var(--color-text-tertiary)]">Date & Time</span>
                      <span className="text-right text-sm text-[var(--color-text-primary)]">
                        {formattedDate}
                      </span>
                    </div>
                  )}
                  {venue && (
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm text-[var(--color-text-tertiary)]">Venue</span>
                      <span className="text-right text-sm text-[var(--color-text-primary)]">
                        {venue}
                      </span>
                    </div>
                  )}
                  {guests && (
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm text-[var(--color-text-tertiary)]">Guest Count</span>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text-primary)]">
                        <svg
                          className="h-4 w-4 text-[var(--color-neon-blue)]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        {guests} {parseInt(guests) === 1 ? "person" : "people"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="my-6 border-t border-[var(--color-border-default)]" />

                {/* Reminder */}
                <div className="flex items-start gap-3 rounded-[var(--radius-input)] bg-[var(--color-neon-amber)]/10 px-4 py-3">
                  <svg
                    className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-neon-amber)]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-neon-amber)]">
                      Arrive early and present your QR code at the entrance.
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                      Screenshot or save this page for quick access.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div
          className={`mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center transition-all duration-700 delay-1000 print:hidden ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <Link
            href="/events"
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] bg-gradient-to-r from-[var(--color-neon-purple)] to-[var(--color-neon-pink)] px-8 py-3 font-[var(--font-display)] text-sm font-semibold tracking-wide text-white transition-all duration-300 hover:shadow-[var(--shadow-glow)]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Events
          </Link>
          <Link
            href="/checkin"
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-8 py-3 font-[var(--font-display)] text-sm font-medium tracking-wide text-[var(--color-text-secondary)] transition-all duration-300 hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
          >
            Check-In System
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-12 py-4 text-center font-[var(--font-mono)] text-xs text-[var(--color-text-tertiary)] print:hidden">
          © 2026 Guest List Platform — All rights reserved.
        </footer>
      </main>

      {/* Global Styles: Confetti + Print */}
      <style jsx global>{`
        .confetti-piece {
          position: absolute;
          top: -10px;
          border-radius: 2px;
          animation: confetti-fall linear infinite;
          opacity: 0.7;
        }
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        /* Print-friendly styles */
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          main {
            padding: 0 !important;
          }

          /* Hide decorative elements */
          .confetti-container,
          .pointer-events-none,
          footer,
          nav,
          .print\\:hidden {
            display: none !important;
          }

          /* Simplify the layout for print */
          .min-h-screen {
            min-height: auto !important;
          }

          /* Make QR code crisp for print */
          .rounded-xl {
            border-radius: 8px !important;
          }

          /* Ensure borders print */
          [class*="border"] {
            border-color: #ccc !important;
          }
        }
      `}</style>
    </div>
  );
}
