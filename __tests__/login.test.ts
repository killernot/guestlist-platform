import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

const mockPrisma = vi.hoisted(() => ({
  adminUser: { findFirst: vi.fn() },
  event: {},
  reservation: {},
}));

vi.mock("../lib/prism", () => ({ default: mockPrisma }));

import { POST } from "../pages/api/login";

function createReq(body: any) {
  return { method: "POST", body, query: {} } as any;
}
function createRes() {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe("POST /api/login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns success with valid credentials", async () => {
    const passwordHash = await bcrypt.hash("secret123", 10);
    mockPrisma.adminUser.findFirst.mockResolvedValue({
      id: "admin1", email: "admin@test.com", name: "Admin", passwordHash,
    });
    const req = createReq({ email: "admin@test.com", password: "secret123" });
    const res = createRes();
    await POST(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true, user: { id: "admin1", email: "admin@test.com", name: "Admin" },
    }));
  });

  it("returns 401 for wrong password", async () => {
    const passwordHash = await bcrypt.hash("secret123", 10);
    mockPrisma.adminUser.findFirst.mockResolvedValue({ id: "admin1", email: "admin@test.com", passwordHash });
    const req = createReq({ email: "admin@test.com", password: "wrong" });
    const res = createRes();
    await POST(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
  });

  it("returns 401 for non-existent user", async () => {
    mockPrisma.adminUser.findFirst.mockResolvedValue(null);
    const req = createReq({ email: "nobody@test.com", password: "pass" });
    const res = createRes();
    await POST(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 400 when email is missing", async () => {
    const req = createReq({ password: "pass" });
    const res = createRes();
    await POST(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 when password is missing", async () => {
    const req = createReq({ email: "admin@test.com" });
    const res = createRes();
    await POST(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 for invalid body", async () => {
    const req = createReq(null);
    const res = createRes();
    await POST(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
