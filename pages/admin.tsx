import { useState, useEffect } from "react";
import Head from "next/head";
import { getServerSession } from "../auth";
import prisma from "../lib/prism";

interface Reservation {
  id: string;
  code: string;
  fullName: string;
  email: string | null;
  mobile: string;
  status: string;
  guestCount: number;
  createdAt: string;
}

const STATUS_OPTIONS = ["ALL", "PENDING", "APPROVED", "REJECTED", "CHECKED_IN"] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res);

  if (!session) {
    return {
      redirect: {
        destination: "/admin/login",
        permanent: false,
      },
    };
  }

  let initialReservations: Reservation[] = [];
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 50;

  // Re-fetch from client on mount to ensure fresh data
  useEffect(() => {
    fetch("/api/reservations?limit=500")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setReservations(data.map((r: Reservation) => ({
            ...r,
            createdAt: typeof r.createdAt === "string" ? r.createdAt : new Date(r.createdAt).toISOString(),
          })));
        }
      })
      .catch(() => {
        // Use server-side props data as fallback
      });
  }, []);

  const filtered = reservations.filter((r) => {
    const matchesSearch =
      !search ||
      r.fullName.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      r.mobile.includes(search);
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      APPROVED: "bg-green-900/50 text-green-400",
      PENDING: "bg-yellow-900/50 text-yellow-400",
      CHECKED_IN: "bg-blue-900/50 text-blue-400",
      REJECTED: "bg-red-900/50 text-red-400",
    };
    return (
      <span className={`inline-block px-2 py-1 rounded text-xs ${colors[status] || "bg-gray-700 text-gray-300"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Admin Dashboard | Guest List Platform</title>
      </Head>

      <main className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <input
            type="search"
            placeholder="Search by name, code, or mobile..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="bg-gray-800 border border-purple-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-pink-500 flex-1"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              setPage(1);
            }}
            className="bg-gray-800 border border-purple-500/30 rounded px-4 py-2 text-white"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "ALL" ? "All Status" : s}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-400 mb-4">
          Showing {paginated.length} of {filtered.length} reservations
        </p>

        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-purple-900/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Code</th>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Mobile</th>
                <th className="px-4 py-3 text-left font-semibold">Guests</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No reservations found.
                  </td>
                </tr>
              ) : (
                paginated.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-purple-900/30">
                    <td className="px-4 py-3 font-mono text-sm">{reservation.code}</td>
                    <td className="px-4 py-3">{reservation.fullName}</td>
                    <td className="px-4 py-3">{reservation.mobile}</td>
                    <td className="px-4 py-3">{reservation.guestCount}</td>
                    <td className="px-4 py-3">{statusBadge(reservation.status)}</td>
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
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {paginated.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No reservations found.</div>
          ) : (
            paginated.map((reservation) => (
              <div key={reservation.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-sm text-purple-300">{reservation.code}</span>
                  {statusBadge(reservation.status)}
                </div>
                <p className="font-semibold text-lg">{reservation.fullName}</p>
                <p className="text-sm text-gray-400">Mobile: {reservation.mobile}</p>
                <p className="text-sm text-gray-400">Guests: {reservation.guestCount}</p>
                {reservation.status === "PENDING" && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleApprove(reservation.id)}
                      className="bg-purple-600 hover:bg-pink-600 px-3 py-1 rounded text-sm transition-colors flex-1"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(reservation.id)}
                      className="bg-red-700 hover:bg-red-600 px-3 py-1 rounded text-sm transition-colors flex-1"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="bg-gray-800 hover:bg-purple-900 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="bg-gray-800 hover:bg-purple-900 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Export CSV Button */}
        <button
          onClick={() => {
            const headers = ["Code", "Name", "Mobile", "Guests", "Status"];
            const rows = filtered.map(r => [r.code, r.fullName, r.mobile, r.guestCount, r.status]);
            const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "reservations.csv";
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="btn btn-secondary"
        >
          Export CSV
        </button>
      </main>
    </div>
  );
}
