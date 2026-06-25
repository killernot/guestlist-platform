/**
 * Google Sheets sync backend — Service Account auth via googleapis.
 *
 * Provides:
 *   - appendReservation()      — append a row for a new reservation
 *   - updateReservationStatus() — update the Status column in-place
 *   - createEventSheet()       — create a new spreadsheet for an event
 *
 * All operations use exponential backoff retry (max 5, base 500ms, cap 60s).
 */

import sheetsApi, { sheets_v4 } from "@googleapis/sheets";
import { JWT } from "google-auth-library";
import { getGoogleSheetsConfig } from "./google-sheets-config";
import prisma from "./prism";

// ---- Constants ----

const SHEET_COLUMNS = [
  "Code",
  "Full Name",
  "Mobile",
  "Email",
  "Instagram",
  "Guests",
  "Status",
  "Created",
  "Checked In",
] as const;

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 500;
const MAX_DELAY_MS = 60_000;

// ---- Types ----

export interface SheetEventRecord {
  id: string; // Event ID (used to look up sheet mapping)
  name: string;
  spreadsheetId?: string; // Set after createEventSheet
  sheetUrl?: string;
}

export interface ReservationRow {
  code: string;
  fullName: string;
  mobile: string;
  email?: string | null;
  instagram?: string | null;
  guestCount: number;
  status: string;
  createdAt: Date | string;
}

// ---- Internal helpers ----

let cachedAuth: JWT | null = null;
let cachedSheets: sheets_v4.Sheets | null = null;
let authExpiry: number = 0;

function getAuth(): JWT {
  const now = Date.now();
  // Refresh auth every 55 minutes or if not initialized
  if (!cachedAuth || now > authExpiry - 60_000) {
    const config = getGoogleSheetsConfig();
    cachedAuth = new JWT({
      email: config.serviceAccountEmail,
      key: config.privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    authExpiry = now + 55 * 60 * 1000;
  }
  return cachedAuth;
}

function getSheetsClient(): sheets_v4.Sheets {
  if (!cachedSheets) {
    cachedSheets = sheetsApi.sheets({ version: "v4", auth: getAuth() });
  }
  return cachedSheets;
}

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute an async operation with exponential backoff retry.
 *
 * @param operation - The async function to execute
 * @param description - Human-readable description for error messages
 * @returns The result of the operation
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  description: string
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (err: any) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't retry on client errors (4xx except 429)
      const status = err?.response?.status ?? err?.code;
      if (
        typeof status === "number" &&
        status >= 400 &&
        status < 500 &&
        status !== 429
      ) {
        throw lastError;
      }

      if (attempt < MAX_RETRIES - 1) {
        const delay = Math.min(
          BASE_DELAY_MS * Math.pow(2, attempt),
          MAX_DELAY_MS
        );
        // Add jitter (±25%)
        const jitter = delay * 0.25 * (Math.random() * 2 - 1);
        const sleepTime = Math.round(delay + jitter);
        await sleep(sleepTime);
      }
    }
  }

  throw new Error(
    `${description} failed after ${MAX_RETRIES} attempts: ${lastError?.message ?? "Unknown error"}`
  );
}

// ---- Database-backed spreadsheet mapping ----
// Maps eventId -> { spreadsheetId, sheetUrl, sheetTitle } via Prisma

/**
 * Store the sheet mapping for an event.
 * This is called after createEventSheet() succeeds.
 */
export async function setEventSheetMapping(
  eventId: string,
  spreadsheetId: string,
  sheetUrl: string,
  sheetTitle: string
): Promise<void> {
  await prisma.googleSheetsMapping.upsert({
    where: { eventId },
    update: { spreadsheetId, sheetUrl, sheetTitle },
    create: { eventId, spreadsheetId, sheetUrl, sheetTitle },
  });
}

/**
 * Remove the sheet mapping for an event.
 */
export async function removeEventSheetMapping(eventId: string): Promise<boolean> {
  try {
    await prisma.googleSheetsMapping.delete({ where: { eventId } });
    return true;
  } catch (e: any) {
    if (e.code === "P2025") {
      return false;
    }
    throw e;
  }
}

/**
 * Get the sheet mapping for an event.
 */
export async function getEventSheetMapping(
  eventId: string
): Promise<{ spreadsheetId: string; sheetUrl: string; sheetTitle: string } | undefined> {
  const record = await prisma.googleSheetsMapping.findUnique({ where: { eventId } });
  if (!record) return undefined;
  return {
    spreadsheetId: record.spreadsheetId,
    sheetUrl: record.sheetUrl,
    sheetTitle: record.sheetTitle,
  };
}

// ---- Public API ----

/**
 * Create a new Google Sheet for an event and store rows header.
 *
 * @param eventId - The event ID
 * @param eventName - The event name (used as sheet title)
 * @returns Object with spreadsheetId and sheetUrl
 */
export async function createEventSheet(
  eventId: string,
  eventName: string
): Promise<{ spreadsheetId: string; sheetUrl: string }> {
  const sheets = getSheetsClient();

  const sanitizedName = eventName.slice(0, 100); // Sheet title max 100 chars

  const createResponse = await withRetry(
    () =>
      sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `Guestlist — ${sanitizedName}`,
          },
          sheets: [
            {
              properties: {
                title: sanitizedName,
              },
            },
          ],
        },
      }),
    `Create spreadsheet for event ${eventId}`
  );

  const spreadsheetId = createResponse.data.spreadsheetId!;
  const sheetUrl = createResponse.data.spreadsheetUrl!;
  const sheetTitle = sanitizedName;

  // Write headers
  await withRetry(
    () =>
      sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetTitle}!A1:I1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [SHEET_COLUMNS as unknown as string[]],
        },
      }),
    `Write headers for event ${eventId}`
  );

  // Store mapping
  await setEventSheetMapping(eventId, spreadsheetId, sheetUrl, sheetTitle);

  return { spreadsheetId, sheetUrl };
}

