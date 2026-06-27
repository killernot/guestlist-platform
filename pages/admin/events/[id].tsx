/* ============================================================
   ADMIN — Event Detail / Dashboard
   ============================================================ */

import { useState, useEffect } from "react";
import Head from "next/head";
import { getServerSession } from "../../../auth";
import Layout from "../../../src/components/layout/Layout";

interface EventDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  venue: string;
  address: string | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  capacity: number;
  minAge: number | null;
  dressCode: string | null;
  genres: string | null;
  djLineup: string | null;
  coverImage: string | null;
  galleryImages: string | null;
  status: string;
  stats: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    checkedIn: number;
  };
  sheet: {
    spreadsheetId: string;
    sheetUrl: string;
    sheetTitle: string;
  } | null;
}

export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res);
  if (!session) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }
  return { props: { id: context.params?.id } };
}

export default function EventDetail({ id }: { id: string }) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();
        if (data.error) { setError(data.error); return; }
        setEvent(data);
      } catch { setError("Failed to load event"); }
      setLoading(false);
    })();
  }, [id]);

  const handleAction = async (action: string) => {
    if (action === "delete" && !confirm("Delete this event permanently? This cannot be undone.")) return;
    if (action === "archive" && !confirm("Archive this event?")) return;
    if (action === "duplicate" && !confirm("Duplicate this event?")) return;

    await fetch(`/api/events/${id}`, {
      method: action === "delete" ? "DELETE" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: action !== "delete" ? JSON.stringify({ action }) : undefined,
    });
    if (action === "delete" || action === "archive") {
      window.location.href = "/admin/events";
    } else {
      window.location.reload();
    }
  };

  if (loading) return <Layout><div className="flex h-64 items-center justify-center text-gray-400">Loading...</div></Layout>;
  if (error || !event) return <Layout><div className="flex h-64 items-center justify-center text-red-400">{error || "Event not found"}</div></Layout>;

  const attendancePercent = event.stats.total > 0 ? Math.round((event.stats.checkedIn / event.capacity) * 100) : 0;
  const capacityPercent = event.stats.total > 0 ? Math.round((event.stats.approved / event.capacity) * 100) : 0;

  return (
    <>
      <Head><title>{event.name} — Admin</title></Head>
      <Layout>
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{event.name}</h1>
              <p className="text-sm text-gray-400">{event.slug}</p>
            </div>
            <div className="flex gap-2">
              <a href={`/admin/events/${id}/edit`} className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">Edit</a>
              <button onClick={() => handleAction("duplicate")} className="rounded-lg border border-blue-700 px-4 py-2 text-sm text-blue-400 hover:bg-blue-900/30">Duplicate</button>
              {event.status !== "ARCHIVED" && (
                <button onClick={() => handleAction("archive")} className="rounded-lg border border-yellow-700 px-4 py-2 text-sm text-yellow-400 hover:bg-yellow-900/30">Archive</button>
              )}
              {event.stats.total === 0 && (
                <button onClick={() => handleAction("delete")} className="rounded-lg border border-red-700 px-4 py-2 text-sm text-red-400 hover:bg-red-900/30">Delete</button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-center">
              <p className="text-2xl font-bold text-white">{event.stats.total}</p>
              <p className="text-xs text-gray-400">Total</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{event.stats.approved}</p>
              <p className="text-xs text-gray-400">Approved</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">{event.stats.pending}</p>
              <p className="text-xs text-gray-400">Pending</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{event.stats.checkedIn}</p>
              <p className="text-xs text-gray-400">Checked In</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-center">
              <p className="text-2xl font-bold text-orange-400">{capacityPercent}%</p>
              <p className="text-xs text-gray-400">Capacity</p>
            </div>
          </div>

          {/* Details */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-400">Schedule</h3>
              <p className="text-white">{new Date(event.date).toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
              {event.startTime && <p className="text-gray-300">{event.startTime}{event.endTime ? ` — ${event.endTime}` : ""}</p>}
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-400">Venue</h3>
              <p className="text-white">{event.venue}</p>
              {event.address && <p className="text-gray-300">{event.address}</p>}
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-400">Policies</h3>
              {event.minAge && <p className="text-gray-300">Min Age: {event.minAge}+</p>}
              {event.dressCode && <p className="text-gray-300">Dress: {event.dressCode}</p>}
              {event.genres && <p className="text-gray-300">Genres: {event.genres}</p>}
              {event.djLineup && <p className="text-gray-300">Lineup: {event.djLineup}</p>}
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-400">Google Sheet</h3>
              {event.sheet ? (
                <div className="space-y-2">
                  <p className="text-green-400 text-sm">Linked</p>
                  <a href={event.sheet.sheetUrl} target="_blank" rel="noopener" className="text-sm text-blue-400 hover:underline">Open Sheet</a>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No sheet linked</p>
              )}
            </div>
          </div>

          {event.coverImage && (
            <div className="mt-6">
              <img src={event.coverImage} alt={event.name} className="w-full max-w-md rounded-lg object-cover" />
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
