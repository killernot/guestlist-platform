/**
 * Google Sheets configuration — env-based initialization.
 *
 * Environment variables:
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL  - Service account email (e.g. sa@project.iam.gserviceaccount.com)
 *   GOOGLE_PRIVATE_KEY             - Service account private key (PEM, literal or base64-encoded)
 *   GOOGLE_SHEETS_SPREADSHEET_ID  - Default spreadsheet ID (optional, used as fallback)
 */

export interface GoogleSheetsConfig {
  serviceAccountEmail: string;
  privateKey: string;
  defaultSpreadsheetId?: string;
}

/**
 * Load Google Sheets configuration from environment variables.
 * Throws if required variables are missing.
 */
export function getGoogleSheetsConfig(): GoogleSheetsConfig {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;
  const defaultSpreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!serviceAccountEmail) {
    throw new Error(
      "Missing required environment variable: GOOGLE_SERVICE_ACCOUNT_EMAIL"
    );
  }

  if (!privateKeyRaw) {
    throw new Error(
      "Missing required environment variable: GOOGLE_PRIVATE_KEY"
    );
  }

  // Decode private key: handle base64-encoded or literal PEM
  let privateKey = privateKeyRaw;
  const trimmed = privateKeyRaw.trim();

  // If it doesn't look like a PEM literal, try base64 decode
  if (!trimmed.startsWith("-----BEGIN")) {
    try {
      privateKey = Buffer.from(trimmed, "base64").toString("utf-8");
      // Verify the decoded result looks like a PEM key
      if (!privateKey.startsWith("-----BEGIN")) {
        // If still not PEM, use the raw value as-is
        privateKey = privateKeyRaw;
      }
    } catch {
      // Not valid base64, use raw value
      privateKey = privateKeyRaw;
    }
  }

  return {
    serviceAccountEmail,
    privateKey,
    defaultSpreadsheetId,
  };
}

/**
 * Check if Google Sheets integration is configured (has required env vars).
 */
export function isGoogleSheetsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY
  );
}
