/* ============================================================
   ADMIN EVENTS — Event Management Console
   ============================================================ */

import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth";
import Layout from "../../../src/components/layout/Layout";

interface EventItem {
  id: string;
  name: string;
  slug: string;
  date: string;
  startTime: string | null;
  venue: string;
  capacity: number;
  status: string;
  reservationCount: number;
  hasSheet: boolean;
  sheetUrl: string | null;
  coverImage: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-gray-500" },
  PUBLISHED: { label: "Published", color: "bg-green-500" },
  COMPLETED: { label: "Completed", color: "bg-blue-500" },
  ARCHIVED: { label: "Archived", color: "bg-yellow-600" },
};

export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }
  return { props: {} };
}

export default function AdminEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [venueFilter, setVenueFilter] = useState("ALL");
  const [venues, setVenues] = useState<string[]>([]);

  const fetchEvents = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(statusFilter !== "ALL" && { status: statusFilter }),
        ...(venueFilter !== "ALL" && { venue: venueFilter }),
        ...(search && { search }),
      });
      const res = await fetch(`/api/events?${params}`);
      const data = await res.json();
      setEvents(data.events || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
      const v = [...new Set((data.events || []).map((e: EventItem) => e.venue))] as string[];
      setVenues(v);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, venueFilter, search]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event permanently? This cannot be undone.")) return;
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.error) { alert(data.error); return; }
    fetchEvents(pagination.page);
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Archive this event? It will no longer be publicly visible.")) return;
    await fetch(`/api/events/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "archive" }) });
    fetchEvents(pagination.page);
  };

  const handlePublish = async (id: string) => {
    await fetch(`/api/events/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "publish" }) });
    fetchEvents(pagination.page);
  };

  const handleDuplicate = async (id: string) => {
    if (!confirm("Duplicate this event? A new draft will be created.")) return;
    await fetch(`/api/events/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "duplicate" }) });
    fetchEvents(pagination.page);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <>
      <Head><title>Events — Admin</title></Head>
      <Layout>
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Events</h1>
            <a href="/admin/events/new" className="rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
              + New Event
            </a>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-3">
            <input type="text" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white">
              <option value="ALL">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <select value={venueFilter} onChange={(e) => setVenueFilter(e.target.value)} className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white">
              <option value="ALL">All Venues</option>
              {venues.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-800 bg-gray-900">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-800 text-gray-400">
                <tr>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Venue</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Reservations</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : events.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No events found</td></tr>
                ) : events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {event.coverImage && <img src={event.coverImage} alt="" className="h-10 w-10 rounded object-cover" />}
                        <div>
                          <a href={`/admin/events/${event.id}`} className="font-medium text-white hover:text-orange-400">{event.name}</a>
                          <p className="text-xs text-gray-500">{event.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {formatDate(event.date)}
                      {event.startTime && <p className="text-xs text-gray-500">{event.startTime}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{event.venue}</td>
                    <td className="px-4 py-3 text-gray-300">{event.capacity}</td>
                    <td className="px-4 py-3 text-gray-300">{event.reservationCount}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${STATUS_LABELS[event.status]?.color || "bg-gray-500"}`}>
                        {STATUS_LABELS[event.status]?.label || event.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {event.status === "DRAFT" && (
                          <button onClick={() => handlePublish(event.id)} className="text-xs text-green-400 hover:text-green-300">Publish</button>
                        )}
                        {event.status === "PUBLISHED" && (
                          <button onClick={() => handleArchive(event.id)} className="text-xs text-yellow-400 hover:text-yellow-300">Archive</button>
                        )}
                        <button onClick={() => handleDuplicate(event.id)} className="text-xs text-blue-400 hover:text-blue-300">Duplicate</button>
                        {event.reservationCount === 0 && (
                          <button onClick={() => handleDelete(event.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">{pagination.total} events</p>
              <div className="flex gap-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => fetchEvents(p)} className={`rounded px-3 py-1 text-sm ${p === pagination.page ? "bg-orange-500 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>{p}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
