/**
 * pages/api/sheets/sync.ts
 *
 * POST — Trigger a full sync of all reservations for an event to Google Sheets.
 * Admin-only endpoint (requires authenticated session).
 *
 * Body: { eventId: string }
 */

import { NextApiHandler } from "next";
import { getServerSession } from "../../../auth";
import prisma from "../../../lib/prism";
import {
  createEventSheet,
  appendReservation,
  setEventSheetMapping,
  getEventSheetMapping,
} from "../../../lib/google-sheets";
import { isGoogleSheetsConfigured } from "../../../lib/google-sheets-config";

const handler: NextApiHandler = async (req, res) => {
  // Auth check
  const session = await getServerSession(req, res);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Method check
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Config check
  if (!isGoogleSheetsConfigured()) {
    return res.status(500).json({
      error: "Google Sheets integration is not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY.",
    });
  }

  const { eventId } = req.body;
  if (!eventId || typeof eventId !== "string") {
    return res.status(400).json({ error: "eventId is required" });
  }

  try {
    // Fetch event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if sheet already exists for this event
    let mapping = await getEventSheetMapping(eventId);
    let spreadsheetId: string;
    let sheetUrl: string;

    if (mapping) {
      spreadsheetId = mapping.spreadsheetId;
      sheetUrl = mapping.sheetUrl;
    } else {
      // Create new sheet
      const result = await createEventSheet(eventId, event.name);
      spreadsheetId = result.spreadsheetId;
      sheetUrl = result.sheetUrl;
    }

    // Fetch all reservations for the event
    const reservations = await prisma.reservation.findMany({
      where: { eventId },
      orderBy: { createdAt: "asc" },
    });

    // Append each reservation to the sheet
    let synced = 0;
    const errors: string[] = [];

    for (const reservation of reservations) {
      try {
        await appendReservation(eventId, {
          code: reservation.code,
          fullName: reservation.fullName,
          mobile: reservation.mobile,
          email: reservation.email,
          instagram: reservation.instagram,
          guestCount: reservation.guestCount,
          status: reservation.status,
          createdAt: reservation.createdAt,
        });
        synced++;
      } catch (err: any) {
        errors.push(`${reservation.code}: ${err?.message ?? "Unknown error"}`);
      }
    }

    return res.json({
      success: true,
      eventId,
      spreadsheetId,
      sheetUrl,
      total: reservations.length,
      synced,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: `Sync failed: ${err?.message ?? "Unknown error"}`,
    });
  }
};

export default handler;
