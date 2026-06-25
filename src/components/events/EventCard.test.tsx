/* ============================================================
   EventCard Tests
   ============================================================ */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EventCard from "./EventCard";
import {
  calcCapacityPercent,
  getAvailability,
  formatEventDate,
  formatEventTime,
} from "../../lib/event-utils";

/* ---- Shared fixture ---- */
const baseProps = {
  id: "evt_1",
  slug: "test-event",
  title: "Test Event",
  venue: "Manila Club",
  startDate: "2026-07-15T22:00:00.000Z",
  coverImage: null,
  capacity: 100,
  reservations: [] as { guestCount?: number }[],
};

/* ---- event-utils tests ---- */
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

/* ---- EventCard component tests ---- */
describe("EventCard", () => {
  it("renders title and venue", () => {
    render(<EventCard {...baseProps} />);
    expect(screen.getByText("Test Event")).toBeDefined();
    expect(screen.getByText("Manila Club")).toBeDefined();
  });

  it("renders with cover image", () => {
    render(
      <EventCard {...baseProps} coverImage="https://example.com/img.jpg" />
    );
    const img = screen.getByAltText("") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/img.jpg");
  });

  it("renders without cover image (placeholder)", () => {
    render(<EventCard {...baseProps} coverImage={null} />);
    // The image should not be present
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("renders without cover image (undefined)", () => {
    render(<EventCard {...baseProps} coverImage={undefined} />);
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("renders Available badge when capacity is low", () => {
    render(<EventCard {...baseProps} reservations={[{ guestCount: 10 }]} />);
    expect(screen.getByText("Available")).toBeDefined();
  });

  it("renders Limited badge when capacity is 75%+", () => {
    render(<EventCard {...baseProps} reservations={[{ guestCount: 80 }]} />);
    expect(screen.getByText("Limited")).toBeDefined();
  });

  it("renders Sold Out badge when fully booked", () => {
    render(<EventCard {...baseProps} reservations={[{ guestCount: 100 }]} />);
    expect(screen.getByText("Sold Out")).toBeDefined();
  });

  it("is a link to the event page", () => {
    render(<EventCard {...baseProps} />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/events/test-event");
  });

  it("has accessible aria-label", () => {
    render(<EventCard {...baseProps} />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("aria-label")).toContain("Test Event");
    expect(link.getAttribute("aria-label")).toContain("Manila Club");
  });

  it("renders date label", () => {
    render(<EventCard {...baseProps} />);
    expect(screen.getByText(/Jul 15/)).toBeDefined();
  });
});
