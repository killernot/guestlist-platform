/* ============================================================
   ADMIN — Edit Event
   ============================================================ */

import { useState, useEffect } from "react";
import Head from "next/head";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../auth";
import Layout from "../../../../src/components/layout/Layout";

const STATUSES = ["DRAFT", "PUBLISHED", "COMPLETED", "ARCHIVED"];

export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }
  return { props: { id: context.params?.id || null } };
}

export default function EditEvent({ id }: { id: string | null }) {
  const [form, setForm] = useState({
    name: "", slug: "", description: "", venue: "", address: "",
    date: "", startTime: "", endTime: "", capacity: 100, minAge: null as number | null,
    dressCode: "", genres: "", djLineup: "", coverImage: "", galleryImages: "", status: "DRAFT",
  });
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();
        if (data.error) { setError(data.error); return; }
        setForm({
          name: data.name || "", slug: data.slug || "", description: data.description || "",
          venue: data.venue || "", address: data.address || "",
          date: data.date ? data.date.slice(0, 16) : "", startTime: data.startTime || "",
          endTime: data.endTime || "", capacity: data.capacity || 100, minAge: data.minAge || null,
          dressCode: data.dressCode || "", genres: data.genres || "", djLineup: data.djLineup || "",
          coverImage: data.coverImage || "", galleryImages: data.galleryImages || "",
          status: data.status || "DRAFT",
        });
      } catch { setError("Failed to load event"); }
      setLoading(false);
    })();
  }, [id]);

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setSaving(false); return; }
      window.location.href = `/admin/events/${id}`;
    } catch {
      setError("Failed to save event");
      setSaving(false);
    }
  };

  if (loading) return <Layout><div className="flex h-64 items-center justify-center text-gray-400">Loading...</div></Layout>;

  return (
    <>
      <Head><title>Edit {form.name} — Admin</title></Head>
      <Layout>
        <div className="mx-auto max-w-3xl px-4 py-8">
          <h1 className="mb-6 text-2xl font-bold text-white">Edit Event</h1>
          {error && <div className="mb-4 rounded-lg bg-red-900/50 px-4 py-3 text-sm text-red-300">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Basic Information</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm text-gray-400">Event Title *</label>
                  <input type="text" value={form.name} onChange={(e) => handleChange("name", e.target.value)} required minLength={2} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-orange-500 focus:outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm text-gray-400">Slug</label>
                  <input type="text" value={form.slug} onChange={(e) => handleChange("slug", e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-orange-500 focus:outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm text-gray-400">Description</label>
                  <textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} rows={3} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-orange-500 focus:outline-none" />
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Venue & Schedule</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Venue *</label>
                  <input type="text" value={form.venue} onChange={(e) => handleChange("venue", e.target.value)} required className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-orange-500 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Address</label>
                  <input type="text" value={form.address} onChange={(e) => handleChange("address", e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-orange-500 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Date *</label>
                  <input type="datetime-local" value={form.date} onChange={(e) => handleChange("date", e.target.value)} required className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-orange-500 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-sm text-gray-400">Start</label>
                    <input type="time" value={form.startTime} onChange={(e) => handleChange("startTime", e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-orange-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-400">End</label>
                    <input type="time" value={form.endTime} onChange={(e) => handleChange("endTime", e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-orange-500 focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Capacity & Policies</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Capacity *</label>
                  <input type="number" value={form.capacity} onChange={(e) => handleChange("capacity", parseInt(e.target.value) || 1)} min={1} required className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-orange-500 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Min Age</label>
                  <input type="number" value={form.minAge || ""} onChange={(e) => handleChange("minAge", e.target.value ? parseInt(e.target.value) : null)} min={0} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-orange-500 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Dress Code</label>
                  <input type="text" value={form.dressCode} onChange={(e) => handleChange("dressCode", e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-orange-500 focus:outline-none" />
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Music & Lineup</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Genres</label>
                  <input type="text" value={form.genres} onChange={(e) => handleChange("genres", e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-orange-500 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">DJ Lineup</label>
                  <input type="text" value={form.djLineup} onChange={(e) => handleChange("djLineup", e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-orange-500 focus:outline-none" />
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Images</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Cover Image URL</label>
                  <input type="url" value={form.coverImage} onChange={(e) => handleChange("coverImage", e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-orange-500 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Gallery URLs</label>
                  <input type="text" value={form.galleryImages} onChange={(e) => handleChange("galleryImages", e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-orange-500 focus:outline-none" />
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Status</h2>
              <div className="flex gap-3">
                {STATUSES.map(s => (
                  <button key={s} type="button" onClick={() => handleChange("status", s)} className={`rounded-lg px-4 py-2 text-sm font-medium ${form.status === s ? "bg-orange-500 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>{s}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 px-6 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50">{saving ? "Saving..." : "Update Event"}</button>
              <a href={`/admin/events/${id}`} className="rounded-lg border border-gray-700 px-6 py-2 text-gray-300 hover:bg-gray-800">Cancel</a>
            </div>
          </form>
        </div>
      </Layout>
    </>
  );
}
