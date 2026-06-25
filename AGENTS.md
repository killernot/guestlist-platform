<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Development Policy — Guestlist Platform

### Mandatory Deployment Gate

**Production schema MUST match the deployed Prisma schema before a feature can be marked Done.**

Every feature that modifies `prisma/schema.prisma` must:

1. Include migration SQL files in `prisma/migrations/`
2. Document the migration in the feature's completion report
3. Provide verification that the migration was applied to production
4. Confirm no API returns 500 due to schema mismatch

### Migration Rules

- **Never expose migrations through HTTP endpoints** — no `/api/migrate`, no programmatic migration routes
- **Never use `prisma db push` in production** — always use `prisma migrate deploy`
- **Always test migrations locally** before deploying to production
- **One migration per deployment** — apply sequentially, verify between each
- **Back up before migrating** — Neon provides point-in-time recovery

### Production Migration Workflow

1. Push to GitHub → Vercel auto-deploys
2. Apply migrations via Neon SQL Editor or `DATABASE_URL=... npx prisma migrate deploy`
3. Verify: `npx prisma migrate status` shows "Database schema is up to date"
4. Verify: All affected API routes return 200
5. Mark feature as Done

### Quality Gates

Before marking any feature complete:
- ✅ `npm run build` passes
- ✅ `npm test` passes (all tests green)
- ✅ TypeScript passes (`npx tsc --noEmit`)
- ✅ Production database schema matches Prisma schema
- ✅ No API returns 500 due to schema mismatch
- ✅ No temporary endpoints remain deployed
- ✅ Migration files committed to `prisma/migrations/`
