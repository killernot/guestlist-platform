# Conversion Data Audit — GUESTLIST Platform

> **Date:** 2026-06-24
> **Scope:** All mocked conversion indicators in the redesigned frontend
> **Methodology:** Static analysis of all `.tsx` files in `src/` and `pages/`

---

## Executive Summary

The platform uses **100% mocked data** for all conversion indicators. No real backend data powers any social proof, urgency, or popularity signal. While the visual implementation is polished, every number shown to users is a deterministic fake that does not reflect actual event performance.

**Risk Level:** HIGH — Users who discover the fake data (e.g., same event shows different counts on refresh) will lose trust. Launch with real data or remove all social proof indicators.

---

## Audit Findings

### 1. EventCard — "X interested" Count

| Field | Value |
|-------|-------|
| **File** | `src/components/events/EventCard.tsx` |
| **Component** | `EventCard` |
| **Line** | 22-23, 58, 206 |
| **Current Implementation** | `getMockReservationCount(id)` — hash-based deterministic random: `15 + (hash % 185)` → range 15-199 |
| **Display** | 👤 icon + `{mockReservations} interested` |
| **Recommended Real Data** | `SELECT COUNT(*) FROM reservations WHERE eventId = ? AND status IN ('PENDING', 'APPROVED')` |
| **Backend Work Required** | Add `reservationCount` to Event model or compute via `getServerSideProps` |

### 2. EventCard — View Count

| Field | Value |
|-------|-------|
| **File** | `src/components/events/EventCard.tsx` |
| **Component** | `EventCard` |
| **Line** | 27-29, 59, 223 |
| **Current Implementation** | `getMockViewCount(id)` — hash-based: `200 + (hash % 1800)` → range 200-1999 |
| **Display** | 👁 icon + `{mockViews.toLocaleString()}` |
| **Recommended Real Data** | Track page views via analytics middleware or `incrementViewCount()` API |
| **Backend Work Required** | Add `viewCount` column to Event model, or implement Redis/in-memory view tracking |

### 3. EventCard — "Trending" Badge

| Field | Value |
|-------|-------|
| **File** | `src/components/events/EventCard.tsx` |
| **Component** | `EventCard` |
| **Line** | 60, 177-182 |
| **Current Implementation** | `isTrending = mockReservations > 50` — ~73% of events show "Trending" |
| **Display** | 🔥 + "Trending" badge (amber) in top-right corner |
| **Recommended Real Data** | Event is "trending" if reservations in last 24h > 20% of capacity |
| **Backend Work Required** | Time-windowed reservation count query |

### 4. EventCard — "New" Badge

| Field | Value |
|-------|-------|
| **File** | `src/components/events/EventCard.tsx` |
| **Component** | `EventCard` |
| **Line** | 71-72, 138-145 |
| **Current Implementation** | `isNew = (hash(id + "_created") % 10) < 3` — ~30% of events show "New" |
| **Display** | ⭐ + "New" badge (green) in top-left corner |
| **Recommended Real Data** | Event createdAt < 7 days ago |
| **Backend Work Required** | Use existing `Event.createdAt` field |

### 5. EventCard — "Only X left" / "Filling Fast" Urgency

| Field | Value |
|-------|-------|
| **File** | `src/components/events/EventCard.tsx` |
| **Component** | `EventCard` |
| **Line** | 64-68, 146-163 |
| **Current Implementation** | REAL data: `reservedCount = reservations.reduce(...)`, `spotsLeft = capacity - reservedCount`, `isAlmostFull = filledPercent >= 80`, `isFillingFast = filledPercent >= 60` |
| **Display** | 🔴 "Only X left" (< 20%), 🟠 "Filling Fast" (60-80%) |
| **Recommended Real Data** | ✅ Already uses real data from `reservations` prop |
| **Backend Work Required** | None — this is real! |

### 6. EventCard — "Free" Badge

| Field | Value |
|-------|-------|
| **File** | `src/components/events/EventCard.tsx` |
| **Component** | `EventCard` |
| **Line** | 75, 246-250 |
| **Current Implementation** | `isFreeGuestlist = true` — hardcoded for all events |
| **Display** | "Free" green badge near date |
| **Recommended Real Data** | Check if event has associated ticket products with price > 0 |
| **Backend Work Required** | Add `isFree` boolean to Event model, or check ticket prices |

### 7. EventCard — "Reserve Spot" CTA Button

| Field | Value |
|-------|-------|
| **File** | `src/components/events/EventCard.tsx` |
| **Component** | `EventCard` |
| **Line** | 254-269 |
| **Current Implementation** | Visual button inside `<Link>` — not a separate link, just a styled div |
| **Display** | Gradient "Reserve Spot →" button at card bottom |
| **Recommended Real Data** | N/A — this is a UI element |
| **Backend Work Required** | None |

### 8. Event Detail — "X interested" Count

