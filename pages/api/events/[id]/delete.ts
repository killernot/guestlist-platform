import { NextApiHandler } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../auth";
import prisma from "../../../../lib/prism";

const handler: NextApiHandler = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid event ID" });
  }

  try {
    // Check if any reservations exist for this event
    const reservationCount = await prisma.reservation.count({
      where: { eventId: id },
    });

    if (reservationCount > 0) {
      return res.status(409).json({
        error: "Cannot delete event with existing reservations",
      });
    }

    await prisma.event.delete({ where: { id } });

    return res.json({ success: true });
  } catch (e: any) {
    if (e.code === "P2025") {
      return res.status(404).json({ error: "Event not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;
