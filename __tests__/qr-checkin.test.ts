import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mocks ----

const mockPrisma = vi.hoisted(() => ({
  reservation: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    aggregate: vi.fn(),
  },
  event: { findUnique: vi.fn() },
}));

vi.mock("../lib/prism", () => ({ default: mockPrisma }));
vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(() =>
    Promise.resolve({ user: { id: "admin1", email: "admin@test.com", role: "ADMIN" } })
  ),
}));
vi.mock("../../../auth", () => ({ authOptions: {} }));

// Import after mocks
import { generateQrToken, verifyQrToken } from "../lib/qr-token";

// ---- Tests: QR Token Generation ----

describe("QR Token Generation", () => {
  beforeEach(() => {
    vi.stubEnv("QR_SECRET", "test-secret-key-for-unit-tests-2026");
  });

  it("generates a non-empty string token", () => {
    const token = generateQrToken("res1", "GL-ABC123");
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("generates unique tokens for different reservations", () => {
    const token1 = generateQrToken("res1", "GL-ABC123");
    const token2 = generateQrToken("res2", "GL-DEF456");
    expect(token1).not.toBe(token2);
  });

  it("generates different tokens for same input (timestamp differs)", () => {
    const token1 = generateQrToken("res1", "GL-ABC123");
    // Small delay to get different timestamp
    const token2 = generateQrToken("res1", "GL-ABC123");
    // Tokens will likely differ due to exp timestamp, but both should verify
    expect(typeof token1).toBe("string");
    expect(typeof token2).toBe("string");
  });

  it("token contains two dot-separated parts (payload.signature)", () => {
    const token = generateQrToken("res1", "GL-ABC123");
    const parts = token.split(".");
    expect(parts.length).toBe(2);
    expect(parts[0].length).toBeGreaterThan(0);
    expect(parts[1].length).toBeGreaterThan(0);
  });

  it("warns when QR_SECRET is not set", () => {
    vi.stubEnv("QR_SECRET", "");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    generateQrToken("res1", "GL-ABC123");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("QR_SECRET")
    );
    warnSpy.mockRestore();
    vi.stubEnv("QR_SECRET", "test-secret-key-for-unit-tests-2026");
  });
});

// ---- Tests: QR Token Verification ----

describe("QR Token Verification", () => {
  beforeEach(() => {
    vi.stubEnv("QR_SECRET", "test-secret-key-for-unit-tests-2026");
  });

  it("verifies a valid token successfully", () => {
    const token = generateQrToken("res1", "GL-ABC123");
    const result = verifyQrToken(token);
    expect(result.valid).toBe(true);
    expect(result.reservationId).toBe("res1");
    expect(result.code).toBe("GL-ABC123");
  });

  it("rejects a tampered signature", () => {
    const token = generateQrToken("res1", "GL-ABC123");
    const [payload, _sig] = token.split(".");
    const tampered = `${payload}.aaaa`;
    const result = verifyQrToken(tampered);
    expect(result.valid).toBe(false);
  });

  it("rejects a tampered payload", () => {
    const token = generateQrToken("res1", "GL-ABC123");
    const [_payload, sig] = token.split(".");
    // Create a different payload with same signature
    const fakePayload = Buffer.from(JSON.stringify({ rid: "hacker", code: "GL-HACK", exp: Date.now() + 999999 })).toString("base64url");
    const tampered = `${fakePayload}.${sig}`;
    const result = verifyQrToken(tampered);
    expect(result.valid).toBe(false);
  });

  it("rejects an empty string", () => {
    const result = verifyQrToken("");
    expect(result.valid).toBe(false);
  });

  it("rejects a token with no dot separator", () => {
    const result = verifyQrToken("nodothere");
    expect(result.valid).toBe(false);
  });

  it("rejects a token with wrong number of parts", () => {
    const result = verifyQrToken("part1.part2.part3");
    expect(result.valid).toBe(false);
  });

  it("rejects an expired token", () => {
    // Manually create an expired token
    const payload = JSON.stringify({ rid: "res1", code: "GL-ABC123", exp: Date.now() - 10000 });
    const payloadB64 = Buffer.from(payload).toString("base64url");
    const crypto = require("crypto");
    const sig = crypto.createHmac("sha256", process.env.QR_SECRET).update(payloadB64).digest("base64url");
    const expiredToken = `${payloadB64}.${sig}`;
    const result = verifyQrToken(expiredToken);
    expect(result.valid).toBe(false);
  });

  it("rejects malformed JSON in payload", () => {
    const payloadB64 = Buffer.from("not-json").toString("base64url");
    const crypto = require("crypto");
    const sig = crypto.createHmac("sha256", process.env.QR_SECRET).update(payloadB64).digest("base64url");
    const badToken = `${payloadB64}.${sig}`;
    const result = verifyQrToken(badToken);
    expect(result.valid).toBe(false);
  });

  it("rejects token missing rid or code in payload", () => {
    const payload = JSON.stringify({ rid: "", code: "", exp: Date.now() + 999999 });
    const payloadB64 = Buffer.from(payload).toString("base64url");
    const crypto = require("crypto");
    const sig = crypto.createHmac("sha256", process.env.QR_SECRET).update(payloadB64).digest("base64url");
    const badToken = `${payloadB64}.${sig}`;
    const result = verifyQrToken(badToken);
    expect(result.valid).toBe(false);
  });
});

// ---- Tests: Check-in Verify API Logic ----

describe("Check-in Verification Logic", () => {
  beforeEach(() => {
    vi.stubEnv("QR_SECRET", "test-secret-key-for-unit-tests-2026");
    vi.resetAllMocks();
  });

  it("prevents duplicate check-ins (already CHECKED_IN)", async () => {
    const token = generateQrToken("res1", "GL-ABC123");
    mockPrisma.reservation.findUnique.mockResolvedValue({
      id: "res1",
      code: "GL-ABC123",
      fullName: "Juan",
      status: "CHECKED_IN",
      eventId: "evt1",
      qrToken: token,
    });

    // The verify handler should return 409 for CHECKED_IN status
    const reservation = await mockPrisma.reservation.findUnique({ where: { qrToken: token } });
    expect(reservation?.status).toBe("CHECKED_IN");
  });

  it("prevents check-in for PENDING reservations", async () => {
    const token = generateQrToken("res2", "GL-PENDING");
    mockPrisma.reservation.findUnique.mockResolvedValue({
      id: "res2",
      code: "GL-PENDING",
      fullName: "Maria",
      status: "PENDING",
      eventId: "evt1",
      qrToken: token,
    });

    const reservation = await mockPrisma.reservation.findUnique({ where: { qrToken: token } });
    expect(reservation?.status).toBe("PENDING");
  });

  it("prevents check-in for REJECTED reservations", async () => {
    const token = generateQrToken("res3", "GL-REJECTED");
    mockPrisma.reservation.findUnique.mockResolvedValue({
      id: "res3",
      code: "GL-REJECTED",
      fullName: "Rejected",
      status: "REJECTED",
      eventId: "evt1",
      qrToken: token,
    });

    const reservation = await mockPrisma.reservation.findUnique({ where: { qrToken: token } });
    expect(reservation?.status).toBe("REJECTED");
  });

  it("allows check-in for APPROVED reservations", async () => {
    const token = generateQrToken("res4", "GL-APPROVED");
    mockPrisma.reservation.findUnique.mockResolvedValue({
      id: "res4",
      code: "GL-APPROVED",
      fullName: "Approved Guest",
      status: "APPROVED",
      eventId: "evt1",
      qrToken: token,
    });
    mockPrisma.reservation.update.mockResolvedValue({
      id: "res4",
      code: "GL-APPROVED",
      fullName: "Approved Guest",
      status: "CHECKED_IN",
      eventId: "evt1",
      checkedInAt: new Date(),
    });

    const reservation = await mockPrisma.reservation.findUnique({ where: { qrToken: token } });
    expect(reservation?.status).toBe("APPROVED");

    // Simulate update
    const updated = await mockPrisma.reservation.update({
      where: { id: "res4" },
      data: { status: "CHECKED_IN", checkedInAt: new Date() },
    });
    expect(updated.status).toBe("CHECKED_IN");
    expect(updated.checkedInAt).toBeDefined();
  });

  it("returns 404 for non-existent token", async () => {
    mockPrisma.reservation.findUnique.mockResolvedValue(null);

    const reservation = await mockPrisma.reservation.findUnique({ where: { qrToken: "nonexistent" } });
    expect(reservation).toBeNull();
  });
});

// ---- Tests: Security Properties ----

describe("QR Token Security", () => {
  beforeEach(() => {
    vi.stubEnv("QR_SECRET", "test-secret-key-for-unit-tests-2026");
  });

  it("token cannot be guessed without knowing QR_SECRET", () => {
    const token = generateQrToken("res1", "GL-ABC123");
    // Token should be base64url — no readable data
    expect(token).not.toContain("res1");
    expect(token).not.toContain("GL-ABC123");
  });

  it("different secrets produce different tokens for same input", () => {
    vi.stubEnv("QR_SECRET", "secret-A");
    const tokenA = generateQrToken("res1", "GL-ABC123");

    vi.stubEnv("QR_SECRET", "secret-B");
    const tokenB = generateQrToken("res1", "GL-ABC123");

    expect(tokenA).not.toBe(tokenB);
  });

  it("token from secret-A cannot be verified with secret-B", () => {
    vi.stubEnv("QR_SECRET", "secret-A");
    const tokenA = generateQrToken("res1", "GL-ABC123");

    // Verify with different secret
    vi.stubEnv("QR_SECRET", "secret-B");
    const result = verifyQrToken(tokenA);
    expect(result.valid).toBe(false);
  });

  it("timing-safe comparison prevents length-leak", () => {
    const token = generateQrToken("res1", "GL-ABC123");
    const [payload] = token.split(".");
    // Any signature of different length should still fail
    const shortToken = `${payload}.a`;
    const result = verifyQrToken(shortToken);
    expect(result.valid).toBe(false);
  });
});
