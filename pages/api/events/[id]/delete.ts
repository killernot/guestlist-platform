import { NextApiHandler } from "next";
import { getServerSession } from "../../../../auth";
import prisma from "../../../../lib/prism";

const handler: NextApiHandler = async (req, res) => {
  const session = await getServerSession(req, res);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid event ID" });
  }

  if (req.method === "DELETE") {
    try {
      const reservationCount = await prisma.reservation.count({ where: { eventId: id } });

      if (reservationCount > 0) {
        return res.status(409).json({
          error: "Cannot delete event with existing reservations",
          reservationCount,
          suggestion: "Archive the event instead",
        });
      }

      await prisma.event.delete({ where: { id } });
      return res.json({ success: true, action: "deleted" });
    } catch (e: any) {
      if (e.code === "P2025") return res.status(404).json({ error: "Event not found" });
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "PATCH") {
    const { action } = req.body;

    if (action === "archive") {
      try {
        const event = await prisma.event.update({
          where: { id },
          data: { status: "ARCHIVED" },
        });
        return res.json({ success: true, action: "archived", status: event.status });
      } catch (e: any) {
        if (e.code === "P2025") return res.status(404).json({ error: "Event not found" });
        return res.status(500).json({ error: "Internal server error" });
      }
    }

    if (action === "publish") {
      try {
        const event = await prisma.event.update({
          where: { id },
          data: { status: "PUBLISHED" },
        });
        return res.json({ success: true, action: "published", status: event.status });
      } catch (e: any) {
        if (e.code === "P2025") return res.status(404).json({ error: "Event not found" });
        return res.status(500).json({ error: "Internal server error" });
      }
    }

    if (action === "duplicate") {
      try {
        const original = await prisma.event.findUnique({ where: { id } });
        if (!original) return res.status(404).json({ error: "Event not found" });

        const newEvent = await prisma.event.create({
          data: {
            name: `${original.name} (Copy)`,
            slug: `${original.slug}-copy-${Date.now().toString(36)}`,
            description: original.description,
            venue: original.venue,
            address: original.address,
            date: original.date,
            startTime: original.startTime,
            endTime: original.endTime,
            capacity: original.capacity,
            minAge: original.minAge,
            dressCode: original.dressCode,
            genres: original.genres,
            djLineup: original.djLineup,
            coverImage: original.coverImage,
            galleryImages: original.galleryImages,
            status: "DRAFT",
          },
        });

        return res.json({
          success: true,
          action: "duplicated",
          originalId: original.id,
          event: { id: newEvent.id, name: newEvent.name, slug: newEvent.slug, status: newEvent.status },
        });
      } catch {
        return res.status(500).json({ error: "Internal server error" });
      }
    }

    return res.status(400).json({ error: "Unknown action" });
  }

  return res.status(405).json({ error: "Method not allowed" });
};

export default handler;
