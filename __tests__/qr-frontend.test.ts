import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mocks (hoisted before imports) ----

const mockPrisma = vi.hoisted(() => ({
  reservation: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("../lib/prism", () => ({ default: mockPrisma }));
vi.mock("../lib/qr-token", () => ({
  generateQrToken: vi.fn(),
  verifyQrToken: vi.fn(),
}));
vi.mock("../lib/google-sheets", () => ({
  updateReservationStatus: vi.fn(),
  syncCheckIn: vi.fn(),
}));
vi.mock("../lib/google-sheets-config", () => ({
  isGoogleSheetsConfigured: vi.fn(() => false),
}));
vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(() => Promise.resolve({ user: { id: "admin1" } })),
}));
vi.mock("../auth", () => ({ authOptions: {} }));

// ---- Check-in Verify API Tests ----

describe("Check-in Verify API — Full Flow", () => {
  let handler: any;
  let res: any;

  beforeEach(async () => {
    vi.resetAllMocks();
    res = { status: vi.fn(() => res), json: vi.fn(() => res) } as any;
    // Re-import handler fresh
    vi.resetModules();
    const mod = await import("../pages/api/checkin/verify");
    handler = mod.default;
  });

  it("returns 405 for non-POST methods", async () => {
    const req = { method: "GET", body: {} } as any;
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("returns 400 when token is missing from body", async () => {
    const req = { method: "POST", body: {} } as any;
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Token is required" });
  });

  it("returns 400 for invalid token", async () => {
    const { verifyQrToken } = await import("../lib/qr-token");
    (verifyQrToken as any).mockReturnValue({ valid: false });

    const req = { method: "POST", body: { token: "bad-token" } } as any;
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid or expired token" });
  });

  it("returns 404 for non-existent token", async () => {
    const { verifyQrToken } = await import("../lib/qr-token");
    (verifyQrToken as any).mockReturnValue({ valid: true, reservationId: "ghost", code: "GL-GHOST" });
    mockPrisma.reservation.findUnique.mockResolvedValue(null);

    const req = { method: "POST", body: { token: "ghost-token" } } as any;
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 409 for already CHECKED_IN reservation", async () => {
    const { verifyQrToken } = await import("../lib/qr-token");
    (verifyQrToken as any).mockReturnValue({ valid: true, reservationId: "res1", code: "GL-ABC" });
    mockPrisma.reservation.findUnique.mockResolvedValue({
      id: "res1", code: "GL-ABC", fullName: "Juan", status: "CHECKED_IN", eventId: "evt1", qrToken: "t",
    });

    const req = { method: "POST", body: { token: "t" } } as any;
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "Already checked in" });
  });

  it("returns 400 for PENDING reservation", async () => {
    const { verifyQrToken } = await import("../lib/qr-token");
    (verifyQrToken as any).mockReturnValue({ valid: true, reservationId: "res1", code: "GL-P" });
    mockPrisma.reservation.findUnique.mockResolvedValue({
      id: "res1", code: "GL-P", fullName: "Pending", status: "PENDING", eventId: "evt1", qrToken: "t",
    });

    const req = { method: "POST", body: { token: "t" } } as any;
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Reservation is pending approval" });
  });

  it("returns 400 for REJECTED reservation", async () => {
    const { verifyQrToken } = await import("../lib/qr-token");
    (verifyQrToken as any).mockReturnValue({ valid: true, reservationId: "res1", code: "GL-R" });
    mockPrisma.reservation.findUnique.mockResolvedValue({
      id: "res1", code: "GL-R", fullName: "Rejected", status: "REJECTED", eventId: "evt1", qrToken: "t",
    });

    const req = { method: "POST", body: { token: "t" } } as any;
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Reservation was rejected" });
  });

  it("succeeds for APPROVED reservation and updates to CHECKED_IN", async () => {
    const { verifyQrToken } = await import("../lib/qr-token");
    (verifyQrToken as any).mockReturnValue({ valid: true, reservationId: "res1", code: "GL-OK" });
    mockPrisma.reservation.findUnique.mockResolvedValue({
      id: "res1", code: "GL-OK", fullName: "Approved Guest", status: "APPROVED", eventId: "evt1", qrToken: "t",
    });
    mockPrisma.reservation.update.mockResolvedValue({
      id: "res1", code: "GL-OK", fullName: "Approved Guest", status: "CHECKED_IN", checkedInAt: new Date(), eventId: "evt1",
    });

    const req = { method: "POST", body: { token: "t" } } as any;
    await handler(req, res);

    expect(mockPrisma.reservation.update).toHaveBeenCalledWith({
      where: { id: "res1" },
      data: expect.objectContaining({ status: "CHECKED_IN" }),
    });
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  it("rejects invalid token format (no dot separator)", async () => {
    const { verifyQrToken } = await import("../lib/qr-token");
    (verifyQrToken as any).mockReturnValue({ valid: false });

    const req = { method: "POST", body: { token: "nodot" } } as any;
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ---- Scanner Data API Tests ----

describe("Scanner Data API", () => {
  let handler: any;
  let res: any;

  beforeEach(async () => {
    vi.resetAllMocks();
    res = { status: vi.fn(() => res), json: vi.fn(() => res) } as any;
    vi.resetModules();
    const mod = await import("../pages/api/checkin/scanner");
    handler = mod.default;
  });

  it("requires authentication", async () => {
    const { getServerSession } = await import("next-auth/next");
    (getServerSession as any).mockResolvedValue(null);

    const req = { method: "GET", query: {} } as any;
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 403 for non-admin/staff users", async () => {
    const { getServerSession } = await import("next-auth/next");
    (getServerSession as any).mockResolvedValue({ user: { id: "u1", role: "USER" } });

    const req = { method: "GET", query: { eventId: "evt1" } } as any;
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("returns reservations for an event", async () => {
    const { getServerSession } = await import("next-auth/next");
    (getServerSession as any).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } });
    mockPrisma.reservation.findMany.mockResolvedValue([
      { id: "r1", code: "GL-001", fullName: "Alice", status: "APPROVED", checkedInAt: null },
      { id: "r2", code: "GL-002", fullName: "Bob", status: "CHECKED_IN", checkedInAt: "2026-06-25T10:00:00Z" },
    ]);

    const req = { method: "GET", query: { eventId: "evt1" } } as any;
    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        reservations: expect.arrayContaining([
          expect.objectContaining({ code: "GL-001" }),
          expect.objectContaining({ code: "GL-002" }),
        ]),
      })
    );
  });

  it("returns 400 when eventId is missing", async () => {
    const { getServerSession } = await import("next-auth/next");
    (getServerSession as any).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } });

    const req = { method: "GET", query: {} } as any;
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 405 for non-GET methods", async () => {
    const req = { method: "POST", query: { eventId: "evt1" } } as any;
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });
});
