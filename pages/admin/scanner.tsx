import { useState, useRef, useEffect, useCallback } from "react";
import Head from "next/head";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth";

interface Reservation {
  code: string;
  fullName: string;
  status: string;
  guestCount?: number;
}

interface CheckinResult {
  success: boolean;
  message?: string;
  reservation?: Reservation;
  error?: string;
}

interface EventItem {
  id: string;
  name: string;
}

type ScanState = "idle" | "scanning" | "success" | "error";

export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/admin/login",
        permanent: false,
      },
    };
  }

  return { props: {} };
}

export default function AdminScanner() {
  const [manualCode, setManualCode] = useState("");
  const [manualToken, setManualToken] = useState("");
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [showTokenEntry, setShowTokenEntry] = useState(false);

  const autoResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch events on mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch {
        // Silently fail — events are optional for scanner
      }
    };
    fetchEvents();
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (autoResetTimerRef.current) {
        clearTimeout(autoResetTimerRef.current);
      }
    };
  }, []);

  const resetState = useCallback(() => {
    setResult(null);
    setScanState("idle");
    setManualCode("");
    setManualToken("");
  }, []);

  const triggerVibrate = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }, []);

  const handleCheckin = async (token: string) => {
    if (!token.trim()) return;
    setLoading(true);
    setResult(null);
    setScanState("scanning");

    try {
      const res = await fetch("/api/checkin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setResult({
          success: true,
          message: "Check-in successful!",
          reservation: data.reservation,
        });
        setScanState("success");
        triggerVibrate();

        // Auto-reset after 3 seconds for next guest
        autoResetTimerRef.current = setTimeout(() => {
          resetState();
        }, 3000);
      } else {
        const errorMessage = data.error || "Verification failed";
        setResult({
          success: false,
          error: errorMessage,
        });
        setScanState("error");
      }
    } catch (err: any) {
      setResult({
        success: false,
        error: "Network error. Please try again.",
      });
      setScanState("error");
    } finally {
      setLoading(false);
    }
  };

  const getErrorDisplay = (error: string): { title: string; description: string } => {
    const lower = error.toLowerCase();
    if (lower.includes("invalid") || lower.includes("expired")) {
      return {
        title: "Invalid QR",
        description: "This QR code is invalid or has expired.",
      };
    }
    if (lower.includes("already checked in") || lower.includes("409")) {
      return {
        title: "Already Checked In",
        description: "This reservation has already been checked in.",
      };
    }
    if (lower.includes("not found") || lower.includes("404")) {
      return {
        title: "Reservation Not Found",
        description: "No reservation matches this code.",
      };
    }
    if (lower.includes("not approved") || lower.includes("pending")) {
      return {
        title: "Not Yet Approved",
        description: "This reservation is still pending approval.",
      };
    }
    if (lower.includes("rejected")) {
      return {
        title: "Reservation Rejected",
        description: "This reservation was rejected.",
      };
    }
    return {
      title: "Error",
      description: error,
    };
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "CHECKED_IN":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "CONFIRMED":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "REJECTED":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>QR Scanner | Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>

      <main className="mx-auto max-w-md px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">QR Check-In Scanner</h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-400">
                Enter a guest&apos;s reservation code
              </p>
            </div>
            <a
              href="/admin"
              className="inline-flex items-center gap-1 rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-gray-600 hover:text-white"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </a>
          </div>
        </div>

        {/* Event Selector */}
        <div className="mb-4">
          <label htmlFor="event-select" className="block text-xs font-medium text-gray-400 mb-1.5">
            Event
          </label>
          <select
            id="event-select"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="">All Events</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-700" />
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Enter code manually
          </span>
          <div className="h-px flex-1 bg-gray-700" />
        </div>

        {/* Manual Code Entry */}
        <div className="mb-3 space-y-3">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCheckin(manualCode)}
            placeholder="Enter reservation code..."
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 font-mono text-lg tracking-wider text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <button
            onClick={() => handleCheckin(manualCode)}
            disabled={loading || !manualCode.trim()}
            className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-sm font-semibold tracking-wide text-white transition-all hover:shadow-lg hover:shadow-purple-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && scanState === "scanning" ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Verifying...
              </span>
            ) : (
              "Verify Code"
            )}
          </button>
        </div>

        {/* Token Entry Toggle */}
        <div className="mb-4">
          <button
            onClick={() => setShowTokenEntry(!showTokenEntry)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform ${showTokenEntry ? "rotate-90" : ""}`}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            Manual QR Token Entry
          </button>
          {showTokenEntry && (
            <div className="mt-2 space-y-2">
              <textarea
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Paste full QR token here..."
                rows={3}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 font-mono text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
              />
              <button
                onClick={() => handleCheckin(manualToken)}
                disabled={loading || !manualToken.trim()}
                className="w-full rounded-lg border border-purple-500 bg-purple-600/20 px-4 py-2.5 text-sm font-semibold text-purple-300 transition-colors hover:bg-purple-600/30 disabled:opacity-50"
              >
                Verify Token
              </button>
            </div>
          )}
        </div>

        {/* Result Display */}
        {result && (
          <div className="mt-4">
            {/* Success State */}
            {result.success && result.reservation && (
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 sm:p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                  <svg
                    className="h-6 w-6 text-green-400"
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
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {result.reservation.fullName}
                </h3>
                <p className="mt-1 font-mono text-sm text-green-400">
                  {result.reservation.code}
                </p>
                <div className="mt-3 flex items-center justify-center gap-3">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(
                      result.reservation.status
                    )}`}
                  >
                    {result.reservation.status}
                  </span>
                  {result.reservation.guestCount && (
                    <span className="text-xs text-gray-400">
                      {result.reservation.guestCount} guest{result.reservation.guestCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {scanState === "success" && (
                  <p className="mt-3 text-xs text-green-400/70 animate-pulse">
                    Auto-resetting for next scan...
                  </p>
                )}
              </div>
            )}

            {/* Error State */}
            {!result.success && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20">
                    <svg
                      className="h-4 w-4 text-red-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-red-400">
                    {getErrorDisplay(result.error || "").title}
                  </span>
                </div>
                <p className="text-sm text-red-300/80 pl-10">
                  {getErrorDisplay(result.error || "").description}
                </p>
                <button
                  onClick={resetState}
                  className="mt-3 w-full rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