| Field | Value |
|-------|-------|
| **File** | `pages/events/[slug].tsx` |
| **Component** | `EventDetail` |
| **Line** | 31-33, 89, 721 |
| **Current Implementation** | Same hash-based mock: `getMockReservationCount(event.id)` → 15-199 |
| **Display** | `{mockReservations} interested` |
| **Recommended Real Data** | Actual reservation count from `event.reservations.length` (already available!) |
| **Backend Work Required** | None — data exists in props |

### 9. Event Detail — "X reservations this week"

| Field | Value |
|-------|-------|
| **File** | `pages/events/[slug].tsx` |
| **Component** | `EventDetail` |
| **Line** | 36-38, 90, 399 |
| **Current Implementation** | `getMockWeeklyReservations(event.id)` — hash: `50 + (hash % 150)` → 50-199 |
| **Display** | "Secure your spot before they're gone — {mockWeeklyReservations} reservations this week" |
| **Recommended Real Data** | `SELECT COUNT(*) FROM reservations WHERE eventId = ? AND createdAt > NOW() - INTERVAL '7 days'` |
| **Backend Work Required** | Time-windowed count query |

### 10. Event Detail — "X people viewing this event"

| Field | Value |
|-------|-------|
| **File** | `pages/events/[slug].tsx` |
| **Component** | `EventDetail` |
| **Line** | 87, 433 |
| **Current Implementation** | `mockViewers = 47 + (event.id.charCodeAt(0) % 30)` → range 47-76 |
| **Display** | "{mockViewers} people viewing this event" |
| **Recommended Real Data** | Real-time active viewers via WebSocket or Redis SET with TTL |
| **Backend Work Required** | Implement view tracking middleware or use Vercel Analytics |

### 11. Event Detail — "Almost Full" / "Filling Fast" Banner

| Field | Value |
|-------|-------|
| **File** | `pages/events/[slug].tsx` |
| **Component** | `EventDetail` |
| **Line** | 85-86, 396-418 |
| **Current Implementation** | REAL data: `capacityPercent < 20` → "Almost Full", `20-50%` → "Filling Fast" |
| **Display** | Colored banner above reservation form |
| **Recommended Real Data** | ✅ Already uses real data from `event.capacity` and `event.approvedCount` |
| **Backend Work Required** | None |

### 12. Event Detail — Trust Signals

| Field | Value |
|-------|-------|
| **File** | `pages/events/[slug].tsx` |
| **Component** | `EventDetail` |
| **Line** | 354-372 |
| **Current Implementation** | Static text with SVG icons: "No payment required", "Instant confirmation", "Venue-approved" |
| **Display** | Three trust badges below submit button |
| **Recommended Real Data** | N/A — these are value propositions, not metrics |
| **Backend Work Required** | None (but ensure claims are accurate) |

### 13. Event Detail — Sticky Mobile CTA

| Field | Value |
|-------|-------|
| **File** | `pages/events/[slug].tsx` |
| **Component** | `EventDetail` |
| **Line** | 69, 93-99 |
| **Current Implementation** | `IntersectionObserver` / scroll detection — shows sticky bar when form is out of view |
| **Display** | Fixed bottom bar: event name + "Reserve Spot" button |
| **Recommended Real Data** | N/A — UI element |
| **Backend Work Required** | None |

### 14. Homepage — "Join 10,000+ nightlife enthusiasts"

| Field | Value |
|-------|-------|
| **File** | `pages/index.tsx` |
| **Component** | `HeroSection` / `CTASection` |
| **Line** | 105, 192 |
| **Current Implementation** | Hardcoded string: "Join 10,000+ nightlife enthusiasts" |
| **Display** | Hero subheadline + CTA section |
| **Recommended Real Data** | `SELECT COUNT(*) FROM reservations` or registered users count |
| **Backend Work Required** | Simple count query |

### 15. Homepage — "2,847 people joined this week"

| Field | Value |
|-------|-------|
| **File** | `pages/index.tsx` |
| **Component** | `HeroSection` |
| **Line** | 125-126 |
| **Current Implementation** | Hardcoded: `2,847` |
| **Display** | Avatar row + "2,847 people joined this week" |
| **Recommended Real Data** | `SELECT COUNT(*) FROM reservations WHERE createdAt > NOW() - INTERVAL '7 days'` |
| **Backend Work Required** | Time-windowed count query |

### 16. Homepage — Social Proof Avatars

| Field | Value |
|-------|-------|
| **File** | `pages/index.tsx` |
| **Component** | `HeroSection` |
| **Line** | 111-122 |
| **Current Implementation** | 5 gradient circles (hardcoded colors) — not real user avatars |
| **Display** | Avatar stack in hero section |
| **Recommended Real Data** | Profile pictures of recent reserving users (if available) |
| **Backend Work Required** | None (can remain as decorative if no user profiles exist) |

