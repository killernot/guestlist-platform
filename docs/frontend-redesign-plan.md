# Frontend Redesign Plan — Guestlist Platform

> **Version:** 1.0  
> **Date:** 2026-06-24  
> **Scope:** Premium dark-luxury redesign of the entire guestlist/reservation platform  
> **Stack:** Next.js 16, React 19, Tailwind CSS 4, Prisma, PostgreSQL

---

## Table of Contents

1. [Information Architecture](#1-information-architecture)
2. [Design System](#2-design-system)
3. [Page-by-Page Plan](#3-page-by-page-plan)
4. [Component Improvements](#4-component-improvements)
5. [Mobile Strategy](#5-mobile-strategy)
6. [Accessibility](#6-accessibility)
7. [Performance](#7-performance)
8. [Implementation Order](#8-implementation-order)

---

## 1. Information Architecture

### 1.1 Site Map

```
/ (Homepage)
├── /events (Events listing)
│   └── /events/[slug] (Event detail + reservation form)
├── /reservation-success (Booking confirmation)
├── /admin/login (Admin authentication)
├── /admin (Admin dashboard — protected)
├── /checkin (Door staff check-in — protected)
└── /auth/error (Auth error fallback)
```

### 1.2 Navigation Structure

**Public Nav (unauthenticated visitors):**
- Logo (wordmark) → `/`
- Events → `/events`
- Login → `/admin/login` (subtle, secondary CTA)

**Protected Nav (admin/checkin staff):**
- Dashboard → `/admin`
- Check-In → `/checkin`
- Logout button

### 1.3 Page Hierarchy

| Priority | Page | Purpose | Current File |
|----------|------|---------|-------------|
| P0 | Homepage | Brand + featured events + CTA | `pages/index.tsx` → `components/Hero.tsx` |
| P0 | Event Detail | Info + reservation form | `pages/events/[slug].tsx` |
| P1 | Events Listing | Browse all upcoming events | Not yet exists (needs creation) |
| P1 | Reservation Success | Confirmation + code display | `pages/reservation-success.tsx` |
| P2 | Admin Login | Staff authentication | `pages/admin/login.tsx` |
| P2 | Admin Dashboard | Manage reservations | `pages/admin.tsx` |
| P2 | Check-In | Door staff tool | `pages/checkin.tsx` |

### 1.4 Current Architecture Issues

- **Dual component systems:** `components/Hero.tsx` (old, inline styles) vs `src/components/events/EventCard.tsx` (new, CSS variables). The old system is used by the active pages.
- **No events listing page:** No `/events` route exists. The homepage IS the events page.
- **No shared layout:** `pages/_app.tsx` is bare — no `<Layout>`, no nav, no footer wrapper.
- **Inconsistent data flow:** Old pages use `getServerSideProps` directly; new components use the `src/lib/` utility layer.

---

## 2. Design System

### 2.1 Colors

The existing design tokens in `src/styles/tokens.css` and `src/lib/design-tokens.ts` are solid. The plan extends them:

```css
/* src/styles/tokens.css — additions */

@theme {
  /* === EXTENDED PALETTE === */
  --color-bg-elevated-2: #22222F;        /* Elevated surface for modals/drawers */
  --color-bg-input: rgba(255, 255, 255, 0.04);  /* Form input backgrounds */
  
  /* === GRADIENT TOKENS === */
  --gradient-aurora: linear-gradient(135deg, #A855F7 0%, #3B82F6 50%, #EC4899 100%);
  --gradient-dark: linear-gradient(180deg, #0A0A0F 0%, #12121A 100%);
  
  /* === OVERLAY TOKENS === */
  --color-overlay-light: rgba(255, 255, 255, 0.03);
  --color-overlay-medium: rgba(255, 255, 255, 0.06);
  
  /* === SEMANTIC SURFACE === */
  --color-surface-glass: rgba(18, 18, 26, 0.8);  /* Glassmorphism base */
}
```

**Color usage rules:**
- `--color-bg-base` — Page background
- `--color-bg-surface` — Cards, panels
- `--color-bg-elevated` — Modals, dropdowns, drawers
- `--color-bg-input` — Form fields
- `--color-neon-purple` — Primary accent, CTAs, focus rings
- `--color-neon-pink` — Secondary accent, gradients
- `--color-neon-green` — Success states
- `--color-neon-amber` — Warning/limited states
- `--color-neon-red` — Error/destructive states

### 2.2 Typography

**Font stack (already defined in tokens):**

| Token | Font | Usage |
|-------|------|-------|
| `--font-display` | Space Grotesk | Headlines, wordmark, section titles |
| `--font-body` | Inter | Body text, labels, descriptions |
| `--font-mono` | JetBrains Mono | Codes, dates, timestamps |

**Type scale (from `src/lib/design-tokens.ts`):**

| Token | Size | Line-height | Weight | Usage |
|-------|------|-------------|--------|-------|
| display | 48px | 52px | 700 | Hero wordmark |
| headline | 32px | 36px | 700 | Page titles |
| title | 24px | 28px | 600 | Section headers |
| subtitle | 18px | 24px | 500 | Card titles |
| bodyLg | 16px | 24px | 400 | Lead paragraphs |
| body | 14px | 20px | 400 | Default body |
| bodySm | 12px | 16px | 400 | Captions, meta |
| label | 13px | 16px | 500 | Form labels, nav items |
| caption | 11px | 14px | 400 | Badges, timestamps |
| button | 14px | 16px | 600 | All buttons |
| code | 16px | 20px | 700 | Reservation codes |

**Heading hierarchy pattern:**
```tsx
// Display — page-level hero
<h1 className="font-[var(--font-display)] text-[48px] leading-[52px] font-bold tracking-tight">
  SALOSALOSESSIONS
</h1>

// Headline — section titles
<h2 className="font-[var(--font-display)] text-[32px] leading-[36px] font-bold">
  Upcoming Sessions
</h2>

// Title — card titles
<h3 className="font-[var(--font-display)] text-[24px] leading-[28px] font-semibold">
  Event Name
</h3>

// Subtitle — secondary card info
<h4 className="font-[var(--font-body)] text-[18px] leading-[24px] font-medium">
  Venue Name
</h4>
```

### 2.3 Spacing

**8px base grid (from `src/lib/design-tokens.ts`):**

| Token | Value | Usage |
|-------|-------|-------|
| 0 | 0 | — |
| 1 | 4px | Tight inline gaps |
| 2 | 8px | Icon + text gaps |
| 3 | 12px | Compact padding |
| 4 | 16px | Standard padding |
| 5 | 20px | Card internal padding |
| 6 | 24px | Section padding (mobile) |
| 8 | 32px | Section padding (desktop) |
| 10 | 40px | Large section gaps |
| 12 | 48px | Page section spacing |
| 16 | 64px | Hero padding |
| 20 | 80px | Max section spacing |

**Page-level spacing pattern:**
- Mobile: `px-4 py-8` (16px / 32px)
- Tablet: `px-6 py-12` (24px / 48px)
- Desktop: `px-8 py-16` (32px / 64px)

### 2.4 Shadows & Borders

```css
/* Shadows */
--shadow-glow: 0 0 20px rgba(168, 85, 247, 0.3);     /* Hover/focus glow */
--shadow-card: 0 4px 12px rgba(0, 0, 0, 0.3);          /* Card elevation */
--shadow-modal: 0 24px 48px rgba(0, 0, 0, 0.5);        /* Modal/drawer */
--shadow-elevated: 0 8px 24px rgba(0, 0, 0, 0.4);      /* Dropdown */

/* Borders */
--color-border-default: rgba(255, 255, 255, 0.08);     /* Standard */
--color-border-hover: rgba(255, 255, 255, 0.16);       /* Hover state */
--color-border-focus: #A855F7;                          /* Focus ring */
--color-border-success: #22C55E;                        /* Success state */

/* Border radius */
--radius-card: 16px;
--radius-button: 12px;
--radius-input: 12px;
--radius-badge: 20px;
```

### 2.5 Transitions & Animations

```css
/* Transitions */
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
```

**Animation principles:**
- Use CSS `transition` exclusively — no animation libraries
- Hover states: `transition-all duration-200`
- Page transitions: Fade-in with `opacity` + `translateY(8px)` over 300ms
- Loading states: Pulse skeleton (CSS `@keyframes pulse`)
- Entrance animations: Stagger children by 50ms using `transition-delay`

**Keyframe patterns:**
```css
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.2); }
  50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.4); }
}
```

---

## 3. Page-by-Page Plan

### 3.1 Homepage

**Current state:** `pages/index.tsx` → `components/Hero.tsx`  
**Issues:** Inline styles, no layout wrapper, no events listing page, banderitas are decorative noise

**Redesign structure:**

```
┌─────────────────────────────────────────────┐
│  Nav (glassmorphism, fixed)                 │
│  [Logo]              [Events] [Login]       │
├─────────────────────────────────────────────┤
│                                             │
│  Hero Section (full-viewport)               │
│  ┌─────────────────────────────────────┐    │
│  │  Radial glow background             │    │
│  │  Wordmark (Space Grotesk display)    │    │
│  │  Tagline                            │    │
│  │  [JOIN THE GUESTLIST] CTA           │    │
│  └─────────────────────────────────────┘    │
│                                             │
├─────────────────────────────────────────────┤
│  Featured Events Section                    │
│  ┌──────┐ ┌──────┐ ┌──────┐                │
│  │Event │ │Event │ │Event │                │
│  │Card  │ │Card  │ │Card  │                │
│  └──────┘ └──────┘ └──────┘                │
│  [View All Events →]                        │
├─────────────────────────────────────────────┤
│  Social Proof / Stats Bar                   │
│  500+ Guests  •  50+ Events  •  Manila     │
├─────────────────────────────────────────────┤
│  CTA Section (gradient background)          │
│  "Ready to experience the night?"           │
│  [Get on the Guestlist]                     │
├─────────────────────────────────────────────┤
│  Footer                                     │
│  © 2026 SaloSaloSessionsPH                  │
└─────────────────────────────────────────────┘
```

**Key changes:**
1. Replace banderitas with subtle noise texture (already partially done)
2. Add proper nav with glassmorphism effect
3. Featured events use the redesigned `EventCard` component
4. Add stats/social proof section between events and CTA
5. CTA section uses gradient background with glow
6. Footer with proper links and branding

**Hero section specs:**
- Full viewport height (`min-h-screen`)
- Radial gradient glow behind wordmark (purple → pink, 18% opacity)
- Wordmark: `text-4xl` mobile → `text-8xl` desktop
- CTA button: Glassmorphism with glow on hover
- Noise texture overlay at 4% opacity

### 3.2 Events Listing Page (NEW)

**Route:** `/events`  
**File:** `pages/events/index.tsx` (new)

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Nav (same as homepage)                     │
├─────────────────────────────────────────────┤
│  Page Header                                │
│  "Upcoming Sessions"                        │
│  Subtext: "Reserve your spot"               │
├─────────────────────────────────────────────┤
│  Search & Filter Bar                        │
│  [🔍 Search events...]  [All Venues ▼]     │
├─────────────────────────────────────────────┤
│  Events Grid (responsive)                   │
│  ┌──────┐ ┌──────┐ ┌──────┐                │
│  │Card  │ │Card  │ │Card  │                │
│  └──────┘ └──────┘ └──────┘                │
│  ┌──────┐ ┌──────┐ ┌──────┐                │
│  │Card  │ │Card  │ │Card  │                │
│  └──────┘ └──────┘ └──────┘                │
├─────────────────────────────────────────────┤
│  Empty State (when no events match)         │
│  "No sessions found" + illustration         │
└─────────────────────────────────────────────┘
```

**Search/filter features:**
- Text search: Filter by event name, venue
- Venue filter: Dropdown with unique venues from API
- Status filter: All / Available / Limited / Sold Out
- Client-side filtering with debounced search (300ms)

**States:**
- **Loading:** Skeleton grid (6 placeholder cards with shimmer)
- **Empty:** Icon + message + "Clear filters" button
- **Error:** Inline error with retry button

**API integration:**
- Fetch from `/api/events/index.ts` (already exists)
- Use `getServerSideProps` for initial load, client-side for filtering

### 3.3 Event Detail Page

**Current state:** `pages/events/[slug].tsx`  
**Issues:** Inline styles, no layout, no gallery, basic form, no loading states

**Redesign structure:**
```
┌─────────────────────────────────────────────┐
│  Nav                                        │
├─────────────────────────────────────────────┤
│  EventHero (full-bleed image)                │
│  ┌─────────────────────────────────────┐    │
│  │  [Availability Badge]               │    │
│  │  Event Title (display font)         │    │
│  │  Venue • Date • Time                │    │
│  └─────────────────────────────────────┘    │
├─────────────────────────────────────────────┤
│  Content Grid (2-col on desktop)            │
│  ┌──────────────────┐ ┌──────────────────┐  │
│  │ Event Info       │ │ Reservation      │  │
│  │ • Date (full)   │ │ Form (sticky)    │  │
│  │ • Venue         │ │                  │  │
│  │ • Description   │ │ [Name]           │  │
│  │ • Capacity bar  │ │ [Mobile]         │  │
│  │                 │ │ [Email]          │  │
│  │ Gallery         │ │ [Instagram]      │  │
│  │ [img] [img]    │ │ [Guests ▼]       │  │
│  │                 │ │                  │  │
│  │                 │ │ [RESERVE SPOT]   │  │
│  └──────────────────┘ └──────────────────┘  │
├─────────────────────────────────────────────┤
│  Back Link → Events                         │
└─────────────────────────────────────────────┘
```

**Reservation form improvements:**
- Sticky sidebar on desktop (sticks at `top: 100px` on scroll)
- Real-time validation with inline error messages
- Loading spinner on submit button
- Success: Redirect to `/reservation-success?code=GL-XXXXXX`
- Error: Inline error banner with dismiss

**Capacity bar:**
```
████████████░░░░░░░░ 12/20 (60% — Available)
```
- Visual progress bar with gradient fill
- Color changes: green → amber → red based on capacity %

### 3.4 Reservation Success Page

**Current state:** `pages/reservation-success.tsx`  
**Issues:** Basic layout, QR placeholder, no confetti/celebration animation

**Redesign:**
- Large centered confirmation card
- Animated checkmark (CSS, not JS)
- Reservation code displayed prominently (mono font, large)
- "Save your code" callout with copy-to-clipboard button
- QR code placeholder with actual QR generation (use `qrcode.react` library)
- CTAs: "Back to Events" + "Check-In System"
- Subtle confetti particles (CSS-only with `::before`/`::after` pseudo-elements)

**Success card specs:**
```
┌─────────────────────────────────┐
│  ✓ (animated checkmark)         │
│  "You're on the list!"          │
│  ─────────────────────────      │
│  Reservation Code               │
│  ┌─────────────────────────┐    │
│  │  GL-A7K9M2              │    │
│  └─────────────────────────┘    │
│  [Copy Code]                    │
│  ─────────────────────────      │
│  Event: Electric Paradise       │
│  Date: Sat, Jun 20 • 10:00 PM  │
│  Venue: TBA                     │
│  ─────────────────────────      │
│  [QR Code placeholder]          │
│  Show this at the door          │
│                                 │
│  [Back to Events] [Check-In]    │
└─────────────────────────────────┘
```

### 3.5 Auth Pages (Admin Login)

**Current state:** `pages/admin/login.tsx`  
**Issues:** Basic form, no visual interest, no loading state animation

**Redesign:**
- Full-viewport centered card with gradient background
- Glassmorphism card (backdrop-blur, semi-transparent)
- Logo/wordmark above form
- Animated focus states on inputs
- Loading spinner on submit button
- Error state with shake animation
- "Back to Home" link at bottom

**Form validation:**
- Client-side: Required fields, email format
- Server-side: Invalid credentials error
- No real-time validation (avoid premature error display)

**Specs:**
```
┌─────────────────────────────────┐
│  (radial glow background)       │
│                                 │
│  ┌─────────────────────────┐    │
│  │  SALOSALOSESSIONS       │    │
│  │  ─────────────────      │    │
│  │                         │    │
│  │  Email                  │    │
│  │  [________________]     │    │
│  │                         │    │
│  │  Password               │    │
│  │  [________________]  👁 │    │
│  │                         │    │
│  │  [Sign In]              │    │
│  │                         │    │
│  │  ← Back to Home         │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

### 3.6 Admin Dashboard

**Current state:** `pages/admin.tsx`  
**Issues:** No layout wrapper, table overflows on mobile, no loading states, no pagination

**Redesign structure:**
```
┌─────────────────────────────────────────────┐
│  Admin Nav                                  │
│  [Logo]  Dashboard  Check-In  [Logout]      │
├─────────────────────────────────────────────┤
│  Stats Row (4 cards)                        │
│  [Total] [Pending] [Approved] [Checked In]  │
├─────────────────────────────────────────────┤
│  Search & Filter                            │
│  [🔍 Search...] [Status ▼] [Export CSV]     │
├─────────────────────────────────────────────┤
│  Reservations Table / Card Layout           │
│  Desktop: Table with sortable columns       │
│  Mobile: Card layout with stacked info      │
├─────────────────────────────────────────────┤
│  Pagination (if > 50 records)               │
│  [< 1 2 3 ... 10 >]                        │
└─────────────────────────────────────────────┘
```

**Table improvements:**
- Responsive: Cards on mobile (`< 640px`), table on desktop
- Sortable columns (click header to sort)
- Bulk actions (select multiple, approve/reject)
- Inline status badges with proper color tokens
- Row actions: Approve, Reject, Check In (contextual)
- Loading: Skeleton rows during fetch
- Empty: "No reservations found" with illustration

**Mobile card layout:**
```
┌─────────────────────────────────┐
│  GL-A7K9M2          [PENDING]   │
│  Juan Dela Cruz                 │
│  3 guests  •  Jun 20, 2026     │
│  ─────────────────────────      │
│  [Approve] [Reject]             │
└─────────────────────────────────┘
```

---

## 4. Component Improvements

### 4.1 EventCard

**Current:** `src/components/events/EventCard.tsx` — already well-designed with CSS variables  
**Improvements needed:**

```tsx
// Enhanced EventCard with:
// 1. Skeleton loading state
// 2. Better image placeholder with animated gradient
// 3. Hover lift effect (translateY(-4px))
// 4. Capacity progress bar
// 5. Improved badge design

<article className="
  relative overflow-hidden rounded-[var(--radius-card)]
  border border-[var(--color-border-default)]
  bg-[var(--color-bg-surface)]
  transition-all duration-300
  hover:border-[var(--color-neon-purple)]/50
  hover:shadow-[var(--shadow-glow)]
  hover:-translate-y-1
  focus-within:border-[var(--color-border-focus)]
  focus-within:ring-2 focus-within:ring-[var(--color-border-focus)]/40
">
  {/* Image with next/image */}
  <div className="relative aspect-[16/9] overflow-hidden">
    <Image
      src={coverImage}
      alt={title}
      fill
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
      className="object-cover transition-transform duration-500 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-surface)] via-transparent to-transparent" />
  </div>

  {/* Capacity bar */}
  <div className="h-1 w-full bg-[var(--color-bg-elevated)]">
    <div
      className="h-full bg-gradient-to-r from-[var(--color-neon-purple)] to-[var(--color-neon-pink)] transition-all duration-500"
      style={{ width: `${capacityPercent}%` }}
    />
  </div>

  {/* Content */}
  <div className="p-4 sm:p-5">
    <h3 className="font-[var(--font-display)] text-lg font-bold text-[var(--color-text-primary)]">
      {title}
    </h3>
    <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">{venue}</p>
    <div className="mt-3 flex items-center gap-3 font-[var(--font-mono)] text-xs text-[var(--color-text-tertiary)]">
      <time dateTime={startDate}>{dateLabel}</time>
      <span className="opacity-40">•</span>
      <time dateTime={startDate}>{timeLabel}</time>
    </div>
  </div>
</article>
```

### 4.2 Navigation Component (NEW)

**File:** `src/components/layout/Nav.tsx`

```tsx
// Glassmorphism nav with:
// - Fixed position, full-width
// - backdrop-blur-xl bg-[var(--color-surface-glass)]
// - Border-bottom: 1px solid var(--color-border-default)
// - Logo (wordmark) left
// - Nav links center/right
// - Mobile: Bottom nav bar (see Mobile Strategy)

<nav className="
  fixed top-0 left-0 right-0 z-50
  border-b border-[var(--color-border-default)]
  bg-[var(--color-surface-glass)] backdrop-blur-xl
">
  <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
    <Link href="/" className="font-[var(--font-display)] text-xl font-bold tracking-tight">
      <span className="text-[var(--color-text-primary)]">SALO</span>
      <span className="text-[var(--color-neon-amber)]">SALO</span>
    </Link>
    <div className="flex items-center gap-6">
      <Link href="/events" className="font-[var(--font-body)] text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]">
        Events
      </Link>
      <Link href="/admin/login" className="rounded-[var(--radius-button)] border border-[var(--color-border-default)] px-4 py-2 font-[var(--font-body)] text-xs font-semibold tracking-wider text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-neon-purple)] hover:text-[var(--color-text-primary)]">
        LOGIN
      </Link>
    </div>
  </div>
</nav>
```

### 4.3 Footer Component (NEW)

**File:** `src/components/layout/Footer.tsx`

```tsx
<footer className="border-t border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
  <div className="mx-auto max-w-7xl px-4 py-12">
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {/* Brand */}
      <div>
        <h3 className="font-[var(--font-display)] text-xl font-bold">
          <span className="text-[var(--color-text-primary)]">SALO</span>
          <span className="text-[var(--color-neon-amber)]">SALO</span>
        </h3>
        <p className="mt-2 text-sm text-[var(--color-text-tertiary)]">
          Manila's underground house & electronic collective.
        </p>
      </div>
      {/* Links */}
      <div>
        <h4 className="font-[var(--font-body)] text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Platform
        </h4>
        <ul className="mt-3 space-y-2">
          <li><Link href="/events" className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">Events</Link></li>
          <li><Link href="/admin/login" className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">Admin</Link></li>
        </ul>
      </div>
      {/* Social */}
      <div>
        <h4 className="font-[var(--font-body)] text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Connect
        </h4>
        <div className="mt-3 flex gap-3">
          {/* Instagram, Twitter icons */}
        </div>
      </div>
    </div>
    <div className="mt-8 border-t border-[var(--color-border-default)] pt-6 text-center font-[var(--font-mono)] text-xs text-[var(--color-text-tertiary)]">
      © 2026 SaloSaloSessionsPH — All rights reserved.
    </div>
  </div>
</footer>
```

### 4.4 Hero Component (Redesigned)

**File:** `components/Hero.tsx` — complete rewrite

**Key changes:**
- Remove banderitas (decorative noise)
- Add proper nav integration
- Use CSS variable tokens instead of inline styles
- Add social proof section below CTA
- Improve mobile spacing
- Add subtle parallax-like scroll effect on glow

### 4.5 Form Components (NEW)

**File:** `src/components/ui/Input.tsx`

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block font-[var(--font-body)] text-[13px] font-medium text-[var(--color-text-secondary)]"
      >
        {label}
      </label>
      <input
        id={id}
        className={`
          w-full rounded-[var(--radius-input)] border
          bg-[var(--color-bg-input)] px-4 py-3
          font-[var(--font-body)] text-[14px] text-[var(--color-text-primary)]
          placeholder:text-[var(--color-text-tertiary)]
          transition-all duration-200
          focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]/20
          ${error ? 'border-[var(--color-neon-red)]' : 'border-[var(--color-border-default)]'}
        `}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-[12px] text-[var(--color-neon-red)]" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-[12px] text-[var(--color-text-tertiary)]">
          {hint}
        </p>
      )}
    </div>
  );
}
```

**File:** `src/components/ui/Button.tsx`

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base = `
    inline-flex items-center justify-center gap-2
    font-[var(--font-display)] font-semibold
    rounded-[var(--radius-button)]
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]/40
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-[var(--color-neon-purple)] to-[var(--color-neon-pink)]
      text-white shadow-[var(--shadow-glow)]
      hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]
      hover:-translate-y-0.5
    `,
    secondary: `
      border border-[var(--color-border-default)]
      bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]
      hover:border-[var(--color-neon-purple)]/50 hover:bg-[var(--color-bg-elevated)]
    `,
    ghost: `
      text-[var(--color-text-secondary)]
      hover:text-[var(--color-text-primary)] hover:bg-white/5
    `,
    danger: `
      bg-[var(--color-neon-red)] text-white
      hover:bg-red-500
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[12px]',
    md: 'px-5 py-2.5 text-[14px]',
    lg: 'px-8 py-3.5 text-[15px]',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}
