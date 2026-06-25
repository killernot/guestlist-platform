import { useState, useEffect } from "react";
import Head from "next/head";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth";

interface EventItem {
  id: string;
  name: string;
}

interface TrendPoint {
  date: string;
  count: number;
}

interface Metrics {
  totalReservations: number;
  approved: number;
  checkedIn: number;
  pending: number;
  rejected: number;
  remainingSpots: number;
  attendanceRate: number;
  noShowRate: number;
  utilizationPercent: number;
  totalGuestCount: number;
}

interface ComparisonItem {
  eventName: string;
  totalReservations: number;
  checkedIn: number;
  capacity: number;
  utilizationPercent: number;
}

interface DashboardData {
  success: boolean;
  event: { id: string; name: string; date: string; venue: string; capacity: number } | null;
  metrics: Metrics;
  trends: {
    reservations: TrendPoint[];
    checkins: TrendPoint[];
  };
  comparison: ComparisonItem[];
}

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

function MetricCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string | number;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
          {label}
        </span>
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${accent}`}>
          {icon}
        </div>
      </div>
      <div className="mt-2 text-2xl sm:text-3xl font-bold text-white">{value}</div>
    </div>
  );
}

function HorizontalBarChart({
  data,
  label,
  color,
}: {
  data: TrendPoint[];
  label: string;
  color: string;
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">{label}</h3>
      <div className="space-y-2.5">
        {data.map((point) => {
          const pct = (point.count / maxCount) * 100;
          const dateLabel = new Date(point.date + "T00:00:00").toLocaleDateString(
            "en-US",
            { weekday: "short", month: "short", day: "numeric" }
          );
          return (
            <div key={point.date} className="flex items-center gap-3">
              <span className="w-20 text-xs text-gray-400 shrink-0 text-right">
                {dateLabel}
              </span>
              <div className="flex-1 h-5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${color} transition-all duration-500`}
                  style={{ width: `${Math.max(pct, 0)}%` }}
                />
              </div>
              <span className="w-6 text-xs text-gray-300 text-right shrink-0">
                {point.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events on mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        if (res.ok) {
          const json = await res.json();
          setEvents(json);
        }
      } catch {
        // Silently fail
      }
    };
    fetchEvents();
  }, []);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = selectedEventId
          ? `/api/analytics/dashboard?eventId=${selectedEventId}`
          : "/api/analytics/dashboard";
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Failed to fetch analytics");
        }
        const json: DashboardData = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedEventId]);

  const metrics = data?.metrics;
  const noShows = metrics ? metrics.approved - metrics.checkedIn : 0;
  const isAllEvents = !selectedEventId;

  return (
    <>
      <Head>
        <title>Analytics Dashboard | Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <header className="border-b border-gray-800 px-4 sm:px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Analytics Dashboard</h1>
              <p className="mt-0.5 text-sm text-gray-400">
                Venue performance metrics and trends
              </p>
            </div>
            <a
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-gray-600 hover:text-white w-fit"
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
              Back to Admin
            </a>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Event Selector */}
          <div>
            <label
              id="analytics-event-select"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Select Event
            </label>
            <select
              aria-labelledby="analytics-event-select"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full sm:w-80 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="">All Events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3 text-gray-400">
                <svg
                  className="h-6 w-6 animate-spin"
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
                <span className="text-sm">Loading analytics...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="rounded-lg border border-red-700 bg-red-900/20 p-4 text-center">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Content */}
          {!loading && !error && metrics && (
            <>
              {/* Event Info */}
              {data?.event && (
                <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <h2 className="text-lg font-semibold">{data.event.name}</h2>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span>
                        {new Date(data.event.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      <span className="hidden sm:inline text-gray-600">|</span>
                      <span>{data.event.venue}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <MetricCard
                  label="Capacity"
                  value={metrics.remainingSpots + metrics.totalGuestCount}
                  accent="bg-purple-500/20 text-purple-400"
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  }
                />
                <MetricCard
                  label="Reservations"
                  value={metrics.totalReservations}
                  accent="bg-blue-500/20 text-blue-400"
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    </svg>
                  }
                />
                <MetricCard
                  label="Approved"
                  value={metrics.approved}
                  accent="bg-green-500/20 text-green-400"
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  }
                />
                <MetricCard
                  label="Checked In"
                  value={metrics.checkedIn}
                  accent="bg-teal-500/20 text-teal-400"
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  }
                />
                <MetricCard
                  label="Remaining"
                  value={metrics.remainingSpots}
                  accent="bg-cyan-500/20 text-cyan-400"
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  }
                />
                <MetricCard
                  label="Attendance"
                  value={`${metrics.attendanceRate}%`}
                  accent="bg-emerald-500/20 text-emerald-400"
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  }
                />
                <MetricCard
                  label="No Shows"
                  value={noShows}
                  accent="bg-orange-500/20 text-orange-400"
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  }
                />
                <MetricCard
                  label="Utilization"
                  value={`${metrics.utilizationPercent}%`}
                  accent="bg-pink-500/20 text-pink-400"
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                      <path d="M22 12A10 10 0 0 0 12 2v10z" />
                    </svg>
                  }
                />
              </div>

              {/* Capacity Usage Progress Bar */}
              <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-300">
                    Capacity Usage
                  </h3>
                  <span className="text-sm font-medium text-white">
                    {metrics.utilizationPercent}%
                  </span>
                </div>
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-700"
                    style={{
                      width: `${Math.min(metrics.utilizationPercent, 100)}%`,
                    }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>{metrics.totalGuestCount} guests</span>
                  <span>
                    {metrics.remainingSpots + metrics.totalGuestCount} capacity
                  </span>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <HorizontalBarChart
                  data={data?.trends?.reservations || []}
                  label="Reservations Over Time (Last 7 Days)"
                  color="bg-gradient-to-r from-blue-500 to-blue-400"
                />
                <HorizontalBarChart
                  data={data?.trends?.checkins || []}
                  label="Check-ins Over Time (Last 7 Days)"
                  color="bg-gradient-to-r from-teal-500 to-teal-400"
                />
              </div>

              {/* Event Comparison (All Events view) */}
              {isAllEvents && data?.comparison && data.comparison.length > 0 && (
                <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-gray-300 mb-4">
                    Event Comparison
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-2 pr-4 text-gray-400 font-medium">
                            Event
                          </th>
                          <th className="text-right py-2 px-3 text-gray-400 font-medium">
                            Reservations
                          </th>
                          <th className="text-right py-2 px-3 text-gray-400 font-medium">
                            Checked In
                          </th>
                          <th className="text-right py-2 px-3 text-gray-400 font-medium">
                            Capacity
                          </th>
                          <th className="text-right py-2 pl-3 text-gray-400 font-medium">
                            Utilization
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.comparison.map((item, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-gray-700/50 last:border-0"
                          >
                            <td className="py-2.5 pr-4 text-white font-medium">
                              {item.eventName}
                            </td>
                            <td className="py-2.5 px-3 text-right text-gray-300">
                              {item.totalReservations}
                            </td>
                            <td className="py-2.5 px-3 text-right text-gray-300">
                              {item.checkedIn}
                            </td>
                            <td className="py-2.5 px-3 text-right text-gray-300">
                              {item.capacity}
                            </td>
                            <td className="py-2.5 pl-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                                    style={{
                                      width: `${Math.min(item.utilizationPercent, 100)}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-gray-300 w-10 text-right">
                                  {item.utilizationPercent}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Empty comparison for single event */}
              {!isAllEvents && (
                <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">
                    Event Comparison
                  </h3>
                  <p className="text-sm text-gray-500">
                    Select &quot;All Events&quot; to see a comparison across all events.
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
