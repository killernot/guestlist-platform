import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  event: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn() },
  reservation: { create: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn() },
  adminUser: { findFirst: vi.fn(), findUnique: vi.fn() },
}));

vi.mock("../lib/prism", () => ({ default: mockPrisma }));

import { POST } from "../pages/api/register";

function createReq(body: any) {
  return { method: "POST", body, query: {} } as any;
}
function createRes() {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe("POST /api/register", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a reservation with valid data", async () => {
    mockPrisma.event.findUnique.mockResolvedValue({ id: "evt1", name: "Test Event", capacity: 100 });
    mockPrisma.reservation.create.mockResolvedValue({
      id: "res1", code: "GL-ABC123", fullName: "Juan Dela Cruz",
      mobile: "09171234567", email: "juan@test.com", guestCount: 2,
      eventId: "evt1", status: "PENDING", createdAt: new Date(),
    });

    const req = createReq({
      fullName: "Juan Dela Cruz", mobile: "09171234567",
      email: "juan@test.com", guestCount: 2, eventId: "evt1",
    });
    const res = createRes();
    await POST(req, res);

    expect(mockPrisma.event.findUnique).toHaveBeenCalledWith({ where: { id: "evt1" } });
    expect(mockPrisma.reservation.create).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true, reservationCode: "GL-ABC123", fullName: "Juan Dela Cruz",
    }));
  });

  it("returns 400 when fullName is missing", async () => {
    const req = createReq({ mobile: "09171234567", eventId: "evt1" });
    const res = createRes();
    await POST(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockPrisma.reservation.create).not.toHaveBeenCalled();
  });

  it("returns 400 when mobile is missing", async () => {
    const req = createReq({ fullName: "Juan", eventId: "evt1" });
    const res = createRes();
    await POST(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 when eventId is missing", async () => {
    const req = createReq({ fullName: "Juan", mobile: "0917" });
    const res = createRes();
    await POST(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining("Event ID") }));
  });

  it("returns 404 when event does not exist", async () => {
    mockPrisma.event.findUnique.mockResolvedValue(null);
    const req = createReq({ fullName: "Juan", mobile: "0917", eventId: "nonexistent" });
    const res = createRes();
    await POST(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Event not found" });
  });

  it("returns 400 for invalid request body", async () => {
    const req = createReq(null);
    const res = createRes();
    await POST(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("defaults guestCount to 1 when not provided", async () => {
    mockPrisma.event.findUnique.mockResolvedValue({ id: "evt1", name: "Test", capacity: 100 });
    mockPrisma.reservation.create.mockResolvedValue({ id: "res1", code: "GL-XYZ", guestCount: 1 } as any);
    const req = createReq({ fullName: "Juan", mobile: "0917", eventId: "evt1" });
    const res = createRes();
    await POST(req, res);
    expect(mockPrisma.reservation.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ guestCount: 1 }) })
    );
  });
});