```

### 4.6 Skeleton Components (NEW)

**File:** `src/components/ui/Skeleton.tsx`

```tsx
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`
        animate-pulse rounded-[var(--radius-card)]
        bg-gradient-to-r from-[var(--color-bg-elevated)] via-[var(--color-bg-surface)] to-[var(--color-bg-elevated)]
        bg-[length:200%_100%]
        ${className}
      `}
      style={{ animation: 'shimmer 1.5s infinite' }}
    />
  );
}

export function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-default)]">
      <Skeleton className="aspect-[16/9] rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}
```

---

## 5. Mobile Strategy

### 5.1 Bottom Navigation (Protected Pages)

For admin and check-in staff who use phones:

```tsx
// src/components/layout/BottomNav.tsx
<nav className="
  fixed bottom-0 left-0 right-0 z-50
  border-t border-[var(--color-border-default)]
  bg-[var(--color-surface-glass)] backdrop-blur-xl
  safe-bottom
  md:hidden
">
  <div className="flex h-16 items-center justify-around">
    <NavLink href="/admin" icon={<UsersIcon />} label="Dashboard" />
    <NavLink href="/checkin" icon={<CheckInIcon />} label="Check-In" />
    <NavLink href="/admin/settings" icon={<SettingsIcon />} label="Settings" />
    <button onClick={signOut} icon={<LogOutIcon />} label="Logout" />
  </div>
