import { NextApiHandler } from "next";
import prisma from "../../lib/prism";
import { hasCapacity } from "../../lib/capacity";
import { appendReservation } from "../../lib/google-sheets";
import { isGoogleSheetsConfigured } from "../../lib/google-sheets-config";
import crypto from "crypto";

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return `GL-${code}`;
}

export const POST: NextApiHandler = async (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const {
    fullName,
    mobile,
    email,
    instagram,
    guestCount = 1,
    eventId,
  } = req.body;

  // Sanitize inputs
  const cleanFullName = typeof fullName === "string" ? fullName.trim().slice(0, 100) : "";
  const cleanMobile = typeof mobile === "string" ? mobile.trim().slice(0, 20) : "";
  const cleanEmail = typeof email === "string" ? email.trim().slice(0, 100) : "";
  const cleanInstagram = typeof instagram === "string" ? instagram.trim().slice(0, 50) : "";
  const clampedGuestCount = Math.min(Math.max(Number(guestCount) || 1, 1), 20);
  const cleanEventId = typeof eventId === "string" ? eventId.trim().slice(0, 50) : "";

  // Validate required fields
  if (!cleanFullName || cleanFullName.length < 2) {
    return res.status(400).json({
      error: "Full Name is required (2-100 characters)"
    });
  }

  if (!cleanMobile || !/^[+\d\s()-]{7,20}$/.test(cleanMobile)) {
    return res.status(400).json({
      error: "Valid mobile number is required (7-20 digits)"
    });
  }

  if (!cleanEventId) {
    return res.status(400).json({ error: "Event ID is required" });
  }

  // Validate email format if provided
  if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Verify event exists
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  // Check capacity before creating reservation
  const guestsToAdd = clampedGuestCount;
  if (!(await hasCapacity(eventId, guestsToAdd))) {
    return res.status(409).json({ error: "Event is at capacity" });
  }

  // Generate reservation code (GL-XXXXXX format) with retry on collision
  const MAX_RETRIES = 3;
  let reservation;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const code = generateCode();
    try {
      reservation = await prisma.reservation.create({
        data: {
          code,
          fullName: cleanFullName,
          mobile: cleanMobile,
          email: cleanEmail || null,
          instagram: cleanInstagram || null,
          guestCount: clampedGuestCount,
          eventId: cleanEventId,
        },
      });
      break;
    } catch (err: any) {
      if (err?.code === 'P2002' && attempt < MAX_RETRIES - 1) {
        continue;
      }
      throw err;
    }
  }

  const responseData = {
    success: true,
    message: "Reservation created successfully",
    reservationCode: reservation!.code,
    guestCount: clampedGuestCount,
    createdAt: reservation!.createdAt,
    fullName: cleanFullName,
    mobile: cleanMobile,
    email: cleanEmail || null,
    instagram: cleanInstagram || null,
  };

  // Sync to Google Sheets (fire-and-forget)
  if (isGoogleSheetsConfigured() && reservation) {
    appendReservation(reservation.eventId, {
      code: reservation.code,
      fullName: reservation.fullName,
      mobile: reservation.mobile,
      email: reservation.email,
      instagram: reservation.instagram,
      guestCount: reservation.guestCount,
      status: reservation.status,
      createdAt: reservation.createdAt,
    }).catch(() => {
      // Silently ignore sync errors — don't block the API response
    });
  }

  res.json(responseData);
};

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }
  return POST(req, res);
}
