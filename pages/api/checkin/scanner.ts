import { NextApiHandler } from "next";
import { getServerSession } from "../../../auth";
import prisma from "../../../lib/prism";

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Admin auth required
  const session = await getServerSession(req, res);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Check if user has admin or staff role
  const userRole = session.user.role;
  if (userRole !== "ADMIN" && userRole !== "STAFF") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { eventId } = req.query;

  if (!eventId || typeof eventId !== "string") {
    return res.status(400).json({ error: "eventId query parameter is required" });
  }

  const reservations = await prisma.reservation.findMany({
    where: { eventId },
    select: {
      id: true,
      code: true,
      fullName: true,
      status: true,
      checkedInAt: true,
    },
  });

  return res.json({ success: true, reservations });
};

export default handler;
