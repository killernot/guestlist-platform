import prisma from "./prism";

/**
 * Centralized event data mapping and query logic.
 */

export interface EventListItem {
  id: string;
  name: string;
  slug: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  venue: string;
  address: string | null;
  capacity: number;
  minAge: number | null;
  dressCode: string | null;
  genres: string | null;
  djLineup: string | null;
  coverImage: string | null;
  galleryImages: string | null;
  bannerUrl: string | null;
  status: string;
  description: string | null;
  approvedGuestCount: number;
  reservationCount: number;
  createdAt: string;
}

export interface EventDetail extends EventListItem {
  sheet: {
    spreadsheetId: string;
    sheetUrl: string;
    sheetTitle: string;
  } | null;
}

function mapEvent(e: any): EventListItem {
  return {
    id: e.id,
    name: e.name,
    slug: e.slug || e.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "",
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
    coverImage: e.coverImage || e.bannerUrl || null,
    galleryImages: e.galleryImages || null,
    bannerUrl: e.bannerUrl || e.coverImage || null,
    status: e.status || "DRAFT",
    description: e.description || null,
    approvedGuestCount: e.approvedGuestCount ?? 0,
    reservationCount: e.reservationCount ?? 0,
    createdAt: e.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

function mapSheet(sheetsMapping: any): EventDetail["sheet"] {
  return sheetsMapping
    ? {
        spreadsheetId: sheetsMapping.spreadsheetId,
        sheetUrl: sheetsMapping.sheetUrl,
        sheetTitle: sheetsMapping.sheetTitle,
      }
    : null;
}

/** Shared: compute approved guest count + reservation count for an event */
async function getReservationStats(eventId: string) {
  const [approvedAgg, reservationCount] = await Promise.all([
    prisma.reservation.aggregate({
      where: { eventId, status: "APPROVED" },
      _sum: { guestCount: true },
    }),
    prisma.reservation.count({ where: { eventId } }),
  ]);
  return {
    approvedGuestCount: approvedAgg._sum.guestCount ?? 0,
    reservationCount,
  };
}

/**
 * Get paginated event list with accurate reservation counts.
 * Uses aggregate for approved guest count (SUM) and total reservation count.
 */
export async function getEventList(options: {
  status?: string;
  venue?: string;
  search?: string;
  onlyUpcoming?: boolean;
  page?: number;
  limit?: number;
}) {
  const { status, venue, search, onlyUpcoming = false, page = 1, limit = 50 } = options;

  const where: any = {};
  if (status && status !== "ALL") where.status = status;
  if (venue && venue !== "ALL") where.venue = venue;
  if (onlyUpcoming) {
    where.date = { gte: new Date() };
    where.status = "PUBLISHED";
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" as const } },
      { venue: { contains: search, mode: "insensitive" as const } },
    ];
  }

  const pageNum = Math.max(1, page);
  const limitNum = Math.min(100, Math.max(1, limit));

  // Try full query; fall back to query without new columns if migration hasn't been applied
  let events: any[];
  let total: number;
  let approvedAgg: any[];
  try {
    [events, total, approvedAgg] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { date: "asc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          _count: { select: { reservations: true } },
        },
      }),
      prisma.event.count({ where }),
      prisma.reservation.groupBy({
        by: ["eventId"],
        where: { status: "APPROVED" },
        _sum: { guestCount: true },
      }),
    ]);
  } catch (queryErr: any) {
    // Fallback: columns may not exist yet (pre-migration state)
    if (queryErr?.code === "P2022" || queryErr?.message?.includes("Unknown column")) {
      [events, total, approvedAgg] = await Promise.all([
        prisma.event.findMany({
          where,
          orderBy: { date: "asc" },
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
          include: {
            _count: { select: { reservations: true } },
          },
        }),
        prisma.event.count({ where }),
        prisma.reservation.groupBy({
          by: ["eventId"],
          where: { status: "APPROVED" },
          _sum: { guestCount: true },
        }),
      ]);
    } else {
      throw queryErr;
    }
  }

  const approvedMap = new Map<string, number>();
  for (const agg of approvedAgg) {
    approvedMap.set(agg.eventId, agg._sum.guestCount ?? 0);
  }

  const eventsWithCounts = events.map((e: any) => ({
    ...e,
    approvedGuestCount: approvedMap.get(e.id) ?? 0,
    reservationCount: e._count?.reservations ?? 0,
  }));

  return {
    events: eventsWithCounts.map(mapEvent),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

/**
 * Get a single event by slug (canonical) or ID (backward compat).
 * Returns event with accurate approved guest count.
 */
export async function getEventBySlug(slugOrId: string): Promise<EventDetail | null> {
  let event: any;
  try {
    event = await prisma.event.findFirst({
      where: {
        OR: [
          { slug: slugOrId },
          { id: slugOrId },
        ],
      },
      include: {
        sheetsMapping: {
          select: { spreadsheetId: true, sheetUrl: true, sheetTitle: true },
        },
      },
    });
  } catch (queryErr: any) {
    // Fallback if slug column doesn't exist (pre-migration state)
    if (queryErr?.code === "P2022" || queryErr?.message?.includes("Unknown column")) {
      event = await prisma.event.findUnique({
        where: { id: slugOrId },
        include: {
          sheetsMapping: {
            select: { spreadsheetId: true, sheetUrl: true, sheetTitle: true },
          },
        },
      });
    } else {
      throw queryErr;
    }
  }

  if (!event) return null;

  const stats = await getReservationStats(event.id);

  return {
    ...mapEvent({ ...event, ...stats }),
    sheet: mapSheet(event.sheetsMapping),
  } as EventDetail;
}

/**
 * Get a single event by ID (admin routes use this).
 */
export async function getEventById(id: string): Promise<EventDetail | null> {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      sheetsMapping: {
        select: { spreadsheetId: true, sheetUrl: true, sheetTitle: true },
      },
    },
  });

  if (!event) return null;

  const stats = await getReservationStats(event.id);

  return {
    ...mapEvent({ ...event, ...stats }),
    sheet: mapSheet(event.sheetsMapping),
  } as EventDetail;
}
