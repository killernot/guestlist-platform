import { useState, useEffect } from "react";
import Head from "next/head";
import prisma from "../lib/prism";

interface Reservation {
  id: string;
  code: string;
  fullName: string;
  email: string | null;
  status: string;
  guestCount: number;
  createdAt: string;
}

export async function getServerSideProps() {
  let initialReservations: Reservation[] = [];
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    initialReservations = reservations.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch {
    // DB may not be available during build — page works at runtime via client fetches
  }

  return { props: { initialReservations } };
}

export default function AdminDashboard({ initialReservations }: { initialReservations: Reservation[] }) {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);

  const handleApprove = async (id: string) => {
    const res = await fetch("/api/reservations/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "APPROVED" }),
    });
    if (res.ok) {
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "APPROVED" } : r))
      );
    }
  };

  const handleReject = async (id: string) => {
    const res = await fetch("/api/reservations/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "REJECTED" }),
    });
    if (res.ok) {
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "REJECTED" } : r))
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Admin Dashboard | Guest List Platform</title>
      </Head>

      <main className="p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4">
          <input
            type="search"
            placeholder="Search by name or ID..."
            className="bg-gray-800 border border-purple-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-pink-500"
          />
          <select className="bg-gray-800 border border-purple-500/30 rounded px-4 py-2 text-white">
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>

        {/* Reservation Table */}
        <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-purple-900/50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Code</th>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Email</th>
              <th className="px-4 py-3 text-left font-semibold">Guests</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No reservations found.</td>
              </tr>
            ) : (
              reservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-purple-900/30">
                  <td className="px-4 py-3 font-mono text-sm">{reservation.code}</td>
                  <td className="px-4 py-3">{reservation.fullName}</td>
                  <td className="px-4 py-3">{reservation.email || "—"}</td>
                  <td className="px-4 py-3">{reservation.guestCount}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      reservation.status === 'APPROVED' ? 'bg-green-900/50 text-green-400' :
                      reservation.status === 'PENDING' ? 'bg-yellow-900/50 text-yellow-400' :
                      reservation.status === 'CHECKED_IN' ? 'bg-blue-900/50 text-blue-400' :
                      'bg-red-900/50 text-red-400'
                    }`}>
                      {reservation.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    {reservation.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleApprove(reservation.id)}
                          className="bg-purple-600 hover:bg-pink-600 px-3 py-1 rounded text-sm transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(reservation.id)}
                          className="bg-red-700 hover:bg-red-600 px-3 py-1 rounded text-sm transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Export CSV Button */}
        <button className="mt-6 bg-gray-800 hover:bg-purple-900 text-white px-4 py-2 rounded transition-colors">
          Export CSV
        </button>
      </main>
    </div>
  );
}