</nav>
```

### 5.2 Touch Targets

- Minimum touch target: **44x44px** (WCAG 2.5.5)
- Bottom nav items: Full width tap area, 64px height minimum
- Buttons: Minimum `py-2.5` (40px) + border = ~44px total
- Table action buttons: `px-3 py-2` minimum (44px height)
- Filter chips: `px-4 py-2` with full-width on mobile

### 5.3 Swipe Gestures

**Event cards (mobile):**
- Swipe left: Quick actions (Share, Reserve)
- Implementation: CSS `transform: translateX()` with touch event handlers
- No library needed — use `onTouchStart`/`onTouchEnd` with threshold detection

**Admin table rows (mobile cards):**
- Swipe right: Approve
- Swipe left: Reject
- Visual feedback: Color strip appears under card during swipe

### 5.4 Mobile-Specific Layouts

| Breakpoint | Layout |
|-----------|--------|
| `< 640px` | Single column, bottom nav, stacked cards |
| `640-1024px` | 2-column grid, side nav optional |
| `> 1024px` | Full desktop layout, top nav, 3-column grid |

### 5.5 Mobile Form Optimizations

- Input `font-size: 16px` (prevents iOS zoom on focus)
- `inputmode` attributes: `inputmode="tel"` for phone, `inputmode="email"` for email
- `autocomplete` attributes for autofill
- Sticky submit button at bottom of viewport on mobile

---

## 6. Accessibility

### 6.1 Current Issues (from audit-findings.json)

- **UX-001:** All form inputs use placeholder-only labels — no `<label>` elements, no `aria-label`
- **UX-003:** Tables overflow on mobile — door staff cannot use check-in on phones

### 6.2 Keyboard Navigation

**Focus management:**
- All interactive elements must be keyboard accessible
- Focus ring: `focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]/40`
- Skip-to-content link at top of page
- Tab order follows visual order (no `tabindex` > 0)

**Modal/dialog patterns:**
- `role="dialog"` + `aria-modal="true"`
- `aria-labelledby` pointing to modal title
- Focus trap within modal
- Escape key closes modal

### 6.3 Labels & ARIA

**Form pattern (required for all inputs):**
```tsx
<label htmlFor="fullName" className="block text-sm font-medium">
  Full Name <span aria-hidden="true">*</span>
