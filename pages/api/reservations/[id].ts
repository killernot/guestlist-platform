import { NextApiHandler } from "next";
import { getServerSession } from "../../../auth";
import prisma from "../../../lib/prism";
import { hasCapacity } from "../../../lib/capacity";
import { updateReservationStatus as syncStatusUpdate, syncCheckIn } from "../../../lib/google-sheets";
import { isGoogleSheetsConfigured } from "../../../lib/google-sheets-config";
import { generateQrToken } from "../../../lib/qr-token";

const handler: NextApiHandler = async (req, res) => {
  const session = await getServerSession(req, res);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: "Invalid reservation ID" });
  }

  if (req.method === 'PATCH') {
    const { status } = req.body;

    if (!status || !['PENDING', 'APPROVED', 'REJECTED', 'CHECKED_IN'].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    try {
      // When approving, check capacity first and generate QR token
      let qrToken: string | undefined;
      if (status === "APPROVED") {
        const reservation = await prisma.reservation.findUnique({ where: { id } });
        if (!reservation) {
          return res.status(404).json({ error: "Reservation not found" });
        }
        if (!(await hasCapacity(reservation.eventId, reservation.guestCount))) {
          return res.status(409).json({ error: "Event is at capacity" });
        }
        // Auto-generate QR token for check-in
        qrToken = generateQrToken(id, reservation.code);
      }

      const updated = await prisma.reservation.update({
        where: { id },
        data: {
          status,
          ...(qrToken ? { qrToken } : {}),
        },
      });

      // Sync status change to Google Sheets (fire-and-forget)
      if (isGoogleSheetsConfigured()) {
        if (status === "CHECKED_IN") {
          const checkedInAt = req.body.checkedInAt ?? new Date();
          syncCheckIn(updated.eventId, updated.code, checkedInAt).catch(() => {
            // Silently ignore sync errors — don't block the API response
          });
        } else {
          syncStatusUpdate(updated.eventId, updated.code, status).catch(() => {
            // Silently ignore sync errors — don't block the API response
          });
        }
      }

      return res.json({ success: true, reservation: updated });
    } catch (e: any) {
      if (e.code === 'P2025') {
        return res.status(404).json({ error: "Reservation not found" });
      }
      throw e;
    }
  }

  if (req.method === 'GET') {
    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }
    return res.json(reservation);
  }

  return res.status(405).json({ error: "Method not allowed" });
};

export default handler;
