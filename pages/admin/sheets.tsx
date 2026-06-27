import { useState } from "react";
import Head from "next/head";
import { getServerSession } from "../../auth";
import prisma from "../../lib/prism";
import SheetsManager from "../../components/admin/SheetsManager";

interface Event {
  id: string;
  name: string;
}

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

  let events: Event[] = [];
  try {
    const dbEvents = await prisma.event.findMany({
      select: { id: true, name: true },
      orderBy: { date: "desc" },
      take: 100,
    });
    events = dbEvents.map((e) => ({
      ...e,
    }));
  } catch {
    // DB may not be available during build — page works at runtime via client state
  }

  return { props: { events } };
}

export default function SheetsAdminPage({ events }: { events: Event[] }) {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);

  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
    const event = events.find((e) => e.id === eventId) || null;
    setActiveEvent(event);
  };

  return (
    <>
      <Head>
        <title>Google Sheets Integration - Guest List Platform</title>
      </Head>

      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <header className="border-b border-gray-800 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold">Google Sheets Integration</h1>
            <nav className="flex items-center gap-4">
              <a href="/admin" className="text-sm text-gray-400 hover:text-white transition-colors">
                Dashboard
              </a>
              <a href="/admin/sheets" className="text-sm text-green-400 font-medium">
                Sheets
              </a>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto p-6">
          {/* Event Selector */}
          <div className="mb-6">
            <label htmlFor="event-select" className="block text-sm font-medium mb-2">
              Select Event
            </label>
            <select
              id="event-select"
              value={selectedEventId}
              onChange={(e) => handleEventSelect(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-600 min-w-[300px]"
            >
              <option value="">-- Choose an event --</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sheets Manager */}
          {activeEvent ? (
            <SheetsManager eventId={activeEvent.id} />
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-gray-400">
                Select an event above to view and manage linked Google Sheets.
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