</label>
<input
  id="fullName"
  name="fullName"
  required
  aria-required="true"
  aria-describedby="fullName-hint"
/>
<p id="fullName-hint" className="text-xs text-[var(--color-text-tertiary)]">
  Enter your full name as it appears on your ID
</p>
```

**Dynamic content:**
- `aria-live="polite"` for status updates (e.g., "Reservation confirmed")
- `aria-busy="true"` for loading states
- `aria-current="page"` for active nav link

### 6.4 Contrast Requirements

All text must meet WCAG AA (4.5:1 for body, 3:1 for large text):

| Element | Color | Background | Ratio |
|---------|-------|-----------|-------|
| Primary text | `#FFFFFF` | `#0A0A0F` | 21:1 ✓ |
| Secondary text | `#A0A0B0` | `#0A0A0F` | 6.2:1 ✓ |
| Tertiary text | `#5A5A6E` | `#0A0A0F` | 3.8:1 ✓ (large only) |
| Neon purple on dark | `#A855F7` | `#0A0A0F` | 5.1:1 ✓ |
| Neon green on dark | `#22C55E` | `#0A0A0F` | 10.8:1 ✓ |

**Note:** Tertiary text (`#5A5A6E`) only passes AA for large text (18px+ bold or 24px+). Use sparingly and never for body text.

