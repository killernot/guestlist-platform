import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  event: { findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn() },
  reservation: { findMany: vi.fn() },
  adminUser: {},
}));

vi.mock("../lib/prism", () => ({ default: mockPrisma }));

function createReq(method: string, query: any) {
  return { method, query } as any;
}
function createRes() {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe("GET /api/events", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns upcoming events", async () => {
    const { default: handler } = await import("../pages/api/events/index");
    mockPrisma.event.findMany.mockResolvedValue([{
      id: "evt1", name: "House Night", date: new Date("2026-07-01"),
      venue: "Club X", capacity: 200, description: "House music night", bannerUrl: null,
    }]);
    const req = createReq("GET", {});
    const res = createRes();
    await handler(req, res);
    expect(mockPrisma.event.findMany).toHaveBeenCalledWith(expect.objectContaining({
      orderBy: { date: "asc" }, take: 50,
    }));
    expect(res.json).toHaveBeenCalledWith([expect.objectContaining({ id: "evt1", name: "House Night" })]);
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

  it("returns event with approved reservation count", async () => {
    const { default: handler } = await import("../pages/api/events/[id]");
    mockPrisma.event.findUnique.mockResolvedValue({
      id: "evt1", name: "House Night", date: new Date("2026-07-01"),
      venue: "Club X", capacity: 200, description: "House music night", bannerUrl: null,
      reservations: [{ id: "r1" }, { id: "r2" }],
    });
    const req = createReq("GET", { id: "evt1" });
    const res = createRes();
    await handler(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: "evt1", approvedCount: 2 }));
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
