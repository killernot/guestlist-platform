import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  event: { findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
  reservation: { findMany: vi.fn(), count: vi.fn() },
  adminUser: {},
  _count: { select: { reservations: true } },
}));

vi.mock("../lib/prism", () => ({ default: mockPrisma }));

function createReq(method: string, query: any, body?: any) {
  return { method, query, body } as any;
}
function createRes() {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe("GET /api/events", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns events with pagination", async () => {
    const { default: handler } = await import("../pages/api/events/index");
    mockPrisma.event.findMany.mockResolvedValue([{
      id: "evt1", name: "House Night", slug: "house-night", date: new Date("2026-07-01"),
      venue: "Club X", capacity: 200, description: "House music night", bannerUrl: null,
      coverImage: null, galleryImages: null, status: "PUBLISHED", startTime: null, endTime: null,
      address: null, minAge: null, dressCode: null, genres: null, djLineup: null,
      _count: { reservations: 5 },
      sheetsMapping: null,
    }]);
    mockPrisma.event.count.mockResolvedValue(1);
    const req = createReq("GET", {});
    const res = createRes();
    await handler(req, res);
    expect(mockPrisma.event.findMany).toHaveBeenCalledWith(expect.objectContaining({
      orderBy: { date: "desc" },
    }));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      events: expect.arrayContaining([expect.objectContaining({ id: "evt1", name: "House Night" })]),
      pagination: expect.objectContaining({ total: 1 }),
    }));
  });

  it("returns 405 for non-GET methods", async () => {
    const { default: handler } = await import("../pages/api/events/index");
    const req = createReq("POST", {});
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });
});

describe("GET /api/events/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns event with stats", async () => {
    const { default: handler } = await import("../pages/api/events/[id]");
    mockPrisma.event.findUnique.mockResolvedValue({
      id: "evt1", name: "House Night", slug: "house-night", date: new Date("2026-07-01"),
      venue: "Club X", capacity: 200, description: "House music night", bannerUrl: null,
      coverImage: null, galleryImages: null, status: "PUBLISHED", startTime: null, endTime: null,
      address: null, minAge: null, dressCode: null, genres: null, djLineup: null,
      reservations: [
        { status: "APPROVED", guestCount: 2 },
        { status: "PENDING", guestCount: 1 },
        { status: "CHECKED_IN", guestCount: 3 },
      ],
      sheetsMapping: { spreadsheetId: "abc", sheetUrl: "https://docs.google.com/...", sheetTitle: "Sheet1" },
    });
    const req = createReq("GET", { id: "evt1" });
    const res = createRes();
    await handler(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      id: "evt1",
      stats: expect.objectContaining({ total: 3, approved: 1, pending: 1, checkedIn: 1 }),
      sheet: expect.objectContaining({ sheetUrl: "https://docs.google.com/..." }),
    }));
  });

  it("returns 404 for non-existent event", async () => {
    const { default: handler } = await import("../pages/api/events/[id]");
    mockPrisma.event.findUnique.mockResolvedValue(null);
    const req = createReq("GET", { id: "nonexistent" });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Event not found" });
  });

  it("returns 400 for invalid id", async () => {
    const { default: handler } = await import("../pages/api/events/[id]");
    const req = createReq("GET", { id: ["array"] });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 405 for non-GET methods", async () => {
    const { default: handler } = await import("../pages/api/events/[id]");
    const req = createReq("POST", { id: "evt1" });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });
});