### 6.5 Screen Reader Considerations

- Decorative images: `alt=""` (empty alt)
- Informative images: Descriptive alt text
- Icons: `aria-hidden="true"` with visible text label nearby
- Status badges: Include screen-reader-only text
- Tables: Proper `<thead>`, `<th scope="col">`, and `<caption>`

---

## 7. Performance

### 7.1 Image Optimization

**Current issue:** `src/components/events/EventCard.tsx` and `EventHero.tsx` use raw `<img>` tags with eslint-disable comments.

**Fix:** Replace with `next/image`:

```tsx
import Image from 'next/image';

// In EventCard
<Image
  src={coverImage}
  alt={title}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
  className="object-cover"
/>

// In EventHero (above the fold — priority)
<Image
  src={event.coverImage}
  alt={event.title}
  fill
  priority
  sizes="100vw"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  className="object-cover"
/>
```

**next.config.ts additions:**
```ts
const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: '**.imgix.net' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};
```

### 7.2 Rendering Strategy

| Page | Strategy | Reason |
|------|----------|--------|
| Homepage | ISR (`revalidate: 60`) | Events change every few minutes |
| Event Detail | ISR (`revalidate: 30`) | Capacity updates frequently |
| Events Listing | ISR (`revalidate: 60`) | Same as homepage |
| Reservation Success | SSG | Static content |
| Admin Dashboard | SSR (client-rendered) | Auth-protected, real-time data |
| Check-In | SSR (client-rendered) | Real-time status updates |
| Admin Login | SSR | Auth flow |

