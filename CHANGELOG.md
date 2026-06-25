# Changelog

All notable changes to the Guestlist Platform will be documented in this file.

## [v1.0.0] — 2026-06-25

### Added
- **Public Event Browsing** — Event listing with search, date filters, responsive grid
- **Reservation System** — Full guest reservation flow with capacity enforcement
- **QR Check-in** — Token-based QR generation and verification endpoints
- **Admin Dashboard** — Reservation management with status workflow
- **Event CRUD** — Create, read, update, delete events via admin panel
- **Google Sheets Sync** — Automatic reservation append with 5-retry logic
- **Venue Analytics** — Attendance, reservation trends, conversion metrics
- **Health Endpoint** — `/api/health` with DB connectivity check

### Security
- NextAuth credential-based admin authentication (JWT, 24h sessions)
- Route protection middleware (`/admin`, `/checkin`, `/api/reservations`)
- Security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy)
- Rate limiting (auth: 5/min, register: 3/min, mutation: 10/min, public: 60/min)
- Host header validation (prevents host injection attacks)
- CSRF origin validation on mutation requests

### Infrastructure
- GitHub Actions CI pipeline
- Vercel automatic deployment from master
- Docker multi-stage production build
- PostgreSQL/Neon with Prisma ORM
- Comprehensive test suite (130 tests, 9 files)

### Known Limitations
- No email confirmations
- Scanner camera not functional
- Admin search non-functional
- Security middleware (`proxy.ts`) not wired as Next.js middleware
- No viewport meta on guest pages

### Deployment Details
- **Commit:** `a8278b3`
- **URL:** https://guestlist-platform.vercel.app
- **Build:** Turbopack, 20s
- **Tests:** 130/130 passing
