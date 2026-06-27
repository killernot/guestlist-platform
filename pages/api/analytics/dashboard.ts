import { NextApiHandler } from "next";
import { getServerSession } from "../../../auth";
import prisma from "../../../lib/prism";

const handler: NextApiHandler = async (req, res) => {
  const session = await getServerSession(req, res);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { eventId } = req.query;
    const eventIdFilter =
      typeof eventId === "string" ? eventId : undefined;

    // Date range: last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Build where clause for reservations
    const reservationWhere = eventIdFilter
      ? { eventId: eventIdFilter }
      : {};

    // --- Event info ---
    let eventInfo: {
      id: string;
      name: string;
      date: string;
      venue: string;
      capacity: number;
    } | null = null;

    if (eventIdFilter) {
      const event = await prisma.event.findUnique({
        where: { id: eventIdFilter },
        select: { id: true, name: true, date: true, venue: true, capacity: true },
      });
      if (event) {
        eventInfo = {
          id: event.id,
          name: event.name,
          date: event.date.toISOString(),
          venue: event.venue,
          capacity: event.capacity,
        };
      }
    }

    // --- Status counts via groupBy ---
    const statusGroups = await prisma.reservation.groupBy({
      by: ["status"],
      where: reservationWhere,
      _count: { _all: true },
    });

    const statusCounts: Record<string, number> = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      CHECKED_IN: 0,
    };

    for (const group of statusGroups) {
      statusCounts[group.status] = group._count._all;
    }

    const totalReservations =
      statusCounts.PENDING + statusCounts.APPROVED + statusCounts.REJECTED + statusCounts.CHECKED_IN;
    const approved = statusCounts.APPROVED;
    const checkedIn = statusCounts.CHECKED_IN;
    const pending = statusCounts.PENDING;
    const rejected = statusCounts.REJECTED;

    // --- Capacity & guest count ---
    let capacity = 0;
    if (eventIdFilter) {
      const event = await prisma.event.findUnique({
        where: { id: eventIdFilter },
        select: { capacity: true },
      });
      capacity = event?.capacity ?? 0;
    }

    const remainingSpots = Math.max(capacity - approved, 0);

    // --- Aggregate guest count for APPROVED reservations ---
    const guestCountResult = await prisma.reservation.aggregate({
      where: { ...reservationWhere, status: "APPROVED" },
      _sum: { guestCount: true },
    });
    const totalGuestCount = guestCountResult._sum.guestCount ?? 0;

    // --- Rates ---
    const attendanceRate = approved > 0 ? (checkedIn / approved) * 100 : 0;
    const noShowRate = approved > 0 ? ((approved - checkedIn) / approved) * 100 : 0;

    // --- Capacity Utilization ---
    const utilizationPercent =
      capacity > 0 ? (totalGuestCount / capacity) * 100 : 0;

    // --- Trends: Reservation created per day (last 7 days) ---
    const reservationTrendRaw = await prisma.reservation.findMany({
      where: {
        ...reservationWhere,
        createdAt: { gte: sevenDaysAgo },
      },
      select: { createdAt: true },
    });

    // --- Trends: Check-ins per day (last 7 days) ---
    const checkinTrendRaw = await prisma.reservation.findMany({
      where: {
        ...reservationWhere,
        checkedInAt: { gte: sevenDaysAgo },
      },
      select: { checkedInAt: true },
    });

    // Build date map for last 7 days
    const dateMap: Record<string, { resCount: number; checkinCount: number }> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dateMap[key] = { resCount: 0, checkinCount: 0 };
    }

    for (const r of reservationTrendRaw) {
      const key = r.createdAt.toISOString().split("T")[0];
      if (key in dateMap) {
        dateMap[key].resCount++;
      }
    }

    for (const r of checkinTrendRaw) {
      if (r.checkedInAt) {
        const key = r.checkedInAt.toISOString().split("T")[0];
        if (key in dateMap) {
          dateMap[key].checkinCount++;
        }
      }
    }

    const reservationTrends = Object.entries(dateMap)
      .map(([date, data]) => ({ date, count: data.resCount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const checkinTrends = Object.entries(dateMap)
      .map(([date, data]) => ({ date, count: data.checkinCount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // --- Event Comparison (when no eventId) ---
    let comparison: {
      eventName: string;
      totalReservations: number;
      checkedIn: number;
      capacity: number;
      utilizationPercent: number;
    }[] = [];

    if (!eventIdFilter) {
      // Get all events with reservation counts
      const events = await prisma.event.findMany({
        select: {
          name: true,
          capacity: true,
          reservations: {
            select: { status: true, guestCount: true },
          },
        },
        orderBy: { date: "desc" },
        take: 20,
      });

      comparison = events.map((evt) => {
        const totalRes = evt.reservations.length;
        const ci = evt.reservations.filter(
          (r) => r.status === "CHECKED_IN"
        ).length;
        const approvedGuests = evt.reservations
          .filter((r) => r.status === "APPROVED" || r.status === "CHECKED_IN")
          .reduce((sum, r) => sum + r.guestCount, 0);
        const utilPct =
          evt.capacity > 0 ? (approvedGuests / evt.capacity) * 100 : 0;

        return {
          eventName: evt.name,
          totalReservations: totalRes,
          checkedIn: ci,
          capacity: evt.capacity,
          utilizationPercent: Math.round(utilPct * 100) / 100,
        };
      });
    }

    return res.json({
      success: true,
      event: eventInfo,
      metrics: {
        totalReservations,
        approved,
        checkedIn,
        pending,
        rejected,
        remainingSpots,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        noShowRate: Math.round(noShowRate * 100) / 100,
        utilizationPercent: Math.round(utilizationPercent * 100) / 100,
        totalGuestCount,
      },
      trends: {
        reservations: reservationTrends,
        checkins: checkinTrends,
      },
      comparison,
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;
