# Production Migration Guide

## Overview

This project uses Prisma Migrate with PostgreSQL (Neon). All schema changes are version-controlled in `prisma/migrations/`.

## Standard Migration Workflow

### Local Development

```bash
# After pulling schema changes
npx prisma migrate dev --name descriptive_name

# Generate client
npx prisma generate
```

### Production Deployment

**Option A: Neon SQL Editor (Recommended for production)**

1. Log into https://neon.tech
2. Navigate to the SQL Editor
3. Connect to the `guestlist` database
4. Paste the migration SQL from `prisma/migrations/<timestamp>_<name>/migration.sql`
5. Execute
6. Verify: `SELECT * FROM "_prisma_migrations";`

**Option B: Vercel CLI (if DATABASE_URL is available)**

```bash
# Set DATABASE_URL temporarily for migration
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

**Option C: Docker (self-hosted)**

```bash
docker compose exec app npx prisma migrate deploy
```

## Current Pending Migrations

| Migration | File | Changes |
|-----------|------|---------|
| `20260625000000_add_event_fields` | `prisma/migrations/20260625000000_add_event_fields/migration.sql` | Adds slug, status, address, startTime, endTime, minAge, dressCode, genres, djLineup, coverImage, galleryImages + EventStatus enum |
| `20260625000001_add_sheets_relation` | `prisma/migrations/20260625000001_add_sheets_relation/migration.sql` | Adds FK relation to google_sheets_mappings |

## Post-Migration Verification

```bash
# Verify schema
npx prisma db execute --stdin <<'EOF'
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'events' ORDER BY ordinal_position;
EOF

# Verify migration applied
npx prisma migrate status
```

## Rollback Procedure

```bash
# Revert last migration
npx prisma migrate resolve --rolled-back "<migration_name>"

# Re-apply
npx prisma migrate deploy
```

## Safety Rules

1. **Always back up before migrating** — Neon provides point-in-time recovery
2. **Never use `prisma db push` in production** — always use `migrate deploy`
3. **Never expose migration endpoints** — migrations must be run via CLI or SQL editor
4. **Test migrations locally first** — use a local PostgreSQL instance
5. **One migration per deployment** — apply sequentially, verify between each