/**
 * Append a reservation row to the event's Google Sheet.
 *
 * @param eventId - The event ID
 * @param row - The reservation data to append
 */
export async function appendReservation(
  eventId: string,
  row: ReservationRow
): Promise<void> {
  const mapping = await getEventSheetMapping(eventId);
  if (!mapping) {
    throw new Error(`No sheet mapping found for event ${eventId}`);
  }

  const sheets = getSheetsClient();

  const values = [
    [
      row.code,
      row.fullName,
      row.mobile,
      row.email ?? "",
      row.instagram ?? "",
      String(row.guestCount),
      row.status,
      typeof row.createdAt === "string"
        ? row.createdAt
        : row.createdAt.toISOString(),
      "",
    ],
  ];

  await withRetry(
    () =>
      sheets.spreadsheets.values.append({
        spreadsheetId: mapping.spreadsheetId,
        range: `${mapping.sheetTitle}!A:I`,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values },
      }),
    `Append reservation ${row.code} for event ${eventId}`
  );
}

/**
 * Update the Status column for a specific reservation in the event's Google Sheet.
 *
 * This scans the "Code" column to find the matching row, then updates
 * the "Status" column in that row.
 *
 * @param eventId - The event ID
 * @param code - The reservation code (e.g. "GL-ABCDEF")
 * @param newStatus - The new status value
 */
export async function updateReservationStatus(
  eventId: string,
  code: string,
  newStatus: string
): Promise<void> {
  const mapping = await getEventSheetMapping(eventId);
  if (!mapping) {
    throw new Error(`No sheet mapping found for event ${eventId}`);
  }

  const sheets = getSheetsClient();

  // Read all values to find the row with the matching code
  const readResponse = await withRetry(
    () =>
      sheets.spreadsheets.values.get({
        spreadsheetId: mapping.spreadsheetId,
        range: `${mapping.sheetTitle}!A:I`,
      }),
    `Read values for event ${eventId} to find reservation ${code}`
  );

  const rows = readResponse.data.values;
  if (!rows || rows.length <= 1) {
    // No data rows (only header), nothing to update
    return;
  }

  // Find the row index (skip header at index 0)
  let targetRowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === code) {
      targetRowIndex = i;
      break;
    }
  }

  if (targetRowIndex === -1) {
    // Reservation not found in sheet — it may not have been synced yet
    return;
  }

  // Update the Status column (column G = index 6)
  const rowNumber = targetRowIndex + 1; // 1-based
  await withRetry(
    () =>
      sheets.spreadsheets.values.update({
        spreadsheetId: mapping.spreadsheetId,
        range: `${mapping.sheetTitle}!G${rowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[newStatus]],
        },
      }),
    `Update status for reservation ${code} to ${newStatus}`
  );
}

/**
 * Update the Status column to CHECKED_IN and set the "Checked In" timestamp
 * for a specific reservation in the event's Google Sheet.
 *
 * This scans the "Code" column to find the matching row, then updates
 * the "Status" column (G) to "CHECKED_IN" and the "Checked In" column (H)
 * with the provided timestamp.
 *
 * @param eventId - The event ID
 * @param code - The reservation code (e.g. "GL-ABCDEF")
 * @param checkedInAt - The check-in timestamp (Date or ISO string)
 */
export async function syncCheckIn(
  eventId: string,
  code: string,
  checkedInAt: Date | string
): Promise<void> {
  const mapping = await getEventSheetMapping(eventId);
  if (!mapping) {
    throw new Error(`No sheet mapping found for event ${eventId}`);
  }

  const sheets = getSheetsClient();

  // Read all values to find the row with the matching code
  const readResponse = await withRetry(
    () =>
      sheets.spreadsheets.values.get({
        spreadsheetId: mapping.spreadsheetId,
        range: `${mapping.sheetTitle}!A:I`,
      }),
    `Read values for event ${eventId} to find reservation ${code} for check-in`
  );

  const rows = readResponse.data.values;
  if (!rows || rows.length <= 1) {
    // No data rows (only header), nothing to update
    return;
  }

  // Find the row index (skip header at index 0)
  let targetRowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === code) {
      targetRowIndex = i;
      break;
    }
  }

  if (targetRowIndex === -1) {
    // Reservation not found in sheet — it may not have been synced yet
    return;
  }

  const rowNumber = targetRowIndex + 1; // 1-based
  const timestamp =
    typeof checkedInAt === "string"
      ? checkedInAt
      : checkedInAt.toISOString();

  // Update both Status (column G = index 7 → letter G) and Checked In (column I = index 8 → letter I)
  const range = `${mapping.sheetTitle}!G${rowNumber}:I${rowNumber}`;
  await withRetry(
    () =>
      sheets.spreadsheets.values.update({
        spreadsheetId: mapping.spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [["CHECKED_IN", "", timestamp]],
        },
      }),
    `Check-in sync for reservation ${code} at ${timestamp}`
  );
}
