# Frontend Audit Report — Guest List Platform

**Date:** 2026-06-24  
**Auditor:** OWL (Hermes Agent)  
**Scope:** All pages, components, styles, and design system

---

## 1. Current State Summary

The Guest List Platform is a **Next.js 16** application built with **React 19**, **Tailwind CSS 4**, and **Prisma/PostgreSQL**. It serves as a nightlife event guestlist reservation system for "SaloSaloSessionsPH — Manila's underground house & electronic collective."

### Architecture Overview

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.7 (Pages Router) |
| Styling | Tailwind CSS 4 + CSS Custom Properties |
| UI Components | Custom (no component library) |
| Auth | NextAuth v4 (Credentials + PrismaAdapter) |
| Database | PostgreSQL via Prisma 7.8 |
| State | React useState (local component state) |
| Testing | Vitest + React Testing Library |

### Page Count

| Route | Type | Purpose |
|-------|------|---------|
| `/` | Public | Hero landing + upcoming events |
| `/events/[slug]` | Public | Event detail + reservation form |
| `/reservation-success` | Public | Booking confirmation |
| `/checkin` | Public | Guest check-in management |
| `/admin` | Protected | Admin dashboard (reservations) |
| `/admin/login` | Public | Admin authentication |
| `/api/register` | API | Create reservation |
| `/api/events` | API | List events |
| `/api/events/[id]` | API | Single event details |
| `/api/reservations/[id]` | API | Get/Update reservation |
| `/api/auth/[...nextauth]` | API | NextAuth handlers |
| `/api/health` | API | Health check |

---

## 2. Page-by-Page Analysis

### 2.1 Home Page (`pages/index.tsx`)

**Purpose:** Landing page displaying the brand hero and upcoming events grid.

**UX Flow:**
1. `getServerSideProps` fetches next 6 upcoming events from DB
2. Events are passed to the `<Hero />` component
3. Hero renders brand wordmark, tagline, CTA buttons, and events grid

**What Works:**
- Clean server-side data fetching with graceful fallback to empty array
- Events limited to 6 for reasonable page weight
- Proper `<Head>` metadata with OpenGraph tags (via meta file)

**What Doesn't:**
- No loading state (SSR means blank page during fetch — no skeleton)
- No error boundary if Prisma import fails
- Events use `id` for links (`/events/${event.id}`) but the `[slug]` page expects a slug — **broken navigation**: clicking an event card goes to `/events/abc123` but the detail page tries to match by `name` which won't work
- Title says "SaloSaloSessionsPH" but meta file says "Guest List Platform" — **brand inconsistency**

---

### 2.2 Event Detail Page (`pages/events/[slug].tsx`)

**Purpose:** Full event details with reservation registration form.

**UX Flow:**
1. SSR fetches event by ID or name match
2. Displays hero section with event info
3. User fills out reservation form (name, mobile, email, instagram, guest count)
4. Submits via `fetch('/api/register')` POST
5. On success: redirects to `/reservation-success?code=GL-XXXXXX`
6. On error: displays inline error message

**What Works:**
- Server-side validation of event existence (404 on not found)
- Form validation with HTML5 `required` attributes
- Loading state on submit button
- Error display for API failures
- Responsive grid for event info cards

**What Doesn't:**
- **No form validation feedback** — no inline validation messages, only API errors
- **No CSRF protection** on the API route
- **No rate limiting** on `/api/register` — vulnerable to spam
- `guestCount` defaults to 1 in form state but API also clamps — duplicate logic
- Uses `useRouter` from `next/router` (Pages Router) — correct for this setup but dated
- The `getServerSideProps` query is overly complex: `OR: [{ id: slug }, { name: { contains: slug.replace(/-/g, ' ') } }]` — this does partial name matching which can return wrong events
- **No `bannerUrl` rendering** — the Hero component uses a hardcoded gradient instead of the event's `bannerUrl` field
- `event` prop typed as `any` — loses type safety

---

### 2.3 Reservation Success Page (`pages/reservation-success.tsx`)

**Purpose:** Confirmation page showing reservation code after successful booking.

**UX Flow:**
1. Reads `code` query parameter from URL
2. Displays confirmation message with code
3. Shows QR code placeholder
4. Links back to events or to check-in

**What Works:**
- Handles missing code gracefully (shows fallback message)
- Clean, centered layout
- Links to relevant pages

**What Doesn't:**
- **QR code is a placeholder** — no actual QR generation
- Code displayed in plain text without copy-to-clipboard functionality
- No event details shown (user loses context of which event they booked)
- Footer uses hardcoded "Guest List Platform" branding vs. "SaloSaloSessionsPH"

