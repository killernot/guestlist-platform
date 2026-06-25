import { NextApiHandler } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth";
import prisma from "../../../lib/prism";
import { verifyQrToken } from "../../../lib/qr-token";


const handler: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token } = req.body;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "Token is required" });
  }

  // Verify the token signature and expiry
  const result = verifyQrToken(token);
  if (!result.valid) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }

  // Find reservation by qrToken
  const reservation = await prisma.reservation.findUnique({
    where: { qrToken: token },
  });

  if (!reservation) {
    return res.status(404).json({ error: "Reservation not found" });
  }

  if (reservation.status === "CHECKED_IN") {
    return res.status(409).json({ error: "Already checked in" });
  }

  if (reservation.status === "PENDING") {
    return res.status(400).json({ error: "Reservation is pending approval" });
  }

  if (reservation.status === "REJECTED") {
    return res.status(400).json({ error: "Reservation was rejected" });
  }

  // Update reservation to CHECKED_IN
  const checkedInAt = new Date();
  const updated = await prisma.reservation.update({
    where: { id: reservation.id },
    data: {
      status: "CHECKED_IN",
      checkedInAt,
    },
  });

  // Google Sheets sync deferred — handled by caller or webhook

  return res.json({
    success: true,
    reservation: {
      code: updated.code,
      fullName: updated.fullName,
      status: updated.status,
    },
  });
};

export default handler;
