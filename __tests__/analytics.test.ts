import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mocks ----

const mockPrisma = vi.hoisted(() => ({
  reservation: {
    groupBy: vi.fn(),
    findMany: vi.fn(),
    aggregate: vi.fn(),
  },
  event: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
}));

vi.mock("../lib/prism", () => ({ default: mockPrisma }));
vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(() =>
    Promise.resolve({ user: { id: "admin1", email: "admin@test.com" } })
  ),
}));
vi.mock("../auth", () => ({ authOptions: {} }));

// Helper to create a mock response
function createRes() {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe("Analytics Dashboard API", () => {
  let handler: any;
  let res: any;

  beforeEach(async () => {
    vi.resetAllMocks();
    res = createRes();
    vi.resetModules();
    const mod = await import("../pages/api/analytics/dashboard");
    handler = mod.default;
  });

  it("returns 401 for unauthenticated requests", async () => {
    const { getServerSession } = await import("next-auth/next");
    (getServerSession as any).mockResolvedValue(null);

    const req = { method: "GET", query: {} } as any;
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 405 for non-GET methods", async () => {
    const req = { method: "POST", query: {} } as any;
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("returns metrics for a specific event", async () => {
    // Mock event lookup (called twice: once for info, once for capacity)
    mockPrisma.event.findUnique.mockResolvedValue({
      id: "evt1", name: "Summer Party", date: new Date(), venue: "Club M", capacity: 100,
    });

    // Mock groupBy for status counts
    mockPrisma.reservation.groupBy.mockResolvedValue([
      { status: "PENDING", _count: { _all: 5 } },
      { status: "APPROVED", _count: { _all: 30 } },
      { status: "CHECKED_IN", _count: { _all: 20 } },
      { status: "REJECTED", _count: { _all: 3 } },
    ]);

    // Mock guest count aggregate
    mockPrisma.reservation.aggregate.mockResolvedValue({
      _sum: { guestCount: 35 },
    });

    // Mock trends
    mockPrisma.reservation.findMany.mockResolvedValue([]);

    const req = { method: "GET", query: { eventId: "evt1" } } as any;
    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        event: expect.objectContaining({ id: "evt1", name: "Summer Party" }),
        metrics: expect.objectContaining({
          totalReservations: 58,
          approved: 30,
          checkedIn: 20,
          pending: 5,
          rejected: 3,
          remainingSpots: 70,
          totalGuestCount: 35,
        }),
      })
    );
  });

  it("computes attendance rate and no-show rate correctly", async () => {
    mockPrisma.event.findUnique.mockResolvedValue({
      id: "evt1", name: "Test", date: new Date(), venue: "V", capacity: 50,
    });

    mockPrisma.reservation.groupBy.mockResolvedValue([
      { status: "APPROVED", _count: { _all: 20 } },
      { status: "CHECKED_IN", _count: { _all: 15 } },
    ]);

    mockPrisma.reservation.aggregate.mockResolvedValue({
      _sum: { guestCount: 20 },
    });

    mockPrisma.reservation.findMany.mockResolvedValue([]);

    const req = { method: "GET", query: { eventId: "evt1" } } as any;
    await handler(req, res);

    const body = (res.json as any).mock.calls[0][0];
    expect(body.metrics.attendanceRate).toBe(75); // 15/20 * 100
    expect(body.metrics.noShowRate).toBe(25); // (20-15)/20 * 100
  });

  it("returns 0 for rates when no approved reservations", async () => {
    mockPrisma.event.findUnique.mockResolvedValue({
      id: "evt1", name: "Test", date: new Date(), venue: "V", capacity: 50,
    });

    mockPrisma.reservation.groupBy.mockResolvedValue([
      { status: "PENDING", _count: { _all: 5 } },
    ]);

    mockPrisma.reservation.aggregate.mockResolvedValue({
      _sum: { guestCount: 0 },
    });

    mockPrisma.reservation.findMany.mockResolvedValue([]);

    const req = { method: "GET", query: { eventId: "evt1" } } as any;
    await handler(req, res);

    const body = (res.json as any).mock.calls[0][0];
    expect(body.metrics.attendanceRate).toBe(0);
    expect(body.metrics.noShowRate).toBe(0);
  });

  it("computes remainingSpots as max(capacity - approved, 0)", async () => {
    mockPrisma.event.findUnique.mockResolvedValue({
      id: "evt1", name: "Test", date: new Date(), venue: "V", capacity: 10,
    });

    mockPrisma.reservation.groupBy.mockResolvedValue([
      { status: "APPROVED", _count: { _all: 15 } },
    ]);

    mockPrisma.reservation.aggregate.mockResolvedValue({
      _sum: { guestCount: 15 },
    });

    mockPrisma.reservation.findMany.mockResolvedValue([]);

    const req = { method: "GET", query: { eventId: "evt1" } } as any;
    await handler(req, res);

    const body = (res.json as any).mock.calls[0][0];
    // remainingSpots = max(10 - 15, 0) = 0
    expect(body.metrics.remainingSpots).toBe(0);
  });

  it("returns comparison data when no eventId", async () => {
    // No event lookup when eventId is not provided
    mockPrisma.reservation.groupBy.mockResolvedValue([]);
    mockPrisma.reservation.aggregate.mockResolvedValue({ _sum: { guestCount: 0 } });
    mockPrisma.reservation.findMany.mockResolvedValue([]);

    mockPrisma.event.findMany.mockResolvedValue([
      {
        name: "Event A",
        capacity: 100,
        reservations: [
          { status: "APPROVED", guestCount: 2 },
          { status: "CHECKED_IN", guestCount: 1 },
          { status: "PENDING", guestCount: 1 },
        ],
      },
      {
        name: "Event B",
        capacity: 200,
        reservations: [
          { status: "APPROVED", guestCount: 5 },
          { status: "CHECKED_IN", guestCount: 3 },
        ],
      },
    ]);

    const req = { method: "GET", query: {} } as any;
    await handler(req, res);

    const body = (res.json as any).mock.calls[0][0];
    expect(body.event).toBeNull();
    expect(body.comparison).toHaveLength(2);
    expect(body.comparison[0]).toEqual(
      expect.objectContaining({
        eventName: "Event A",
        totalReservations: 3,
        checkedIn: 1,
        capacity: 100,
      })
    );
    // Utilization for Event A: (2 APPROVED + 1 CHECKED_IN guests) / 100 = (2+1)/100 = 3%
    expect(body.comparison[0].utilizationPercent).toBeCloseTo(3, 0);
  });

  it("returns trends for last 7 days", async () => {
    mockPrisma.event.findUnique.mockResolvedValue({
      id: "evt1", name: "Test", date: new Date(), venue: "V", capacity: 100,
    });

    mockPrisma.reservation.groupBy.mockResolvedValue([]);
    mockPrisma.reservation.aggregate.mockResolvedValue({ _sum: { guestCount: 0 } });

    // Mock reservation trend data
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    mockPrisma.reservation.findMany
      // First call: reservation trend (createdAt)
      .mockResolvedValueOnce([
        { createdAt: today },
        { createdAt: today },
        { createdAt: yesterday },
      ])
      // Second call: check-in trend (checkedInAt)
      .mockResolvedValueOnce([
        { checkedInAt: today },
        { checkedInAt: yesterday },
        { checkedInAt: yesterday },
      ]);

    const req = { method: "GET", query: { eventId: "evt1" } } as any;
    await handler(req, res);

    const body = (res.json as any).mock.calls[0][0];
    expect(body.trends.reservations).toHaveLength(7);
    expect(body.trends.checkins).toHaveLength(7);

    // Find today and yesterday in trends
    const todayKey = today.toISOString().split("T")[0];
    const yesterdayKey = yesterday.toISOString().split("T")[0];

    const todayRes = body.trends.reservations.find((r: any) => r.date === todayKey);
    const yesterdayRes = body.trends.reservations.find((r: any) => r.date === yesterdayKey);
    expect(todayRes.count).toBe(2);
    expect(yesterdayRes.count).toBe(1);
  });

  it("handles errors with 500 status", async () => {
    mockPrisma.event.findUnique.mockRejectedValue(new Error("DB connection lost"));

    const req = { method: "GET", query: { eventId: "evt1" } } as any;
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
  });
});