---

## Summary Table

| # | Indicator | File | Mock Type | Real Data Available? | Backend Work |
|---|-----------|------|-----------|---------------------|--------------|
| 1 | "X interested" (Card) | EventCard.tsx | Hash-based (15-199) | ⚠️ Partial (count reservations) | Add count to props |
| 2 | View count (Card) | EventCard.tsx | Hash-based (200-1999) | ❌ No | Build view tracking |
| 3 | "Trending" badge | EventCard.tsx | Mock > 50 | ⚠️ Derive from velocity | Time-windowed count |
| 4 | "New" badge | EventCard.tsx | Hash-based (~30%) | ✅ Yes (createdAt exists) | Use real date |
| 5 | "Only X left" | EventCard.tsx | ✅ REAL | ✅ Yes | None |
| 6 | "Filling Fast" | EventCard.tsx | ✅ REAL | ✅ Yes | None |
| 7 | "Free" badge | EventCard.tsx | Hardcoded `true` | ⚠️ Need isFree field | Add column or check tickets |
| 8 | "X interested" (Detail) | [slug].tsx | Hash-based (15-199) | ✅ Yes (props) | Use `reservations.length` |
| 9 | "X reservations/week" | [slug].tsx | Hash-based (50-199) | ❌ No | Time-windowed query |
| 10 | "X people viewing" | [slug].tsx | CharCode-based (47-76) | ❌ No | Build view tracking |
| 11 | "Almost Full" banner | [slug].tsx | ✅ REAL | ✅ Yes | None |
| 12 | Trust signals | [slug].tsx | Static text | N/A | None |
| 13 | Sticky CTA | [slug].tsx | Real logic | N/A | None |
| 14 | "10,000+ users" | index.tsx | Hardcoded | ⚠️ Partial (count query) | Simple COUNT |
| 15 | "2,847 this week" | index.tsx | Hardcoded | ⚠️ Partial (count query) | Time-windowed COUNT |
| 16 | Avatar stack | index.tsx | Decorative | N/A | None |

---

## Priority Recommendations

### 🔴 Critical (Fix Before Launch)

| # | Issue | Fix | Impact |
|---|-------|-----|--------|
| 1 | "X interested" shows fake data | Replace with `reservations.length` from props | Trust — data is already available |
| 2 | "2,847 people joined" is hardcoded | Add `GET /api/stats` endpoint with real count | Trust — easily verified fake |
| 3 | "10,000+ users" is hardcoded | Same stats endpoint | Trust |
| 4 | "New" badge uses random hash | Use `Event.createdAt` date comparison | Trust — currently lies about 30% of events |

### 🟡 High (Fix Within 30 Days)

| # | Issue | Fix | Impact |
|---|-------|-----|--------|
| 5 | "Trending" badge always shows for 73% | Calculate reservation velocity (last 24h) | Credibility |
| 6 | "X reservations this week" is fake | Add `GET /api/events/[id]/stats/weekly` endpoint | Social proof accuracy |
| 7 | "X people viewing" is fake | Implement view tracking or remove | Trust if discovered |
| 8 | "Free" badge hardcoded true | Add `isFree` field to Event model | Accuracy |

### 🟢 Medium (Fix Within 90 Days)

| # | Issue | Fix | Impact |
|---|-------|-----|--------|
| 9 | View counts are fake | Implement analytics tracking | Enable real social proof |
| 10 | Avatars are decorative | Show real user profile pics if available | Authenticity |

---

## Quick Wins (Under 1 Hour)

These use data already available in the backend:

1. **Replace `getMockReservationCount(id)` with `reservations.length`** in EventCard
2. **Replace `isNew` hash with `new Date(event.startDate) > Date.now() - 7*24*60*60*1000`**
3. **Replace `isTrending` with `reservations.length > capacity * 0.3`** (30% capacity = trending)
4. **Add `GET /api/stats` endpoint** that returns `SELECT COUNT(*) FROM reservations`
5. **Replace hardcoded "2,847" with real count from API**

---

## Backend Migration Plan

### Phase 1: Use Existing Data (No Schema Changes)
- [ ] Replace all `getMockReservationCount()` with real `reservations.length`
- [ ] Replace "New" badge with real date comparison
- [ ] Add `/api/stats` endpoint for homepage numbers
- [ ] Replace "Trending" with capacity-percentage threshold

### Phase 2: Add Missing Data (Schema Changes)
- [ ] Add `viewCount` column to Event model
- [ ] Add `isFree` column to Event model
- [ ] Create `EventView` table for real-time tracking
- [ ] Add `weeklyReservationCount` computed column or cache

### Phase 3: Real-Time Features
- [ ] WebSocket/Redis for live viewer counts
- [ ] Reservation velocity tracking (bookings per hour)
- [ ] Trending algorithm based on recent signup rate

---

*End of Conversion Data Audit*
