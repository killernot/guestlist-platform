import { NextApiHandler } from "next";
import prisma from "../../lib/prism";

export const POST: NextApiHandler = async (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { fullName, mobile, email, instagram, guestCount = 1, eventId } = req.body;

  if (!fullName || !mobile) {
    return res.status(400).json({
      error: "Full Name and Mobile Number are required"
    });
  }

  if (!eventId) {
    return res.status(400).json({ error: "Event ID is required" });
  }

  // Verify event exists
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  // Generate reservation code (GL-XXXXXX format)
  const code = `GL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const reservation = await prisma.reservation.create({
    data: {
      code,
      fullName,
      mobile,
      email: email || null,
      instagram: instagram || null,
      guestCount: Number(guestCount) || 1,
      eventId,
    },
  });

  res.json({
    success: true,
    message: "Reservation created successfully",
    reservationCode: reservation.code,
    guestCount: reservation.guestCount,
    createdAt: reservation.createdAt,
    fullName: reservation.fullName,
    mobile: reservation.mobile,
    email: reservation.email,
    instagram: reservation.instagram,
  });
};

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