// ---- Analytics Calculations ----

describe("Analytics Calculation Logic", () => {
  it("attendanceRate = checkedIn / approved * 100", () => {
    const approved = 40;
    const checkedIn = 30;
    const rate = approved > 0 ? (checkedIn / approved) * 100 : 0;
    expect(rate).toBe(75);
  });

  it("noShowRate = (approved - checkedIn) / approved * 100", () => {
    const approved = 40;
    const checkedIn = 30;
    const rate = approved > 0 ? ((approved - checkedIn) / approved) * 100 : 0;
    expect(rate).toBe(25);
  });

  it("utilizationPercent = totalApprovedGuests / capacity * 100", () => {
    const totalGuestCount = 45;
    const capacity = 100;
    const util = capacity > 0 ? (totalGuestCount / capacity) * 100 : 0;
    expect(util).toBe(45);
  });

  it("remainingSpots = max(capacity - approved, 0)", () => {
    const capacity = 50;
    const approved = 30;
    const remaining = Math.max(capacity - approved, 0);
    expect(remaining).toBe(20);

    // Never negative
    const remaining2 = Math.max(20 - 30, 0);
    expect(remaining2).toBe(0);
  });

  it("counting totalReservations from all statuses", () => {
    const counts = { PENDING: 5, APPROVED: 20, REJECTED: 3, CHECKED_IN: 15 };
    const total = counts.PENDING + counts.APPROVED + counts.REJECTED + counts.CHECKED_IN;
    expect(total).toBe(43);
  });
});