### 7.3 Bundle Optimization

**Current dependencies to optimize:**
- `lucide-react` — tree-shakeable, import only needed icons
- `next-auth` — only loaded on admin pages
- `axios` — consider replacing with native `fetch` (already used in most places)

**Code splitting:**
- Admin dashboard: Dynamic import (only loaded for authenticated users)
- Check-In: Separate chunk (door staff don't need admin code)
- QR code library: Lazy-loaded on reservation-success page only

```tsx
// Dynamic import for heavy components
const QRCode = dynamic(() => import('qrcode.react'), {
  ssr: false,
  loading: () => <Skeleton className="h-[150px] w-[150px]" />,
});
```

### 7.4 Core Web Vitals Targets

| Metric | Target | Current (est.) |
|--------|--------|---------------|
| LCP | < 2.5s | ~4s (unoptimized images) |
| FID/INP | < 100ms | ~150ms |
| CLS | < 0.1 | ~0.15 (layout shifts from images) |
| TTFB | < 600ms | ~800ms (SSR) |

**Improvements:**
- LCP: `next/image` with `priority` on hero, preload critical fonts
- CLS: Explicit `width`/`height` on all images, skeleton loading states
- TTFB: ISR for public pages, edge caching via CDN

---

## 8. Implementation Order

### Phase 1: Foundation (Week 1)

**Goal:** Design system + shared layout working across all pages

| Task | Files | Priority |
|------|-------|----------|
| 1.1 Create shared Layout with Nav + Footer | `src/components/layout/Layout.tsx` | P0 |
| 1.2 Update `_app.tsx` to use Layout | `pages/_app.tsx` | P0 |
| 1.3 Extend design tokens (add missing tokens) | `src/styles/tokens.css` | P0 |
| 1.4 Create Button component | `src/components/ui/Button.tsx` | P0 |
| 1.5 Create Input component | `src/components/ui/Input.tsx` | P0 |
| 1.6 Create Skeleton component | `src/components/ui/Skeleton.tsx` | P0 |
| 1.7 Configure `next.config.ts` for images | `next.config.ts` | P0 |

### Phase 2: Homepage Redesign (Week 1-2)

**Goal:** New homepage with proper layout and featured events

| Task | Files | Priority |
|------|-------|----------|
| 2.1 Rewrite Hero component | `components/Hero.tsx` | P0 |
| 2.2 Update EventCard with next/image | `src/components/events/EventCard.tsx` | P0 |
| 2.3 Update EventHero with next/image | `src/components/events/EventHero.tsx` | P0 |
| 2.4 Add social proof/stats section | `components/Hero.tsx` | P1 |
| 2.5 Add CTA section | `components/Hero.tsx` | P1 |
| 2.6 Wire homepage to use Layout | `pages/index.tsx` | P0 |

### Phase 3: Events Pages (Week 2)

**Goal:** Events listing + redesigned event detail

| Task | Files | Priority |
|------|-------|----------|
| 3.1 Create events listing page | `pages/events/index.tsx` | P0 |
| 3.2 Add search + filter UI | `pages/events/index.tsx` | P1 |
| 3.3 Add loading/empty/error states | `pages/events/index.tsx` | P1 |
| 3.4 Rewrite event detail page | `pages/events/[slug].tsx` | P0 |
| 3.5 Improve reservation form | `pages/events/[slug].tsx` | P0 |
| 3.6 Add capacity bar + info sidebar | `pages/events/[slug].tsx` | P1 |
| 3.7 Fix slug routing | `src/lib/event-mappers.ts`, `pages/events/[slug].tsx` | P0 |

### Phase 4: Auth & Dashboard (Week 3)

**Goal:** Polished login + responsive admin

| Task | Files | Priority |
|------|-------|----------|
| 4.1 Redesign login page | `pages/admin/login.tsx` | P1 |
| 4.2 Add loading states to forms | `pages/admin/login.tsx`, `pages/events/[slug].tsx` | P0 |
| 4.3 Make admin dashboard responsive | `pages/admin.tsx` | P0 |
| 4.4 Add mobile card layout for tables | `pages/admin.tsx`, `pages/checkin.tsx` | P0 |
| 4.5 Add stats cards to dashboard | `pages/admin.tsx` | P1 |
| 4.6 Create BottomNav for mobile | `src/components/layout/BottomNav.tsx` | P1 |
| 4.7 Make check-in page responsive | `pages/checkin.tsx` | P0 |

### Phase 5: Polish (Week 3-4)

**Goal:** Animations, accessibility, performance

| Task | Files | Priority |
|------|-------|----------|
| 5.1 Add page transition animations | `src/components/layout/Layout.tsx` | P2 |
| 5.2 Add loading skeletons | All pages | P1 |
| 5.3 Redesign reservation success page | `pages/reservation-success.tsx` | P1 |
| 5.4 Add QR code generation | `pages/reservation-success.tsx` | P2 |
| 5.5 Accessibility audit + fixes | All pages | P0 |
| 5.6 Performance audit (Lighthouse) | All pages | P1 |
| 5.7 Add error boundaries | `pages/_app.tsx` | P1 |
| 5.8 Add toast notifications | `src/components/ui/Toast.tsx` | P2 |

### Phase 6: Final Integration (Week 4)

| Task | Files | Priority |
|------|-------|----------|
| 6.1 Remove old inline-style pages | `components/Hero.tsx` (old version) | P0 |
| 6.2 Ensure consistent Layout on all pages | All pages | P0 |
| 6.3 Final cross-browser testing | All pages | P1 |
| 6.4 Mobile testing (real devices) | All pages | P1 |

---

## Appendix A: File Inventory

### Current Files (to be modified)

| File | Action | Phase |
|------|--------|-------|
| `pages/_app.tsx` | Add Layout wrapper | 1 |
| `pages/index.tsx` | Use Layout, pass events to new Hero | 2 |
| `pages/events/[slug].tsx` | Complete rewrite | 3 |
| `pages/admin.tsx` | Responsive redesign | 4 |
| `pages/admin/login.tsx` | Visual redesign | 4 |
| `pages/checkin.tsx` | Responsive redesign | 4 |
| `pages/reservation-success.tsx` | Visual redesign | 5 |
| `components/Hero.tsx` | Complete rewrite | 2 |
| `src/styles/tokens.css` | Extend tokens | 1 |
| `src/components/events/EventCard.tsx` | next/image + enhancements | 2 |
| `src/components/events/EventHero.tsx` | next/image + enhancements | 2 |
| `next.config.ts` | Add image config | 1 |

### New Files (to be created)

| File | Phase |
|------|-------|
| `src/components/layout/Layout.tsx` | 1 |
| `src/components/layout/Nav.tsx` | 1 |
| `src/components/layout/Footer.tsx` | 1 |
| `src/components/layout/BottomNav.tsx` | 4 |
| `src/components/ui/Button.tsx` | 1 |
| `src/components/ui/Input.tsx` | 1 |
| `src/components/ui/Skeleton.tsx` | 1 |
| `src/components/ui/Toast.tsx` | 5 |
| `src/components/ui/Badge.tsx` | 1 |
| `src/components/ui/CapacityBar.tsx` | 3 |
| `pages/events/index.tsx` | 3 |

---

## Appendix B: Design Token Quick Reference

```css
/* Copy-paste reference for component development */

/* Colors */
--color-bg-base: #0A0A0F;           /* Page bg */
--color-bg-surface: #12121A;         /* Card bg */
--color-bg-elevated: #1A1A26;        /* Modal/dropdown bg */
--color-bg-input: rgba(255,255,255,0.04); /* Input bg */

--color-neon-purple: #A855F7;        /* Primary accent */
--color-neon-pink: #EC4899;          /* Secondary accent */
--color-neon-blue: #3B82F6;          /* Info */
--color-neon-green: #22C55E;         /* Success */
--color-neon-amber: #F59E0B;         /* Warning */
--color-neon-red: #EF4444;           /* Error */

--color-text-primary: #FFFFFF;       /* Headlines */
--color-text-secondary: #A0A0B0;     /* Body */
--color-text-tertiary: #5A5A6E;      /* Captions */
--color-text-inverse: #0A0A0F;       /* On light bg */

--color-border-default: rgba(255,255,255,0.08);
--color-border-hover: rgba(255,255,255,0.16);
--color-border-focus: #A855F7;

/* Typography */
--font-display: 'Space Grotesk', sans-serif;
--font-body: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Radius */
--radius-card: 16px;
--radius-button: 12px;
--radius-input: 12px;
--radius-badge: 20px;

/* Shadows */
--shadow-glow: 0 0 20px rgba(168,85,247,0.3);
--shadow-card: 0 4px 12px rgba(0,0,0,0.3);
--shadow-modal: 0 24px 48px rgba(0,0,0,0.5);

/* Transitions */
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
```

---

## Appendix C: Responsive Breakpoints

Using Tailwind defaults:

| Breakpoint | Min-width | Usage |
|-----------|-----------|-------|
| `sm` | 640px | 2-column grids, larger text |
| `md` | 768px | Side-by-side layouts |
| `lg` | 1024px | Full desktop, 3-column grids |
| `xl` | 1280px | Max content width |
| `2xl` | 1536px | Ultra-wide (rare) |

**Mobile-first pattern:**
```tsx
/* Base: mobile styles */
<div className="grid grid-cols-1 gap-4">
  ...
</div>

/* sm: 2 columns */
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
  ...
</div>

/* lg: 3 columns */
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  ...
</div>
```

---

*End of Frontend Redesign Plan*
