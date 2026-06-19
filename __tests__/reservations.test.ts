import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  reservation: { findUnique: vi.fn(), update: vi.fn(), findFirst: vi.fn(), findMany: vi.fn() },
  event: {},
  adminUser: {},
}));

vi.mock("../lib/prism", () => ({ default: mockPrisma }));

import handler from "../pages/api/reservations/[id]";

function createReq(method: string, query: any, body?: any) {
  return { method, query, body: body || {} } as any;
}
function createRes() {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe("GET /api/reservations/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns reservation by id", async () => {
    const reservation = { id: "res1", code: "GL-ABC123", fullName: "Juan", mobile: "0917", status: "PENDING", eventId: "evt1" };
    mockPrisma.reservation.findUnique.mockResolvedValue(reservation);
    const req = createReq("GET", { id: "res1" });
    const res = createRes();
    await handler(req, res);
    expect(mockPrisma.reservation.findUnique).toHaveBeenCalledWith({ where: { id: "res1" } });
    expect(res.json).toHaveBeenCalledWith(reservation);
  });

  it("returns 404 for non-existent reservation", async () => {
    mockPrisma.reservation.findUnique.mockResolvedValue(null);
    const req = createReq("GET", { id: "nonexistent" });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe("PATCH /api/reservations/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates reservation status to APPROVED", async () => {
    mockPrisma.reservation.update.mockResolvedValue({ id: "res1", status: "APPROVED" });
    const req = createReq("PATCH", { id: "res1" }, { status: "APPROVED" });
    const res = createRes();
    await handler(req, res);
    expect(mockPrisma.reservation.update).toHaveBeenCalledWith({ where: { id: "res1" }, data: { status: "APPROVED" } });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("updates reservation status to CHECKED_IN", async () => {
    mockPrisma.reservation.update.mockResolvedValue({ id: "res1", status: "CHECKED_IN" });
    const req = createReq("PATCH", { id: "res1" }, { status: "CHECKED_IN" });
    const res = createRes();
    await handler(req, res);
    expect(mockPrisma.reservation.update).toHaveBeenCalledWith({ where: { id: "res1" }, data: { status: "CHECKED_IN" } });
  });

  it("returns 400 for invalid status value", async () => {
    const req = createReq("PATCH", { id: "res1" }, { status: "INVALID" });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockPrisma.reservation.update).not.toHaveBeenCalled();
  });

  it("returns 400 when status is missing", async () => {
    const req = createReq("PATCH", { id: "res1" }, {});
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 when reservation not found (P2025)", async () => {
    const error: any = new Error("Record not found");
    error.code = "P2025";
    mockPrisma.reservation.update.mockRejectedValue(error);
    const req = createReq("PATCH", { id: "nonexistent" }, { status: "APPROVED" });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Reservation not found" });
  });

  it("re-throws non-P2025 errors", async () => {
    mockPrisma.reservation.update.mockRejectedValue(new Error("DB connection lost"));
    const req = createReq("PATCH", { id: "res1" }, { status: "APPROVED" });
    const res = createRes();
    await expect(handler(req, res)).rejects.toThrow("DB connection lost");
  });
});

describe("Method validation /api/reservations/[id]", () => {
  it("returns 405 for unsupported methods", async () => {
    const req = createReq("DELETE", { id: "res1" });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("returns 400 for invalid id type", async () => {
    const req = createReq("GET", { id: ["array"] });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
