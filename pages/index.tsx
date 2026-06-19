import Head from "next/head";
import Link from "next/link";

interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  capacity: number;
  description?: string | null;
}

export async function getServerSideProps() {
  try {
    const { default: prisma } = await import("../lib/prism");
    const events = await prisma.event.findMany({
      orderBy: { date: "asc" },
      where: { date: { gte: new Date() } },
      take: 6,
    });

    return {
      props: {
        events: events.map((e) => ({
          id: e.id,
          name: e.name,
          date: e.date.toISOString(),
          venue: e.venue,
          capacity: e.capacity,
          description: e.description,
        })),
      },
    };
  } catch {
    return { props: { events: [] } };
  }
}

export default function HomePage({ events }: { events: Event[] }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Guest List Platform | Reserve Your Spot</title>
        <meta name="description" content="Reserve your spot before the doors open. Premium access for DJs, promoters, and nightlife events." />
      </Head>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          GUEST LIST PLATFORM
        </h1>

        <p className="text-xl md:text-2xl max-w-3xl mb-8">
          Reserve your spot before the doors open. Premium access for DJs, promoters, and nightlife events.
        </p>

        {/* Event Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
          {events.length === 0 ? (
            <div className="col-span-full text-gray-500 py-8">
              No upcoming events. Check back soon.
            </div>
          ) : (
            events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="bg-gray-800 rounded-lg p-4 border border-purple-500/20 hover:border-pink-500 transition-all text-left"
              >
                <h3 className="text-lg font-semibold">{event.name}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-xs text-purple-400 mt-2">{event.venue}</p>
              </Link>
            ))
          )}
        </div>

        {/* Navigation Links */}
        <nav className="mt-16 flex gap-4">
          <Link href="/admin" className="bg-gray-800 hover:bg-purple-900 text-white px-6 py-2 rounded transition-colors">
            Admin Dashboard
          </Link>
          <Link href="/checkin" className="bg-gray-800 hover:bg-pink-900 text-white px-6 py-2 rounded transition-colors">
            Check-In System
          </Link>
        </nav>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-500">
        © 2026 Guest List Platform. All rights reserved.
      </footer>
    </div>
  );
}