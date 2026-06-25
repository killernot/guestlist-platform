import { NextApiHandler } from "next";
import prisma from "../../../lib/prism";

const handler: NextApiHandler = async (req, res) => {
  try {
    const { id } = req.query;
    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        reservations: {
          select: { status: true, guestCount: true },
        },
        sheetsMapping: { select: { spreadsheetId: true, sheetUrl: true, sheetTitle: true } },
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const stats = {
      total: event.reservations.length,
      approved: event.reservations.filter(r => r.status === "APPROVED").length,
      pending: event.reservations.filter(r => r.status === "PENDING").length,
      rejected: event.reservations.filter(r => r.status === "REJECTED").length,
      checkedIn: event.reservations.filter(r => r.status === "CHECKED_IN").length,
    };

    res.json({
      id: event.id,
      name: event.name,
      slug: event.slug,
      description: event.description,
      venue: event.venue,
      address: event.address,
      date: event.date.toISOString(),
      startTime: event.startTime,
      endTime: event.endTime,
      capacity: event.capacity,
      minAge: event.minAge,
      dressCode: event.dressCode,
      genres: event.genres,
      djLineup: event.djLineup,
      coverImage: event.coverImage,
      galleryImages: event.galleryImages,
      status: event.status,
      stats,
      sheet: event.sheetsMapping ? {
        spreadsheetId: event.sheetsMapping.spreadsheetId,
        sheetUrl: event.sheetsMapping.sheetUrl,
        sheetTitle: event.sheetsMapping.sheetTitle,
      } : null,
    });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;
