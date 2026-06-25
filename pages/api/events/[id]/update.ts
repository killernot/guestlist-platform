import { NextApiHandler } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../auth";
import prisma from "../../../../lib/prism";

const handler: NextApiHandler = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid event ID" });
  }

  const { name, date, venue, capacity, description, bannerUrl } = req.body;

  try {
    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(date !== undefined ? { date: new Date(date) } : {}),
        ...(venue !== undefined ? { venue } : {}),
        ...(capacity !== undefined ? { capacity: Number(capacity) } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(bannerUrl !== undefined ? { bannerUrl } : {}),
      },
    });

    return res.json({
      success: true,
      event: {
        id: event.id,
        name: event.name,
        date: event.date.toISOString(),
        venue: event.venue,
        capacity: event.capacity,
        description: event.description,
        bannerUrl: event.bannerUrl,
      },
    });
  } catch (e: any) {
    if (e.code === "P2025") {
      return res.status(404).json({ error: "Event not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;
