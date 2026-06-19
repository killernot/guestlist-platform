import { NextApiHandler } from "next";
import prisma from "../../../lib/prism";

const handler: NextApiHandler = async (req, res) => {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: "Invalid event ID" });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      reservations: {
        where: { status: 'APPROVED' },
        select: { id: true },
      },
    },
  });

  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  res.json({
    id: event.id,
    name: event.name,
    date: event.date.toISOString(),
    venue: event.venue,
    capacity: event.capacity,
    description: event.description,
    bannerUrl: event.bannerUrl,
    approvedCount: event.reservations.length,
  });
};

export default handler;
