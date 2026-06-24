# GUESTLIST Design Research Report

**Prepared for:** GUESTLIST Nightclub Platform Redesign  
**Date:** June 2026  
**Scope:** UX/UI design research across nightlife, event discovery, ticketing, hospitality, and luxury platforms

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Top 10 Reference Platforms](#top-10-reference-platforms)
3. [Key UX Patterns Discovered](#key-ux-patterns-discovered)
4. [Common Design Trends](#common-design-trends)
5. [Mobile Best Practices](#mobile-best-practices)
6. [Conversion Best Practices](#conversion-best-practices)
7. [Recommendations for GUESTLIST](#recommendations-for-guestlist)
8. [Philippines / NCR Nightlife Context](#philippines--ncr-nightlife-context)

---

## Executive Summary

This report synthesizes research across 20+ platforms in five categories: nightlife/reservation tools, event discovery, ticketing, hospitality reservations, and premium luxury brands. The goal is to inform a dark-themed, mobile-first web platform for GUESTLIST that serves the Philippines nightlife market — specifically Metro Manila's BGC, Makati/Poblacion, and Ortigas corridor.

**Key finding:** No existing platform combines the social-discovery feel of Resident Advisor with the premium bottle-service UX of SevenRooms and the localized event-browsing familiarity of Ticketnation. This gap is GUESTLIST's opportunity.

---

## Top 10 Reference Platforms

### 1. Dice.fm
**URL:** https://dice.fm  
**Category:** Music Event Discovery & Ticketing

**Visual Style:**
- Dark-first UI with vibrant event imagery as the primary color source
- Bold sans-serif typography (custom or similar to Neue Haas Grotesk)
- Minimal chrome — content-forward design
- Accent colors pulled dynamically from event artwork (purple, magenta, electric blue)

**Key UX Patterns:**
- "Weirdly easy ticketing" — 3-tap purchase flow
- Personalized home feed based on followed artists
- Artist-following as the primary discovery mechanism (not genre/category)
- Upfront pricing with no hidden fees at checkout
- Social proof: "X friends going" integration
- Sold-out show access via waitlist

**Mobile Approach:**
- Bottom tab navigation: Home, Search, Tickets, Profile
- Full-bleed event cards with swipe gestures
- Sticky "Get Tickets" CTA on event pages
- Native-feel transitions and micro-animations

**What Works:**
- Frictionless purchase flow
- Strong editorial voice and curation
- Artist-centric discovery (not just event listings)

**What Doesn't:**
- Limited appeal outside indie/electronic music
- No venue-focused experience
- Weak on large-scale festival productions

---

### 2. Resident Advisor (RA)
**URL:** https://ra.co  
**Category:** Electronic Music Event Discovery

**Visual Style:**
- Clean, editorial dark theme with high-contrast white text on near-black (#111)
- Serif headlines paired with sans-serif body (sophisticated, magazine feel)
- Muted palette — primarily monochrome with selective color for event imagery
- Generous whitespace despite dense information

**Key UX Patterns:**
- Listings-first approach with powerful filters (date, region, genre, venue)
- RA Picks editorial curation creates trust and authority
- Artist → Venue → Event relational navigation
- Calendar view for browsing events by date
- Sync with Spotify/Apple Music for personalized alerts
- "Just announced" vs. "Just in time" dual urgency indicators

**Mobile Approach:**
- Responsive web with card-based event listing
- Sticky date filter at top
- Map view for nearby events
- Bottom-sheet style event details

**What Works:**
- Authority through editorial content
- Best-in-class filtering for music discovery
- Strong community trust (founded 2001)

**What Doesn't:**
- Dated UI with information overload on listing pages
- No integrated ticketing on-platform (redirects out)
- Weak visual hierarchy between promoted and organic listings

---

### 3. TablesReady
**URL:** https://www.tablesready.com  
**Category:** Nightclub Waitlist & Reservation Management

**Visual Style:**
- Clean, professional SaaS aesthetic
- White/light background with blue accent (#2563eb family)
- Card-based dashboard for venue operators
- Functional rather than aspirational design

**Key UX Patterns:**
- Self check-in via SMS link (no app download required)
- Real-time waitlist management with position indicators
- Automated SMS notifications for guest journey (joined, almost ready, ready)
- Venue-side dashboard with occupancy analytics
- QR code check-in for walk-ins
- VIP section tagging and management

**Mobile Approach:**
- Mobile-optimized guest-facing flow (SMS-based, no install)
- Progressive web app for venue staff
- Large touch targets for check-in buttons

**What Works:**
- Zero-friction guest experience (SMS, no app download)
- Solves real operational pain point for venues
- Real-time communication reduces perceived wait time

**What Doesn't:**
- B2B-focused — no consumer discovery layer
- Utilitarian design lacks nightlife energy/brand personality
- No social features or event marketing tools

---

### 4. Resy
**URL:** https://resy.com  
**Category:** Restaurant Reservation Platform

**Visual Style:**
- Dark, moody photography-forward design
- Warm color temperature — amber/brown tones against deep blacks
- Elegant serif typography (similar to Playfair Display)
- Cinematic food/restaurant imagery as hero elements
- "Epicurean Design System" — systematic approach to visual consistency

**Key UX Patterns:**
- Map-based discovery as default view (location-first)
- Curated inventory — only quality restaurants listed
- Collections and lists for different occasions
- One-tap booking with stored payment
- "Resy Credit" integration (Amex partnership)
- Restaurant guides and editorial content
- Real-time availability display

**Mobile Approach:**
- Native iOS/Android apps with full feature parity
- Map-centric browsing with list toggle
- Apple Pay / Google Pay integration
- Push notifications for confirmations and reminders

**What Works:**
- Guaranteed quality (curated inventory builds trust)
- Beautiful editorial photography creates desire
- Seamless rebooking of favorites
- Strong brand partnerships (Amex, Michelin)

**What Doesn't:**
- Limited to restaurant vertical
- No group/event planning features
- US-centric with limited international coverage

---

### 5. Eventbrite
**URL:** https://www.eventbrite.com  
**Category:** Event Discovery & Ticketing

**Visual Style:**
- Light theme with vibrant coral/red accent (#F6682F)
- Recently redesigned with Instrument — more editorial, community-focused
- Bold hero imagery with overlay text
- Card-based event browsing
- Colorful, accessible design system

**Key UX Patterns:**
- Powerful search with location + category + date filters
- Event cards with clear hierarchy: image → title → date → price
- "Save event" functionality for wishlist
- Organizer profiles with follow capability
- Recently redesigned discovery to be more "connection-focused"
- Robust ticketing with multiple ticket types per event
- Social sharing integration

**Mobile Approach:**
- Fully responsive web (PWA)
- Native apps for organizers and attendees
- Sticky "Get Tickets" button on event pages
- Mobile-optimized checkout with digital wallet support

**What Works:**
- Massive event inventory across all categories
- Strong organizer tools
- Excellent search and filtering
- Trust and brand recognition

**What Doesn't:**
- Not nightlife-specific — generic event feel
- Can feel overwhelming with too many options
- No dark theme (user demand unmet)
- Limited curation — quality varies wildly

---

### 6. SevenRooms
**URL:** https://sevenrooms.com  
**Category:** Hospitality Reservation & Guest Management

**Visual Style:**
- Premium, sophisticated aesthetic
- Dark navy/charcoal backgrounds with gold accents
- Clean typography with generous spacing
- High-quality venue photography
- Luxury hospitality feel without being ostentatious

**Key UX Patterns:**
- Guest-centric CRM — remembers preferences, allergies, special dates
- Automated marketing based on guest history
- Table management with visual floor plan
- Waitlist with estimated wait times
- Multi-venue support for hospitality groups
- Voice AI for phone reservations
- Real-time table optimization

**Mobile Approach:**
- Staff-facing mobile dashboard for floor management
- Guest-facing reservation widget (embeddable)
- Mobile check-in and waitlist management

**What Works:**
- Deep guest data creates personalized experiences
- Operational efficiency tools (table turns, AI optimization)
- Trusted by luxury brands (MGM, Mandarin Oriental, Harrods)
- All-in-one: reservations + CRM + marketing

**What Doesn't:**
- B2B tool — no consumer-facing discovery
- Complex setup for small venues
- Enterprise pricing excludes smaller operators

---

### 7. Ticketmaster
**URL:** https://www.ticketmaster.com  
**Category:** Large-Scale Event Ticketing

**Visual Style:**
- Dark theme option available (relatively recently)
- Blue/black primary palette with brand blue (#0066CC)
- Information-dense layouts
- Seat map visualization as key differentiator
- Functional, utility-first design philosophy

**Key UX Patterns:**
- Interactive seat maps for assigned seating
- Dynamic pricing display
- Verified resale marketplace
- "Fan-to-fan exchange" for sold-out events
- Account-based ticket management
- Mobile ticket with rotating QR code (anti-fraud)
- Waitlist for sold-out shows

**Mobile Approach:**
- Native app with Apple Wallet integration
- Mobile-optimized seat map viewing
- Push notifications for price drops and reminders
- Digital ticket display with brightness boost

**What Works:**
- Comprehensive inventory (sports, concerts, theater)
- Seat selection visualization
- Trust and buyer protection
- Anti-fraud ticket technology

**What Doesn't:**
- Notorious for dark patterns (hidden fees, urgency manipulation)
- Cluttered UI with poor information hierarchy
- High fees damage user trust
- Generic — no nightlife-specific features

---

### 8. Ticketnation Philippines
**URL:** https://ticketnation.ph  
**Category:** Local Philippine Event Ticketing

**Visual Style:**
- Light theme with red/orange accent colors
- Card-based event grid
- Functional, e-commerce style layout
- Local event photography
- Straightforward, no-frills design

**Key UX Patterns:**
- Category browsing (concerts, sports, theater, festivals)
- Featured events carousel
- Venue-based discovery
- Secure resale platform
- Multiple payment channels (GCash, Maya, cards)
- Location-based filtering for Philippine cities

**Mobile Approach:**
- Mobile-responsive website
- Simplified checkout for mobile
- GCash/Maya payment integration (critical for PH market)

**What Works:**
- Local payment methods (GCash, Maya)
- Philippine-specific event coverage
- Trusted local brand
- Resale functionality

**What Doesn't:**
- Dated UI design
- No dark theme
- Limited social features
- Basic filtering compared to global competitors

---

### 9. Saks Fifth Avenue
**URL:** https://www.saks.com  
**Category:** Premium Luxury E-Commerce

**Visual Style:**
- Recently redesigned (2024-2025) with Pentagram identity
- Black square logo with cursive wordmark — iconic and heritage-rich
- Clean, spacious layouts with large hero imagery
- Black/white/gold palette with seasonal accent colors
- Editorial magazine feel with fashion photography
- AI-powered personalization ("digital concierge")

**Key UX Patterns:**
- Personalized homepage based on real-time intent data
- "Saks Live" — livestream shopping
- Curated editorial content alongside product
- Seamless cross-device experience
- Premium packaging and unboxing experience (digital equivalent: premium micro-interactions)
- Client services integration (personal shoppers)

**Mobile Approach:**
- Fully responsive with luxury feel maintained
- Mobile-first personalization
- App-like transitions on web
- One-tap purchase with stored preferences

**What Works:**
- Sets the standard for digital luxury experience
- Personalization at scale
- Heritage + innovation balance
- Editorial content drives desire

**What Doesn't:**
- High production values may not translate to smaller platforms
- Luxury pricing excludes mass market

---

### 10. OpenTable
**URL:** https://www.opentable.com  
**Category:** Restaurant Reservation Platform

**Visual Style:**
- Clean, accessible design with green brand accent (#2d8659)
- Photography-forward with restaurant ambiance shots
- Card-based layouts with clear information hierarchy
- Light theme with good contrast ratios
- "Find your table for any occasion" — occasion-based browsing

**Key UX Patterns:**
- Powerful search: location + date + time + party size
- Instant confirmation (no waiting)
- Restaurant profiles with reviews, photos, menus
- Points/loyalty program integration
- Collection browsing (outdoor seating, date night, etc.)
- Embeddable reservation widget for restaurant websites

**Mobile Approach:**
- Native apps with full feature parity
- Location-based discovery
- Apple Pay / Google Pay
- Push notifications for reminders

**What Works:**
- Instant gratification (immediate confirmation)
- Massive restaurant inventory
- Reliable, consistent UX
- Strong SEO and direct traffic

**What Doesn't:**
- No dark theme
- Generic — no premium tier or curation
- Limited group booking features

---

## Key UX Patterns Discovered

### 1. Discovery Mechanisms
| Pattern | Used By | Effectiveness |
|---------|---------|---------------|
| Artist/Follower Graph | Dice, Songkick | High — personal investment |
| Map-Based Discovery | Resy, OpenTable | High — location-relevant |
| Editorial Curation | Resident Advisor, Saks | High — trust & quality |
| Algorithmic Feed | Dice, Eventbrite | Medium — engagement vs. filter bubble |
| Category Browsing | Eventbrite, Ticketnation | Medium — comprehensive but overwhelming |
| Calendar View | Resident Advisor | Medium — good for planning |

### 2. Booking/Reservation Flows
| Pattern | Platform | Key Insight |
|---------|----------|-------------|
| 3-Tap Purchase | Dice | Minimize steps, maximize conversion |
| Instant Confirmation | OpenTable | Eliminate anxiety, drive rebooking |
| Waitlist + SMS | TablesReady | No app download = higher adoption |
| Seat Map Selection | Ticketmaster | Visualization reduces decision friction |
| Saved Preferences | Resy, SevenRooms | Data-driven personalization |

### 3. Event Card Design
- **Image-first** is universal — event artwork/photography is the primary visual hook
- **Key info hierarchy:** Image → Title → Date → Venue → Price → CTA
- **Social proof** (friends going, attendee count) increases click-through
- **Urgency indicators** (selling fast, limited tickets) drive action
- **Price transparency** builds trust (Dice's "no surprises" approach)

### 4. Venue/Club Pages
- **Photo galleries** are critical — patrons want to "feel" the venue before visiting
- **Bottle service / VIP packages** should be prominently displayed with clear pricing
- **Operating hours and dress code** information reduces pre-visit anxiety
- **Map integration** is expected — especially for tourists/new residents

---

## Common Design Trends

### Dark Theme Execution
1. **True dark, not gray:** Platforms like Dice and RA use near-black (#0A0A0A - #111111) rather than dark gray, creating more dramatic contrast with vibrant imagery
2. **Elevated surfaces:** Cards and modals use slightly lighter dark tones (#1A1A1A, #222222) to create depth hierarchy without borders
3. **Desaturated accent colors:** In dark mode, neon/saturated accents are used sparingly to avoid eye strain while maintaining brand energy
4. **Image-forward design:** Dark backgrounds make photography "pop" — critical for nightlife where atmosphere is the product
5. **WCAG compliance:** Text must maintain 4.5:1 contrast ratio. Pure white (#FFF) on near-black works; colored text requires careful testing

### Typography Trends
- **Display/Serif for headlines:** Creates editorial, premium feel (Resy, Saks, RA)
- **Geometric sans-serif for body:** Clean, modern, readable at small sizes
- **Large type scales:** Hero text 48px+ on desktop, 28px+ on mobile
- **Tight letter-spacing on headlines:** Feels contemporary and premium

### Motion & Interaction
- **Micro-animations on scroll:** Subtle fade-ups, parallax on hero images
- **Card hover states:** Scale + shadow increase on hover (desktop)
- **Page transitions:** Slide or fade transitions between views
- **Loading states:** Skeleton screens rather than spinners
- **Confetti/celebration animations:** Post-purchase delight moment

### Content Patterns
- **Editorial + commerce hybrid:** Content drives discovery, commerce drives revenue
- **User-generated content:** Reviews, photos, attendee counts build trust
- **Curated over comprehensive:** Quality curation beats exhaustive listings for premium positioning
- **Social integration:** "Friends going" and share-to-story functionality

---

## Mobile Best Practices

### Navigation Architecture
```
Recommended Bottom Tab Bar (5 items):
┌─────────────────────────────────────────┐
│  🔍 Discover  │  📍 Venues  │  🎫 My Tickets  │  ⭐ Saved  │  👤 Profile  │
└─────────────────────────────────────────┘
```

**Key principles:**
- **Bottom tab bar** for 4-5 primary destinations (thumb-reach zone)
- **Search always accessible** — either as a tab or persistent top bar
- **No hamburger menus for primary navigation** — only for secondary actions
- **Active state clearly indicated** — color + icon fill change

### Mobile Event Browsing
- **Full-bleed hero cards** with overlay text (image-first)
- **Horizontal scroll** for featured/trending events (snap-to-card)
- **Sticky filters** at top (date, location, genre)
- **Infinite scroll** with skeleton loading (vs. pagination)
- **Pull-to-refresh** for real-time availability

### Mobile Booking Flow
- **Maximum 3 steps:** Select → Confirm → Done
- **Sticky CTA button** at bottom of screen (always visible)
- **Digital wallet support** (Apple Pay, Google Pay, GCash via Maya)
- **One-handed operation** — primary actions in bottom 1/3 of screen
- **Guest checkout option** — don't force account creation

### Mobile-Specific Considerations for Philippines Market
- **Optimized for slower connections:** Lazy loading, compressed images, offline capability for saved tickets
- **SMS-based notifications:** More reliable than push notifications in PH market
- **GCash/Maya integration:** Essential for local payment preferences
- **Data saver mode:** Option to reduce image quality for users on limited data plans

---

## Conversion Best Practices

### The Booking Funnel
```
Awareness → Interest → Intent → Purchase → Post-Purchase
   ↓           ↓         ↓          ↓            ↓
  Social    Event     Ticket    Confirmation   Share +
  + SEO     Page      Selection + Payment     Rebook
```

### Proven Conversion Tactics

1. **Price Transparency Upfront**
   - Dice's "see the full price immediately" approach
   - Eliminates checkout abandonment from surprise fees
   - For VIP tables: show bottle service minimums clearly

2. **Social Proof Placement**
   - "47 friends going to this event" (Dice)
   - "200+ sold in the last hour" (urgency + validation)
   - Attendee photos from past events

3. **Scarcity & Urgency (Ethical)**
   - "Only 3 tables remaining" — if true
   - "Early bird pricing ends Friday" — clear deadline
   - Countdown timers for ticket releases

4. **Friction Reduction**
   - Guest checkout (no forced registration)
   - One-tap rebook for returning venues
   - Saved payment methods
   - Auto-fill for returning users

5. **Post-Purchase Delight**
   - Animated confirmation with shareable story content
   - Calendar integration (.ics download)
   - Pre-event reminders with weather + dress code
   - Post-event "rate your experience" + venue loyalty points

6. **A/B Testing Priorities**
   - CTA button text ("Book Now" vs. "Reserve Table" vs. "Get Tickets")
   - Event card layout (image-only vs. image + details)
   - Price display format (total vs. per-person)
   - Social proof placement and format

### Conversion Benchmarks (Industry)
| Metric | Target |
|--------|--------|
| Event page → Add to cart | 15-25% |
| Cart → Purchase | 60-75% |
| Mobile conversion rate | Within 80% of desktop |
| Checkout abandonment | < 30% |
| Return visitor rate | > 40% |

---

## Recommendations for GUESTLIST

### Positioning
GUESTLIST should position itself as **"The VIP Nightlife Platform for Manila"** — combining the editorial authority of Resident Advisor, the frictionless booking of Dice, and the premium hospitality of SevenRooms, localized for the Philippine market.

### Design Direction

#### Color Palette
```css
/* Primary Dark Surface */
--bg-primary: #0A0A0A;      /* Near-black background */
--bg-surface: #141414;      /* Elevated surfaces */
--bg-elevated: #1E1E1E;     /* Cards, modals */
--bg-hover: #2A2A2A;        /* Interactive hover */

/* Text */
--text-primary: #FFFFFF;    /* Headlines */
--text-secondary: #B0B0B0;  /* Body text */
--text-tertiary: #666666;   /* Metadata, timestamps */

/* Accent — choose ONE primary */
--accent-primary: #C8A97E;  /* Gold — luxury, premium, VIP */
--accent-secondary: #E91E63; /* Magenta — energy, nightlife */
--accent-success: #4CAF50;   /* Green — confirmation, available */

/* Gradients for hero overlays */
--gradient-hero: linear-gradient(to top, #0A0A0A 0%, transparent 100%);
```

#### Typography
```css
/* Option A: Modern Luxury */
--font-display: 'Playfair Display', serif;  /* Headlines */
--font-body: 'Inter', sans-serif;           /* UI, body */

/* Option B: Contemporary Nightlife */
--font-display: 'Syne', sans-serif;         /* Bold headlines */
--font-body: 'DM Sans', sans-serif;         /* Clean body */
```

#### Spacing System
```css
/* 8px base unit */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
--space-16: 64px;
```

### Recommended Page Structure

#### Homepage
```
┌─────────────────────────────────────┐
│ 🔍 Search events, venues, artists   │  ← Sticky search
├─────────────────────────────────────┤
│ [Hero: Featured Event / Promotion]  │  ← Auto-rotating
├─────────────────────────────────────┤
│ 🔥 Trending Tonight          See All │
│ [Card] [Card] [Card] [Card]         │  ← Horizontal scroll
├─────────────────────────────────────┤
│ 📍 Venues Near You           Map    │
│ [Card] [Card] [Card]                │
├─────────────────────────────────────┤
│ 📅 This Weekend               All    │
│ [Card] [Card] [Card]                │
├─────────────────────────────────────┤
│ ⭐ VIP Tables Available             │
│ [Card] [Card] [Card]                │  ← Premium section
└─────────────────────────────────────┘
```

#### Event Detail Page
```
┌─────────────────────────────────────┐
│ [←]              [Share] [Save]     │
├─────────────────────────────────────┤
│                                     │
│        [Full-bleed Hero Image]      │
│                                     │
│  Event Title                        │
│  📍 Venue Name · 📅 Date · 🕐 Time  │
│  👥 234 going · ⭐ 4.8 rating       │
│                                     │
├─────────────────────────────────────┤
│  🎫 Tickets    🍾 VIP Tables        │  ← Tab switcher
│  ─────────────────────────────────  │
│  [Ticket Type 1]  ₱1,500  [Select] │
│  [Ticket Type 2]  ₱2,500  [Select] │
│  [VIP Package]    ₱15,000 [Select]  │
│                                     │
├─────────────────────────────────────┤
│  [     BOOK NOW / GET TICKETS     ] │  ← Sticky CTA
└─────────────────────────────────────┘
```

### Key Differentiators to Build

1. **Venue Live Status**
   - Real-time crowd level (Quiet / Lively / Packed)
   - Current DJ / performer info
   - Estimated wait time at door
   - *Source: TablesReady-style integration*

2. **VIP Table Booking with Visualization**
   - Interactive venue floor plan
   - Table location and view preview
   - Bottle package transparency (what's included)
   - Group size recommendation

3. **Social Planning Layer**
   - "Going" status visible to friends
   - Group table booking (split payment)
   - In-app coordination for group nights out
   - Share to Instagram Stories with branded template

4. **Manila-Specific Features**
   - Traffic-aware venue suggestions (via Google Maps API)
   - Weather integration (indoor vs. outdoor recommendations)
   - "Safe ride home" integration (Grab partnership)
   - Tagaytay / Batangas weekend trip packages
   - Multi-language support (English + Filipino)

5. **Loyalty & Rewards**
   - Points per visit/booking
   - Tiered access (Silver → Gold → Platinum)
   - Birthday perks and anniversary rewards
   - Early access to ticket sales

### Technical Recommendations

- **Framework:** Next.js (App Router) — SSR for SEO, ISR for event listings
- **Styling:** Tailwind CSS with custom design tokens
- **Animation:** Framer Motion for page transitions and micro-interactions
- **Maps:** Mapbox GL JS (custom dark style for brand consistency)
- **Payments:** GCash, Maya (PH-specific), credit/debit cards via Stripe
- **Notifications:** SMS via Twilio (primary), Push (secondary), Email (tertiary)
- **Analytics:** Mixpanel or Amplitude for event-level tracking
- **Performance:** Target < 3s LCP, < 100ms interaction response

---

## Philippines / NCR Nightlife Context

### Market Characteristics
- **Primary nightlife zones:** BGC (Taguig), Poblacion (Makati), Ortigas (Pasig/Mandaluyong)
- **Peak nights:** Thursday through Saturday, with growing Wednesday and Sunday scenes
- **Demographics:** 21-35 age bracket, heavy social media users, price-conscious but experience-driven
- **Payment preferences:** GCash (dominant), Maya (growing), cash-on-delivery still relevant for some
- **Mobile-first market:** 98% of internet users access via mobile; desktop is secondary

### Competitive Landscape
| Platform | Strength | Weakness |
|----------|----------|----------|
| Ticketnation.ph | Local events, PH payments | Dated UI, no dark theme |
| Eventbrite PH | Global platform, trusted | Not nightlife-focused, no curation |
| Social media (FB/IG) | Where people discover events | No integrated booking |
| Venue direct (websites) | Full margin retention | Fragmented, poor UX |

### Cultural Design Considerations
- **"Fiesta" culture:** Filipinos celebrate frequently — position GUESTLIST for weekly use, not just special occasions
- **Group-oriented:** Nightlife is social — group booking and split payment are essential
- **Selfie culture:** Venues with Instagram-worthy interiors are heavily promoted — integrate photo sharing
- **"Libre" culture:** Treats/birthdays are generous — birthday perks and group packages resonate
- **Traffic awareness:** Manila traffic is a major consideration — location-aware suggestions with travel time estimates

### Regulatory Notes
- **Age verification:** Nightlife venues are 18+ or 21+ — age verification flow needed
- **LGU permits:** Different cities have different event/noise ordinances — event availability may vary by date
- **Data privacy:** Philippines has the Data Privacy Act of 2012 (RA 10173) — compliance required

---

## Appendix: Research Sources

| # | Platform | URL | Category |
|---|----------|-----|----------|
| 1 | Dice | https://dice.fm | Ticketing / Discovery |
| 2 | Resident Advisor | https://ra.co | Music Events |
| 3 | TablesReady | https://tablesready.com | Nightclub Waitlist |
| 4 | Resy | https://resy.com | Restaurant Reservations |
| 5 | Eventbrite | https://eventbrite.com | Event Discovery |
| 6 | SevenRooms | https://sevenrooms.com | Hospitality CRM |
| 7 | Ticketmaster | https://ticketmaster.com | Large-Scale Ticketing |
| 8 | Ticketnation PH | https://ticketnation.ph | Local PH Ticketing |
| 9 | Saks Fifth Avenue | https://saks.com | Luxury E-Commerce |
| 10 | OpenTable | https://opentable.com | Restaurant Reservations |
| 11 | Songkick | https://songkick.com | Concert Discovery |
| 12 | Nordstrom | https://nordstrom.com | Premium Retail |
| 13 | Meetup | https://meetup.com | Community Events |
| 14 | See Tickets | https://seetickets.com | UK Ticketing |
| 15 | Instrument (Eventbrite redesign) | https://instrument.com/work/eventbrite-app | Design Case Study |

---

*Report compiled June 2026. All platform observations based on publicly available web interfaces. Design recommendations are directional — validate with user testing before implementation.*
