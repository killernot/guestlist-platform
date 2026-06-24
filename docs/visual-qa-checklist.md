# GUESTLIST Platform — Visual QA Checklist

**QA Date:** 2026-06-24  
**Build:** v3 (Phase 3 — Demo Experience)  
**Environments:** Desktop ≥1024px · Mobile 375px · Tablet 768px  
**Browsers:** Chrome, Safari, Firefox (latest 2 versions)

---

## 1. HOMEPAGE

### Hero Section
| # | Check | Criteria | Status |
|---|-------|----------|--------|
| 1.1 | No avatar stack | No generated gradient avatars visible | ☐ |
| 1.2 | No fake metrics | Zero "0+" or "joined this week" copy | ☐ |
| 1.3 | No Admin link in nav | Nav shows only "Events" + logo | ☐ |
| 1.4 | Hero headline | "Your Night. Your Spot." displayed with warm gradient on "Your Spot." | ☐ |
| 1.5 | Hero copy | Value prop visible: guestlist access, skip the line, Manila | ☐ |
| 1.6 | Single primary CTA | Only one visible CTA button: "Find Your Next Night Out" | ☐ |
| 1.7 | CTA style | Orange → gold gradient, dark text, no purple/pink | ☐ |
| 1.8 | Status badge | "New platform — first events dropping soon" visible | ☐ |
| 1.9 | No SaaS gradients | No purple/pink radial glows in hero background | ☐ |
| 1.10 | Warm ambient glow | Subtle orange/gold radial gradient at top (not purple) | ☐ |
| 1.11 | Honest trust line | "Free guestlist • No credit card required" visible | ☐ |

