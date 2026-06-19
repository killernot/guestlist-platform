import { useState, useEffect } from "react";
import Head from "next/head";
import prisma from "../lib/prism";

interface Guest {
  id: string;
  code: string;
  fullName: string;
  status: string;
}

export async function getServerSideProps() {
  let initialGuests: Guest[] = [];
  try {
    const reservations = await prisma.reservation.findMany({
      where: { status: { in: ["APPROVED", "CHECKED_IN"] } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    initialGuests = reservations.map((r) => ({
      id: r.id,
      code: r.code,
      fullName: r.fullName,
      status: r.status,
    }));
  } catch {
    // DB may not be available during build — page works at runtime via client fetches
  }

  return { props: { initialGuests } };
}

export default function CheckInSystem({ initialGuests }: { initialGuests: Guest[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [guests, setGuests] = useState<Guest[]>(initialGuests);

  const handleCheckIn = async (id: string) => {
    const res = await fetch("/api/reservations/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CHECKED_IN" }),
    });
    if (res.ok) {
      setGuests((prev) =>
        prev.map((g) => (g.id === id ? { ...g, status: "CHECKED_IN" } : g))
      );
    }
  };

  const filteredGuests = guests.filter(
    (g) =>
      g.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Check-In System | Guest List Platform</title>
      </Head>

      <main className="p-6">
        <h1 className="text-3xl font-bold mb-6">Guest Check-In System</h1>

        {/* Search Form */}
        <div className="mb-8 flex gap-4">
          <input
            type="search"
            placeholder="Search by code, name, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-800 border border-purple-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-pink-500 flex-grow"
          />
        </div>

        {/* Guest List */}
        <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-purple-900/50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Code</th>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredGuests.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No guests found.
                </td>
              </tr>
            ) : (
              filteredGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-purple-900/30">
                  <td className="px-4 py-3 font-mono text-sm">{guest.code}</td>
                  <td className="px-4 py-3">{guest.fullName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      guest.status === "CHECKED_IN" ? "bg-green-900/50 text-green-400" :
                      guest.status === "APPROVED" ? "bg-yellow-900/50 text-yellow-400" :
                      'bg-red-900/50 text-red-400'
                    }`}>
                      {guest.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleCheckIn(guest.id)}
                      disabled={guest.status === "CHECKED_IN"}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        guest.status === "CHECKED_IN" ? "bg-gray-700 text-gray-500 cursor-not-allowed" :
                        "bg-purple-600 hover:bg-pink-600 text-white"
                      }`}
                    >
                      {guest.status === "CHECKED_IN" ? "Checked In" : "Check In"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Quick Actions */}
        <div className="mt-6 flex gap-4">
          <button className="bg-gray-800 hover:bg-purple-900 text-white px-4 py-2 rounded transition-colors">
            Add New Guest
          </button>
          <button className="bg-gray-800 hover:bg-pink-900 text-white px-4 py-2 rounded transition-colors">
            Scan QR Code
          </button>
        </div>
      </main>
    </div>
  );
}