---

### 2.4 Check-In System (`pages/checkin.tsx`)

**Purpose:** Searchable guest list for door staff to check in guests.

**UX Flow:**
1. SSR fetches first 200 APPROVED/CHECKED_IN reservations
2. Search input filters guests by code or name
3. Click "Check In" button to update status via PATCH API
4. Status badges update optimistically on success

**What Works:**
- Server-side initial data (works without JS)
- Client-side search filtering
- Optimistic UI updates on check-in
- Status badges with color coding
- Empty state message

**What Doesn't:**
- **No pagination** — loads 200 guests at once, could be slow
- **No debounce** on search input
- **"Add New Guest" and "Scan QR Code" buttons are non-functional** — dead UI
- **No confirmation dialog** for check-in (irreversible action)
- **No undo** capability
- Table is not accessible — no `aria-label`, no `role` attributes
- **No mobile layout** — table overflows on small screens
- Uses `prisma` import directly (not dynamic) — could fail at build time

---

### 2.5 Admin Dashboard (`pages/admin.tsx`)

**Purpose:** Admin panel to manage reservations (approve/reject).

**UX Flow:**
1. Protected by `getServerSession` — redirects to login if unauthenticated
2. SSR fetches first 100 reservations
3. Search input and status filter (UI only — not wired up)
4. Approve/Reject buttons for PENDING reservations
5. Status badges with color coding

**What Works:**
- Server-side auth guard
- Optimistic UI updates on approve/reject
- Status badges with semantic colors
- Empty state handling

**What Doesn't:**
- **Search and filter are non-functional** — pure UI with no state or API integration
- **"Export CSV" button is non-functional**
- **No pagination** — limited to 100 items
- **No sorting** capability
- **No bulk actions**
- **No confirmation dialogs** for approve/reject
- Table has no mobile fallback (no card view)
- `initialReservations` prop typed as `Reservation[]` but `createdAt` is serialized as string — type mismatch with Prisma type

---

### 2.6 Admin Login (`pages/admin/login.tsx`)

**Purpose:** Credentials-based authentication for admin users.

**UX Flow:**
1. Email + password form
2. Submits via `next-auth` `signIn("credentials")`
3. On success: redirects to `/admin`
4. On failure: shows error message

**What Works:**
- Proper label/input associations with `htmlFor`/`id`
- Loading state on submit button
- Error display
- Link back to home

**What Doesn't:**
- **No rate limiting** — brute force vulnerable
- **No "remember me"** option
- **No password visibility toggle**
- **No forgot password flow**
- Uses `next/router` redirect instead of `next/navigation` — inconsistent if app were to migrate
- Focus management could be improved (no auto-focus on first input)

---

## 3. Component Inventory

### 3.1 EventCard (`src/components/events/EventCard.tsx`)

**Purpose:** Glassmorphism event card with cover image, details, and availability badge.

| Aspect | Assessment |
|--------|-----------|
| Structure | Clean semantic HTML (`<article>`, `<time>`, `<Link>`) |
| Accessibility | Has `aria-label` on link, `focus-visible` styles |
| Responsiveness | Responsive padding (`p-4 sm:p-5`), responsive title sizing |
| Image | Uses native `<img>` with `loading="lazy"` — no Next.js `<Image>` optimization |
| Types | Well-typed with `EventCardProps` interface |
| Tests | Comprehensive test suite (16 tests covering utils + component) |

**Issues:**
- `tabIndex={-1}` on `<article>` is unnecessary and potentially confusing
- `_id` prop is destructured but never used — dead code
- No `alt` text on cover image (uses `alt=""` which is correct for decorative images, but the image content is meaningful)

---

### 3.2 EventHero (`src/components/events/EventHero.tsx`)

**Purpose:** Hero section for event detail page with cover image and event metadata.

| Aspect | Assessment |
|--------|-----------|
| Structure | Semantic `<section>`, proper heading hierarchy |
| Responsponsive | Responsive aspect ratios (`21/9` → `21/7`), responsive typography |
| Image | Native `<img>` without optimization |
| Types | Uses `EventDetail` from mappers |

**Issues:**
- Image uses `alt=""` — should have descriptive alt text
- No `loading="lazy"` on hero image (above the fold, so maybe intentional)

---

### 3.3 Hero (`components/Hero.tsx`)

**Purpose:** Full-page landing hero with brand, CTAs, and events grid.