### Layout & Atmosphere
| # | Check | Criteria | Status |
|---|-------|----------|--------|
| 1.12 | Background color | Near-black (#0A0A0F), not grey or purple | ☐ |
| 1.13 | Grid pattern | Subtle 64px grid overlay visible at low opacity | ☐ |
| 1.14 | Noise texture | SVG noise overlay present | ☐ |
| 1.15 | Empty state | When no events: "First events are being curated" shows with waitlist CTA | ☐ |
| 1.16 | Footer | Dark background, no Admin link, shows "Made in Manila" | ☐ |

---

## 2. EVENTS PAGE

### List & Cards
| # | Check | Criteria | Status |
|---|-------|----------|--------|
| 2.1 | Events populated | At least 6 event cards visible (with seeded data) | ☐ |
| 2.2 | Card image | Event cover image loads (Unsplash nightlife photos) | ☐ |
| 2.3 | Card title | Event name visible, orange on hover | ☐ |
| 2.4 | Venue display | Venue name with location pin icon | ☐ |
| 2.5 | Date + time | "Sat, Jun 28 • 10:00 PM" format visible | ☐ |
| 2.6 | Capacity info | "X capacity" shown on each card | ☐ |
| 2.7 | Guestlist badge | "Guestlist Open" badge visible (green) | ☐ |
| 2.8 | Card hover | Orange border + warm shadow on hover | ☐ |
| 2.9 | No fake social proof | No "X joined this week" or avatar rows on cards | ☐ |

### Filters & Search
| # | Check | Criteria | Status |
|---|-------|----------|--------|
| 2.10 | Search bar | Placeholder "Search events or venues..." | ☐ |
| 2.11 | Filter chips | All / Today / This Week / Weekend — orange active state | ☐ |
| 2.12 | Empty filter state | "No events found" with reset button when filter returns 0 | ☐ |

### Header
| # | Check | Criteria | Status |
|---|-------|----------|--------|
| 2.13 | Logo | "G" in orange, rest white, no purple gradient | ☐ |
| 2.14 | No Admin link | Nav shows only Home link (no Admin) | ☐ |

---

## 3. EVENT DETAIL PAGE

### Hero
| # | Check | Criteria | Status |
|---|-------|----------|--------|
| 3.1 | Hero image | Full-width cover image with gradient overlay | ☐ |
| 3.2 | Title | Event name visible over hero image | ☐ |
| 3.3 | Date/time | Formatted date + time visible below title | ☐ |
| 3.4 | Venue | Venue name visible with pin icon | ☐ |
| 3.5 | Urgency badge | "Almost Full" (red, animated) or "Filling Fast" (amber) when applicable | ☐ |

### Content
| # | Check | Criteria | Status |
|---|-------|----------|--------|
| 3.6 | Description | Event description visible under "About This Event" | ☐ |
| 3.7 | DJ lineup | 3-slot lineup visible (Headliner / Support / Opener) | ☐ |
| 3.8 | Lineup disclaimer | "Lineup announced closer to the event date" shown | ☐ |
| 3.9 | Venue info | Venue card with name + entry instructions | ☐ |
| 3.10 | Availability bar | Progress bar with color coding (green/amber/orange/red) | ☐ |
| 3.11 | Spots remaining | "X of Y spots filled" text visible | ☐ |
| 3.12 | Policies | 4 policies listed (21+, guestlist limits, cutoff time, no refunds) | ☐ |

### Reservation Form
| # | Check | Criteria | Status |
|---|-------|----------|--------|
| 3.13 | Trust signal | "No account needed • Book in 30 seconds" visible | ☐ |
| 3.14 | Interested counter | "X people have reserved for this event" with green pulse dot | ☐ |
| 3.15 | Form fields | Full Name*, Mobile*, Email, Instagram, Guest Count | ☐ |
| 3.16 | Input focus | Orange focus border + shadow (not purple) | ☐ |
| 3.17 | Submit button | Orange → gold gradient, "Reserve Your Spot" | ☐ |
| 3.18 | Submit disabled | "Event Full" state when capacity = 0 | ☐ |
| 3.19 | Trust signals | 3 signals below submit: No payment, Instant confirmation, Venue-approved | ☐ |

### Share & Navigation
| # | Check | Criteria | Status |
|---|-------|----------|--------|
| 3.20 | Share button | Visible in header, triggers Web Share / clipboard copy | ☐ |
| 3.21 | Back to Events | Working link back to events list | ☐ |
| 3.22 | Sticky mobile CTA | Appears on scroll, shows event name + "Reserve Spot" button | ☐ |

---

## 4. MOBILE LAYOUTS

| # | Check | Criteria | Status |
|---|-------|----------|--------|
| 4.1 | Homepage hero | Hero text readable at 375px, no overflow | ☐ |
| 4.2 | CTA button | Full-width on mobile, properly padded | ☐ |
| 4.3 | Events grid | Single column at 375px, no horizontal scroll | ☐ |
| 4.4 | Search/chips | Full-width search + horizontal scroll chips | ☐ |
| 4.5 | Event detail hero | Image height appropriate at 375px (not too tall) | ☐ |
| 4.6 | Two-column → single | Event detail info + form stack on mobile | ☐ |
| 4.7 | Sticky CTA | Bottom bar visible and functional on mobile | ☐ |
| 4.8 | Touch targets | All buttons ≥ 44px tap area | ☐ |
| 4.9 | No horizontal overflow | No elements extend beyond viewport | ☐ |
| 4.10 | Logo size | Appropriate sizing at 375px | ☐ |

---

## 5. CTA HIERARCHY

| # | Check | Criteria | Status |
|---|-------|----------|--------|
| 5.1 | Homepage | Only one CTA above the fold (no secondary button) | ☐ |
| 5.2 | Events page | Cards are the primary click targets (no competing buttons) | ☐ |
| 5.3 | Event detail | "Reserve Your Spot" is the only primary CTA | ☐ |
| 5.4 | Sticky mobile | Same CTA as detail form (consistent messaging) | ☐ |
| 5.5 | Visual weight | CTAs have highest visual priority on each page | ☐ |
| 5.6 | No competing CTAs | No two equally-weighted buttons side by side | ☐ |

---

## 6. COLOR CONSISTENCY

| # | Check | Criteria | Status |
|---|-------|----------|--------|
| 6.1 | Primary accent | Orange (#E87A24) used for CTAs, active states, gradients | ☐ |
| 6.2 | Secondary accent | Gold (#F5C542) used in gradients, "New" badges | ☐ |
| 6.3 | No purple | No #A855F7 used outside reserved internal/admin surfaces | ☐ |
| 6.4 | No pink | No #EC4899 used in marketing surfaces | ☐ |
| 6.5 | Green states | Reserved for "Available" / success states only | ☐ |
| 6.6 | Amber states | Reserved for "Limited" / "Filling Fast" | ☐ |
| 6.7 | Red states | Reserved for "Almost Full" / error states | ☐ |
| 6.8 | BG hierarchy | Three distinct levels: base #0A0A0F → surface #12121A → elevated #1A1A26 | ☐ |
| 6.9 | Text hierarchy | White → #A0A0B0 → #5A5A6E used consistently | ☐ |
| 6.10 | Border opacity | Subtle borders (8% white), not heavy or distracting | ☐ |

---

## 7. TYPOGRAPHY

| # | Check | Criteria | Status |
|---|-------|----------|--------|
| 7.1 | Font loaded — Display | Space Grotesk loaded (headlines, CTAs, badges) | ☐ |
| 7.2 | Font loaded — Body | Inter loaded (body text, descriptions, form labels) | ☐ |
| 7.3 | Font loaded — Mono | JetBrains Mono loaded (dates, capacity numbers, codes) | ☐ |
| 7.4 | Heading scale | Clear hierarchy: h1 (48px) → h2 (32px) → h3 (24px) | ☐ |
| 7.5 | Body size | 14–16px body text, readable on dark background | ☐ |
| 7.6 | Line length | No line exceeds ~70 characters in body text | ☐ |
| 7.7 | Letter-spacing | Display headings tighter (-0.02em), labels looser (0.02–0.08em) | ☐ |
| 7.8 | Contrast | All body text ≥ 4.5:1 against background (WCAG AA) | ☐ |

---

## 8. EMPTY STATES

| # | Check | Criteria | Status |
|---|-------|----------|--------|
| 8.1 | Homepage (no events) | "First events are being curated" shown (not empty cards) | ☐ |
| 8.2 | Events page (no results) | "No events found" + search/filter context message | ☐ |
| 8.3 | Empty state CTA | Waitlist-style CTA present in homepage empty state | ☐ |
| 8.4 | Filter empty | Clear filters button visible when filter returns 0 results | ☐ |
| 8.5 | No skeleton overload | No more than 6 loading skeletons | ☐ |

---

## 9. CAPACITY INDICATORS

| # | Check | Criteria | Status |
|---|-------|----------|--------|
| 9.1 | Percentage display | "X% open" shown in event detail availability section | ☐ |
| 9.2 | Progress bar | Visible bar with color coding (green/orange/red) | ☐ |
| 9.3 | Spots remaining | "X of Y spots filled" text visible | ☐ |
| 9.4 | Card progress bar | Each event card shows capacity fill bar | ☐ |
| 9.5 | Card spots text | "X of Y spots remaining" on each card | ☐ |
| 9.6 | Color mapping | >50% open = green, 20–50% = amber, <20% = red, 100% = grey | ☐ |
| 9.7 | Urgency levels | "Filling Fast" (60%+), "Almost Full" (80%+) badges work | ☐ |
| 9.8 | No fake numbers | All capacity numbers come from DB (0 reservations = empty bar) | ☐ |

---

## SCORING

**Pass:** All items checked → **Launch-ready**  
**Conditional Pass:** ≤5 items unchecked → Fix before launch  
**Fail:** >5 items unchecked → Block launch

---

## NOTES

Document any failures or concerns below:

```
[Add observations here]
```
