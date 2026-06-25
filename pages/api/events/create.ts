import { NextApiHandler } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth";
import prisma from "../../../lib/prism";

const handler: NextApiHandler = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, date, venue, capacity, description, bannerUrl } = req.body;

  if (!name || !date || !venue || !capacity) {
    return res.status(400).json({ error: "Missing required fields: name, date, venue, capacity" });
  }

  try {
    const event = await prisma.event.create({
      data: {
        name,
        date: new Date(date),
        venue,
        capacity: Number(capacity),
        description: description || null,
        bannerUrl: bannerUrl || null,
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
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;
