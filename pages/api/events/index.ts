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
        },
      }),
      prisma.event.count({ where }),
    ]);

    res.json({
      events: events.map((e) => ({
        id: e.id,
        name: e.name,
        slug: e.slug || null,
        date: e.date.toISOString(),
        startTime: e.startTime || null,
        endTime: e.endTime || null,
        venue: e.venue,
        address: e.address || null,
        capacity: e.capacity,
        minAge: e.minAge || null,
        dressCode: e.dressCode || null,
        genres: e.genres || null,
        djLineup: e.djLineup || null,
        coverImage: e.coverImage || e.bannerUrl,
        galleryImages: e.galleryImages || null,
        status: e.status || "DRAFT",
        description: e.description,
        reservationCount: e._count.reservations,
        hasSheet: false,
        sheetUrl: null,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    if (err.code === "P2002") return res.status(409).json({ error: "Unique constraint violation" });
    return res.status(500).json({ error: "Internal server error", detail: process.env.NODE_ENV === "development" ? String(err) : undefined });
  }
};

export default handler;
