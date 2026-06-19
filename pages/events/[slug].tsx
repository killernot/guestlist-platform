import Head from "next/head";

export const getServerSideProps = async (context: any) => {
  const { slug } = context.params;

  try {
    const { default: prisma } = await import("../../lib/prism");

    const event = await prisma.event.findFirst({
      where: {
        OR: [
          { id: slug },
          { name: { contains: slug.replace(/-/g, ' ') } },
        ],
      },
      include: {
        reservations: {
          where: { status: 'APPROVED' },
          select: { id: true },
        },
      },
    });

    if (!event) {
      return { notFound: true };
    }

    return {
      props: {
        event: {
          id: event.id,
          name: event.name,
          date: event.date.toISOString(),
          venue: event.venue,
          capacity: event.capacity,
          description: event.description,
          bannerUrl: event.bannerUrl,
          approvedCount: event.reservations.length,
        },
      },
    };
  } catch {
    // DB may not be available during build — return notFound to let Next.js skip this page
    return { notFound: true };
  }
};

export default function EventDetails({ event }: any) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>{`Event: ${event?.name || "Guest List Platform"}`}</title>
        <meta name="description" content={event?.description || "Reserve your spot before the doors open. Premium access for DJs, promoters, and nightlife events."} />
      </Head>

      {/* Event Hero */}
      <div className="relative h-[60vh] bg-gradient-to-br from-purple-900 to-pink-800 flex items-center justify-center">
        <div className="text-center p-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">{event?.name || "Electric Paradise"}</h1>
          <p className="text-xl md:text-2xl max-w-3xl">{event?.description || "The ultimate nightlife experience."}</p>
        </div>
      </div>

      {/* Event Details */}
      <main className="max-w-5xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6">Event Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-500/20">
            <h3 className="font-semibold">Date</h3>
            <p>{event?.date ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "TBA"}</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-purple-500/20">
            <h3 className="font-semibold">Venue</h3>
            <p>{event?.venue || "TBA"}</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-purple-500/20">
            <h3 className="font-semibold">Capacity</h3>
            <p>{event?.approvedCount || 0} / {event?.capacity || "—"} approved</p>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-3 mb-8">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full bg-gray-700 border border-purple-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-pink-500"
          />

          <input
            type="tel"
            placeholder="Mobile Number"
            className="w-full bg-gray-700 border border-purple-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-pink-500"
          />

          <input
            type="email"
            placeholder="Email Address (optional)"
            className="w-full bg-gray-700 border border-purple-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-pink-500"
          />

          <input
            type="text"
            placeholder="Instagram Username (optional)"
            className="w-full bg-gray-700 border border-purple-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-pink-500"
          />

          <input
            type="number"
            placeholder="Guest Count"
            defaultValue="1"
            className="w-full bg-gray-700 border border-purple-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-pink-500"
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded font-semibold transition-colors"
          >
            Reserve Your Spot
          </button>
        </form>

        {/* Back Link */}
        <div className="mt-8">
          <a href="/" className="text-purple-400 hover:text-pink-500 transition-colors">&larr; Back to Events</a>
        </div>
      </main>
    </div>
  );
}
