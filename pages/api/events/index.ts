import { NextApiHandler } from "next";
import prisma from "../../../lib/prism";

const handler: NextApiHandler = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { status, venue, search, page = "1", limit = "50" } = req.query;

    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (venue && venue !== "ALL") where.venue = venue;
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: "insensitive" } },
        { venue: { contains: String(search), mode: "insensitive" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 50));

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { date: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          _count: { select: { reservations: true } },
          sheetsMapping: { select: { spreadsheetId: true, sheetUrl: true } },
        },
      }),
      prisma.event.count({ where }),
    ]);

    res.json({
      events: events.map((e) => ({
        id: e.id,
        name: e.name,
        slug: e.slug,
        date: e.date.toISOString(),
        startTime: e.startTime,
        endTime: e.endTime,
        venue: e.venue,
        address: e.address,
        capacity: e.capacity,
        minAge: e.minAge,
        dressCode: e.dressCode,
        genres: e.genres,
        djLineup: e.djLineup,
        coverImage: e.coverImage,
        galleryImages: e.galleryImages,
        status: e.status,
        description: e.description,
        reservationCount: e._count.reservations,
        hasSheet: !!e.sheetsMapping,
        sheetUrl: e.sheetsMapping?.sheetUrl || null,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;
