import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { default: prisma } = await import("../../lib/prism");

    const [totalEvents, totalReservations] = await Promise.all([
      prisma.event.count(),
      prisma.reservation.count(),
    ]);

    return res.status(200).json({
      totalEvents,
      totalReservations,
    });
  } catch {
    // Return zeros rather than error — stats are non-critical
    return res.status(200).json({
      totalEvents: 0,
      totalReservations: 0,
    });
  }
}
