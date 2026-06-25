/**
 * pages/api/sheets/events/[eventId].ts
 *
 * GET  — Returns the sheetUrl for the event's Google Sheet (if one exists).
 * POST — Creates a new Google Sheet for the event.
 * DELETE — Removes the sheet mapping for the event.
 *
 * All methods require admin authentication.
 */

import { NextApiHandler } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../auth";
import prisma from "../../../../lib/prism";
import {
  createEventSheet,
  getEventSheetMapping,
  removeEventSheetMapping,
} from "../../../../lib/google-sheets";
import { isGoogleSheetsConfigured } from "../../../../lib/google-sheets-config";

const handler: NextApiHandler = async (req, res) => {
  // Auth check
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { eventId } = req.query;
  if (typeof eventId !== "string") {
    return res.status(400).json({ error: "Invalid event ID" });
  }

  // Verify event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });
  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  // GET — Return sheet URL
  if (req.method === "GET") {
    const mapping = await getEventSheetMapping(eventId);
    if (!mapping) {
      return res.json({ sheetUrl: null, spreadsheetId: null });
    }
    return res.json({
      sheetUrl: mapping.sheetUrl,
      spreadsheetId: mapping.spreadsheetId,
      sheetTitle: mapping.sheetTitle,
    });
  }

  // POST — Create sheet
  if (req.method === "POST") {
    if (!isGoogleSheetsConfigured()) {
      return res.status(500).json({
        error: "Google Sheets integration is not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY.",
      });
    }

    // Check if sheet already exists
    const existing = await getEventSheetMapping(eventId);
    if (existing) {
      return res.json({
        success: true,
        sheetUrl: existing.sheetUrl,
        spreadsheetId: existing.spreadsheetId,
        message: "Sheet already exists",
      });
    }

    try {
      const result = await createEventSheet(eventId, event.name);
      return res.json({
        success: true,
        sheetUrl: result.sheetUrl,
        spreadsheetId: result.spreadsheetId,
        message: "Sheet created successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        error: `Failed to create sheet: ${err?.message ?? "Unknown error"}`,
      });
    }
  }

  // DELETE — Remove mapping
  if (req.method === "DELETE") {
    const removed = await removeEventSheetMapping(eventId);
    return res.json({
      success: true,
      removed,
      message: removed
        ? "Sheet mapping removed"
        : "No sheet mapping found for this event",
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
};

export default handler;
