import { NextApiHandler } from "next";
import prisma from "../../../lib/prism";

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
    where: { date: { gte: new Date() } },
    take: 50,
  });

  res.json(events.map((e) => ({
    id: e.id,
    name: e.name,
    date: e.date.toISOString(),
    venue: e.venue,
    capacity: e.capacity,
    description: e.description,
    bannerUrl: e.bannerUrl,
  })));
};

export default handler;
