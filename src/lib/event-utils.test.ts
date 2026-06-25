/* ============================================================
   event-utils Tests (pure functions — no JSX)
   ============================================================ */

import { describe, it, expect } from "vitest";
import {
  calcCapacityPercent,
  getAvailability,
  formatEventDate,
  formatEventTime,
} from "./event-utils";

describe("calcCapacityPercent", () => {
  it("returns 0 when no reservations", () => {
    expect(calcCapacityPercent(100, [])).toBe(0);
  });

  it("calculates correctly with guestCount", () => {
    expect(calcCapacityPercent(100, [{ guestCount: 25 }, { guestCount: 10 }])).toBe(35);
  });

  it("returns 100 when fully booked", () => {
    expect(calcCapacityPercent(100, [{ guestCount: 100 }])).toBe(100);
  });

  it("caps at 100 when overbooked", () => {
    expect(calcCapacityPercent(100, [{ guestCount: 150 }])).toBe(100);
  });

  it("returns 100 when capacity is 0", () => {
    expect(calcCapacityPercent(0, [])).toBe(100);
  });

  it("falls back to array length when no guestCount", () => {
    expect(calcCapacityPercent(100, [{}, {}, {}])).toBe(3);
  });
});

describe("getAvailability", () => {
  it("returns Available when under 75%", () => {
    const badge = getAvailability(100, [{ guestCount: 50 }]);
    expect(badge.label).toBe("Available");
  });

  it("returns Limited at 75%", () => {
    const badge = getAvailability(100, [{ guestCount: 75 }]);
    expect(badge.label).toBe("Limited");
  });

  it("returns Limited at 99%", () => {
    const badge = getAvailability(100, [{ guestCount: 99 }]);
    expect(badge.label).toBe("Limited");
  });

  it("returns Sold Out at 100%", () => {
    const badge = getAvailability(100, [{ guestCount: 100 }]);
    expect(badge.label).toBe("Sold Out");
  });

  it("returns Sold Out when over capacity", () => {
    const badge = getAvailability(100, [{ guestCount: 200 }]);
    expect(badge.label).toBe("Sold Out");
  });
});

describe("formatEventDate", () => {
  it("formats a valid ISO date", () => {
    const result = formatEventDate("2026-07-15T22:00:00.000Z");
    expect(result).toMatch(/Wed, Jul 15/);
  });

  it("returns TBA for invalid date", () => {
    expect(formatEventDate("not-a-date")).toBe("TBA");
  });
});

describe("formatEventTime", () => {
  it("formats time correctly", () => {
    const result = formatEventTime("2026-07-15T22:00:00.000Z");
    expect(result).toMatch(/10:00 PM/);
  });

  it("returns empty string for invalid date", () => {
    expect(formatEventTime("not-a-date")).toBe("");
  });
});