| Aspect | Assessment |
|--------|-----------|
| Structure | Semantic `<main>`, `<footer>`, proper `<h1>` |
| Design | Beautiful glassmorphism, noise texture, gradient effects |
| Animation | CSS transitions on hover states |
| Responsiveness | Full responsive design (`sm:`, `md:`, `lg:` breakpoints) |
| Accessibility | Focus-visible styles on interactive elements |

**Issues:**
- **No `<nav>` element** — no navigation bar, only a link to `/admin`
- Events grid uses inline `style={{ backgroundColor: ... }}` for pennant colors instead of CSS classes
- `Array.from({ length: 40 })` for decorative pennants — should be memoized
- Footer uses different branding ("SaloSaloSessionsPH") vs. meta title ("Guest List Platform")

---

### 3.4 Forms (inline in pages)

| Form | Location | Issues |
|------|----------|--------|
| Registration | `events/[slug].tsx` | No inline validation, no field-level errors |
| Login | `admin/login.tsx` | No password toggle, no rate limiting |
| Check-in search | `checkin.tsx` | No debounce, no clear button |
| Admin search | `admin.tsx` | Not wired to any state/function |

---

### 3.5 Buttons

| Button | Style | Issues |
|--------|-------|--------|
| "JOIN THE GUESTLIST" | Glassmorphism with hover glow | None — well implemented |
| "Reserve Your Spot" | Gradient purple→pink | Disabled state uses opacity only |
| "Check In" (active) | Purple→pink gradient | Adequate contrast |
| "Check In" (disabled) | Gray with `cursor-not-allowed` | Passes contrast (gray on gray is low contrast) |
| "Approve" | Purple→pink | No confirmation |
| "Reject" | Red | No confirmation, red text on dark may have contrast issues |
| "Export CSV" | Gray ghost | Non-functional |
| "Add New Guest" | Gray ghost | Non-functional |
| "Scan QR Code" | Gray ghost | Non-functional |

---

### 3.6 Empty/Loading/Error States

| Page | Empty State | Loading State | Error State |
|------|-------------|---------------|-------------|
| Home | ✅ Events grid conditional | ❌ No skeleton | ❌ Silent catch |
| Event Detail | N/A (404 redirect) | ✅ Button text change | ✅ Inline error div |
| Reservation Success | ✅ Fallback message | N/A | N/A |
| Check-in | ✅ "No guests found" | ❌ None | ❌ Silent fail |
| Admin | ✅ "No reservations found" | ❌ None | ❌ Silent fail |

---

## 4. Design System Analysis

### 4.1 Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg-base` | `#0A0A0F` | Page background |
| `--color-bg-surface` | `#12121A` | Card backgrounds |
| `--color-bg-elevated` | `#1A1A26` | Elevated surfaces |
| `--color-neon-purple` | `#A855F7` | Primary accent |
| `--color-neon-pink` | `#EC4899` | Secondary accent |
| `--color-neon-blue` | `#3B82F6` | Checked-in status |
| `--color-neon-green` | `#22C55E` | Available / Approved |
| `--color-neon-amber` | `#F59E0B` | Limited / Pending |
| `--color-neon-red` | `#EF4444` | Sold out / Rejected |
| `--color-text-primary` | `#FFFFFF` | Headings |
| `--color-text-secondary` | `#A0A0B0` | Body text |
| `--color-text-tertiary` | `#5A5A6E` | Meta info, muted |

**Assessment:** Cohesive dark theme with neon accents. The palette is well-structured with clear semantic meaning. However:

