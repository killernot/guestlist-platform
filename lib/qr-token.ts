/**
 * lib/qr-token.ts
 *
 * QR token generation and verification using HMAC-SHA256.
 *
 * Token format: base64url(JSON payload).base64url(HMAC-SHA256 signature)
 * Payload: { rid, code, exp }
 */

import crypto from "crypto";

/**
 * Get the QR secret, reading from env at call time (allows test stubbing).
 */
function getSecret(): string {
  const s = process.env.QR_SECRET || "";
  if (!s) {
    console.warn("[qr-token] QR_SECRET env var is not set — token verification will fail at runtime.");
  }
  return s;
}

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface QrPayload {
  rid: string;
  code: string;
  exp: number;
}

/**
 * Base64url-encode a Buffer (no padding, URL-safe).
 */
function base64urlEncode(buf: Buffer): string {
  return buf.toString("base64url");
}

/**
 * Base64url-decode a string into a Buffer.
 */
function base64urlDecode(str: string): Buffer {
  return Buffer.from(str, "base64url");
}

/**
 * Compute HMAC-SHA256 over a message using the QR_SECRET.
 */
function sign(message: string): string {
  return crypto.createHmac("sha256", getSecret()).update(message).digest("base64url");
}

/**
 * Generate a signed QR token for a reservation.
 *
 * @param reservationId - The reservation's unique ID
 * @param code - The reservation code (e.g. "GL-ABCDEF")
 * @returns A signed token string suitable for embedding in a QR code
 */
export function generateQrToken(reservationId: string, code: string): string {
  const payload: QrPayload = {
    rid: reservationId,
    code,
    exp: Date.now() + TOKEN_TTL_MS,
  };

  const payloadB64 = base64urlEncode(Buffer.from(JSON.stringify(payload)));
  const signature = sign(payloadB64);

  return `${payloadB64}.${signature}`;
}

/**
 * Verify a QR token's signature and expiry, and extract the payload.
 *
 * @param token - The token string from the QR code
 * @returns { valid: boolean, reservationId?: string, code?: string }
 */
export function verifyQrToken(token: string): {
  valid: boolean;
  reservationId?: string;
  code?: string;
} {
  if (!token || typeof token !== "string") {
    return { valid: false };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false };
  }

  const [payloadB64, providedSignature] = parts;

  if (!providedSignature) {
    return { valid: false };
  }

  // Verify signature
  const expectedSignature = sign(payloadB64);
  const providedBuf = Buffer.from(providedSignature);
  const expectedBuf = Buffer.from(expectedSignature);

  if (
    providedBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(providedBuf, expectedBuf)
  ) {
    return { valid: false };
  }

  // Decode payload
  try {
    const payloadJson = base64urlDecode(payloadB64).toString("utf-8");
    const payload: QrPayload = JSON.parse(payloadJson);

    if (!payload.rid || !payload.code) {
      return { valid: false };
    }

    // Check expiry
    if (typeof payload.exp === "number" && Date.now() > payload.exp) {
      return { valid: false };
    }

    return {
      valid: true,
      reservationId: payload.rid,
      code: payload.code,
    };
  } catch {
    return { valid: false };
  }
}
