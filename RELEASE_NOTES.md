# Release Notes — Guestlist Platform v1.0.0

**Release Date:** 2026-06-27
**Status:** Release Candidate

---

## What's New

### Frontend (6 Phases)

- **Complete visual redesign** — Dark nightlife aesthetic with neon-orange accents
- **Mobile-first layout** — Reservation form appears first on mobile
- **Live capacity bars** — Real-time guest count from approved reservations
- **Accessibility** — Skip-to-content, focus-visible, ARIA roles, reduced-motion
- **System states** — Branded 404, 500, error pages
- **Navigation** — Active route highlighting, mobile hamburger menu

### Backend (6 Phases)

- **Canonical slug routing** — Human-readable event URLs (`/events/friday-night-fever`)
- **Accurate capacity** — `SUM(guestCount)` instead of `COUNT(*)` for approved reservations
- **Centralized queries** — `lib/events.ts` eliminates duplicate logic
- **Query optimization** — No N+1, uses `_count` and `groupBy` aggregates
- **Consistent payloads** — Single `mapEvent()` mapper across all endpoints

### Auth Migration

- **Auth.js v5** — Compatible with Next.js 16 + Turbopack
- **Type-safe sessions** — Module augmentation for `role` field
- **Backward-compatible wrapper** — Minimal code changes across 16 files

---

## Breaking Changes

- **next-auth v4 → v5** — Auth import paths changed (see `AUTH_MIGRATION.md`)
- **Database schema** — Added `Event.slug`, `Event.createdAt` columns (additive, reversible)

---

## Known Limitations

- Homepage card links use UUID until frontend updated to use `slug` prop
- QR token not returned from register API (frontend supports it, backend doesn't generate)
- `node_modules` patch required for Turbopack compatibility (auto-applied via `patch-package`)

---

## Deployment

```bash
# Environment
DATABASE_URL=postgresql://...
AUTH_SECRET=<random-32-char-hex>

# Build
npm run build

# Production
npx prisma migrate deploy && npm run build && npm start
```

---

## Rollback

Full rollback instructions in `RELEASE_REPORT.md` → Rollback Plan section.

---

**Full documentation:** `RELEASE_REPORT.md`, `AUTH_MIGRATION.md`