- **Contrast issues:** `--color-text-tertiary` (#5A5A6E) on `--color-bg-base` (#0A0A0F) = ~3.8:1 ratio — **fails WCAG AA** for normal text (requires 4.5:1)
- **Status badge colors** use inline styles in some places, CSS variables in others — inconsistency
- No light mode or high contrast mode support

### 4.2 Typography

| Font | Usage | Loading |
|------|-------|---------|
| Space Grotesk | Display/headings | Google Fonts `@import` |
| Inter | Body text | Google Fonts `@import` |
| JetBrains Mono | Code/date display | Google Fonts `@import` |

**Assessment:**
- Three-font stack is reasonable for the brand
- Type scale is well-defined in `design-tokens.ts` (12 steps from 11px to 48px)
- **Issue:** Fonts loaded via CSS `@import` instead of `next/font` — causes **render-blocking** and **layout shift** (no font optimization)
- **Issue:** No `font-display: swap` explicitly set (Google Fonts URL doesn't include `&display=swap`)

### 4.3 Spacing System

8px base grid with design tokens from 0px to 80px. Tailwind's default spacing is used alongside custom tokens. The system is consistent in application.

### 4.4 Consistency

| Aspect | Status |
|--------|--------|
| Color tokens | ✅ CSS variables defined and used |
| Typography | ✅ Variables defined, but pages use raw Tailwind classes |
| Spacing | ✅ Consistent use of Tailwind spacing |
| Border radius | ✅ Variables defined (`--radius-card`, `--radius-button`, etc.) |
| Shadows | ✅ Variables defined |
| Button styles | ❌ Inconsistent — Hero uses glassmorphism, pages use gradients |
| Card styles | ❌ Hero events use different cards than EventCard component |

**Major Inconsistency:** The `Hero` component and the `EventCard` component represent the same concept (event cards) but have completely different visual treatments. The home page events are rendered inline in Hero, not using the EventCard component.

---

## 5. Issues Found (Prioritized)

### 🔴 Critical (P0)

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| C1 | **Broken event card links** — Home page links to `/events/{id}` but detail page expects slug-based lookup with name matching | `pages/index.tsx` L130, `pages/events/[slug].tsx` L11-16 | Users cannot navigate to event details from home |
| C2 | **No rate limiting on registration API** — `/api/register` accepts unlimited submissions | `pages/api/register.ts` | Spam, abuse, capacity overflow |
| C3 | **Non-functional admin features** — Search, filter, CSV export are dead UI | `pages/admin.tsx` L86-97, 159 | Admin cannot effectively manage reservations |
| C4 | **Non-functional check-in features** — "Add Guest" and "Scan QR" buttons do nothing | `pages/checkin.tsx` L127-132 | Incomplete feature set |

### 🟠 High (P1)

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| H1 | **No font optimization** — Google Fonts loaded via CSS `@import` causing render-blocking | `src/styles/tokens.css` L8 | Performance: FCP/LCP degradation |
| H2 | **No image optimization** — Raw `<img>` tags instead of Next.js `<Image>` component | `EventCard.tsx` L59, `EventHero.tsx` L25 | Large unoptimized images, no lazy loading for hero |
| H3 | **Tertiary text fails WCAG contrast** — #5A5A6E on #0A0A0F = ~3.8:1 | All pages using `--color-text-tertiary` | Accessibility failure for 5% of text |
| H4 | **No loading states** — Pages rely on SSR with no skeleton/loading UI | `pages/admin.tsx`, `pages/checkin.tsx` | Blank page during data fetch |
| H5 | **No confirmation dialogs** for destructive/irreversible actions | `pages/admin.tsx` (approve/reject), `pages/checkin.tsx` (check-in) | Accidental status changes |
| H6 | **Brand inconsistency** — "SaloSaloSessionsPH" vs "Guest List Platform" across components | Hero footer, meta files, success page | Confusing brand identity |
| H7 | **Admin search/filter not wired** — UI exists but has no state or API connection | `pages/admin.tsx` L85-97 | Feature appears functional but isn't |

### 🟡 Medium (P2)

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| M1 | **No pagination** — Admin and Check-in load 100-200 items at once | `pages/admin.tsx`, `pages/checkin.tsx` | Performance degradation with data growth |
| M2 | **No form validation feedback** — Registration form only shows API errors | `pages/events/[slug].tsx` | Poor UX, unnecessary API round-trips |
| M3 | **Table not mobile-responsive** — Check-in and Admin tables overflow on small screens | `pages/checkin.tsx`, `pages/admin.tsx` | Unusable on mobile devices |
| M4 | **No navigation element** — No `<nav>` bar, users can't easily navigate | All pages | Poor wayfinding |
| M5 | **QR code is placeholder** — No actual QR generation for reservation codes | `pages/reservation-success.tsx` L45-49 | Missing feature |
| M6 | **No error boundaries** — Silent failures in SSR catch blocks | Multiple pages | Users see blank pages with no feedback |
| M7 | **`event` prop typed as `any`** — Loses type safety | `pages/events/[slug].tsx` L50 | Maintenance risk |
| M8 | **No debounce on search** — Check-in search filters on every keystroke | `pages/checkin.tsx` | Performance with large lists |

### 🔵 Low (P3)

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| L1 | **No test coverage for pages** — Only EventCard and API handlers tested | Test files | Regression risk |
| L2 | **Dead code** — `_id` destructured but unused in EventCard | `EventCard.tsx` L23 | Code cleanliness |
| L3 | **No `alt` text on hero images** — Cover images use `alt=""` | `EventCard.tsx`, `EventHero.tsx` | Screen reader users miss context |
| L4 | **No keyboard shortcut for search** — No `Ctrl+K` / `/` focus | Check-in, Admin | Power user efficiency |
| L5 | **No toast notifications** — Success/error messages are inline only | All pages | Feedback disappears on navigation |
| L6 | **No "Back" navigation pattern** — Inconsistent back links | Various | UX friction |
| L7 | **Missing `lang` attribute** — No `<html lang="en">` set | `_app.tsx` | Screen reader pronunciation |

---

## 6. Recommendations

### Immediate (This Sprint)

1. **Fix broken event navigation** — Ensure home page links match the detail page's expected slug format, or refactor both to use consistent identifiers
2. **Wire admin search/filter** — Connect the search input and status filter to actual filtering logic (client-side or API-based)
3. **Add rate limiting** — Implement in-memory or Redis-based rate limiting on `/api/register`
4. **Fix font loading** — Switch from CSS `@import` to `next/font/google` with `display: swap`
5. **Add `lang="en"` to `_app.tsx`** — Quick accessibility win

### Short-Term (Next 2-3 Sprints)

6. **Implement image optimization** — Use `next/image` or configure remote image patterns in `next.config.ts` for banner/cover images
7. **Add loading skeletons** — Create skeleton components for admin and check-in pages
8. **Fix color contrast** — Lighten `--color-text-tertiary` to at least `#7A7A8E` to achieve 4.5:1 ratio
9. **Add confirmation dialogs** — For approve/reject/check-in actions
10. **Unify brand name** — Choose "SaloSaloSessionsPH" or "Guest List Platform" and use consistently
11. **Add pagination** — Implement cursor-based pagination for admin and check-in lists
12. **Mobile-responsive tables** — Convert tables to card layouts on mobile

### Long-Term (Next Quarter)

13. **Migrate to App Router** — Next.js 16 supports it natively; would enable streaming, better layouts, and improved performance
14. **Add component library** — Consider Radix UI or similar for accessible dialogs, toasts, and form validation
15. **Implement QR code generation** — Use a library like `qrcode.react` for actual reservation QR codes
16. **Add E2E tests** — Playwright or Cypress for critical user flows (register, approve, check-in)
17. **Add analytics** — Track conversion funnel (view event → register → check in)
18. **Implement proper error boundaries** — React error boundaries for graceful failure handling
19. **Add toast notification system** — Global feedback for actions
20. **Accessibility audit with screen reader** — Manual testing with VoiceOver/NVDA

---

## Appendix: File Inventory

### Pages
- `pages/index.tsx` — Home/landing
- `pages/_app.tsx` — App wrapper
- `pages/events/[slug].tsx` — Event detail + registration
- `pages/reservation-success.tsx` — Booking confirmation
- `pages/checkin.tsx` — Guest check-in management
- `pages/admin.tsx` — Admin dashboard
- `pages/admin/login.tsx` — Admin authentication
- `pages/index.tsx.meta.ts` — Home metadata
- `pages/events/[slug].tsx.meta.ts` — Event metadata

### API Routes
- `pages/api/register.ts` — POST create reservation
- `pages/api/events/index.ts` — GET list events
- `pages/api/events/[id].ts` — GET single event
- `pages/api/reservations/[id].ts` — GET/PATCH reservation
- `pages/api/auth/[...nextauth].ts` — NextAuth handler
- `pages/api/health.ts` — Health check

### Components
- `components/Hero.tsx` — Landing hero (top-level, not in src/)
- `src/components/events/EventCard.tsx` — Event card component
- `src/components/events/EventHero.tsx` — Event detail hero
- `src/components/events/EventCard.test.tsx` — EventCard tests

### Design System
- `src/styles/tokens.css` — CSS variables, Tailwind theme, utilities
- `src/lib/design-tokens.ts` — TypeScript design token constants

### Utilities
- `src/lib/event-utils.ts` — Capacity calculation, date formatting, availability badges
- `src/lib/event-mappers.ts` — Prisma → UI type mapping
- `lib/capacity.ts` — Capacity checking logic
- `lib/auth.ts` — Auth helper
- `auth.ts` — NextAuth configuration

### Tests
- `__tests__/register.test.ts` — Registration API tests (8 tests)
- `__tests__/reservations.test.ts` — Reservation API tests (10 tests)
- `src/components/events/EventCard.test.tsx` — EventCard component tests (16 tests)

---

*End of Audit Report*
