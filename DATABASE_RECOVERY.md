# Database Recovery Guide

**Date:** 2026-06-27
**Database:** PostgreSQL (Neon) — `neondb`
**Host:** `ep-young-mouse-aoriqxi6-pooler.c-2.ap-southeast-1.aws.neon.tech`

---

## Root Cause

Migration `20260625000001_add_sheets_relation` is marked as "started" in `_prisma_migrations` but failed because the `google_sheets_mappings` table does not exist in the production database.

The `google_sheets_mappings` table is defined in `prisma/schema.prisma` but has **no dedicated migration file** in `prisma/migrations/`. Migration #3 only adds a foreign key constraint — it assumes the table already exists.

This is a migration history gap: the table was either never created, or was created manually and later dropped.

---

## Current Production State

### Migrations Applied

| Migration | Status | Notes |
|-----------|--------|-------|
| `20260619000000_init` | ✅ Applied | Base tables created |
| `20260625000000_add_event_fields` | ✅ Applied | Event columns added |
| `20260625000001_add_sheets_relation` | ❌ Failed | Missing table |
| `20260627000000_add_event_createdAt` | ⏸️ Pending | Blocked by #3 |

### Tables That Exist

- `events` — has columns from migration #2 (slug, status, etc.)
- `reservations` — complete
- `admin_users` — complete
- `_prisma_migrations` — migration history

### Tables Missing

- `google_sheets_mappings` — defined in schema, never created

---

## Expected Final Schema

Based on `prisma/schema.prisma`, the `google_sheets_mappings` table should have:

```sql
CREATE TABLE "google_sheets_mappings" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "spreadsheetId" TEXT NOT NULL,
    "sheetUrl" TEXT NOT NULL,
    "sheetTitle" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "google_sheets_mappings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "google_sheets_mappings_eventId_key" ON "google_sheets_mappings"("eventId");

ALTER TABLE "google_sheets_mappings" ADD CONSTRAINT "google_sheets_mappings_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

Additionally, `events` should have:
```sql
ALTER TABLE "events" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
```

---

## Recovery Steps

### Option A: Prisma-Native Recovery (Preferred)

This approach uses Prisma's built-in commands to handle the recovery.

```bash
# 1. Set DATABASE_URL (get from Neon dashboard or Vercel env)
export DATABASE_URL="postgresql://user:***@ep-young-mouse-aoriqxi6-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# 2. Mark the failed migration as rolled back
npx prisma migrate resolve --rolled-back 20260625000001_add_sheets_relation

# 3. Create the missing table manually
# Connect to the database and run:
```

```sql
CREATE TABLE IF NOT EXISTS "google_sheets_mappings" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "spreadsheetId" TEXT NOT NULL,
    "sheetUrl" TEXT NOT NULL,
    "sheetTitle" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "google_sheets_mappings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "google_sheets_mappings_eventId_key" ON "google_sheets_mappings"("eventId");
```

```bash
# 4. Now deploy remaining migrations (3 and 4)
npx prisma migrate deploy

# 5. Verify
npx prisma migrate status
```

### Option B: Manual SQL Recovery (If Option A fails)

```bash
# 1. Connect to production database
# 2. Run the complete recovery script:
```

```sql
-- Step 1: Create the missing table
CREATE TABLE IF NOT EXISTS "google_sheets_mappings" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "spreadsheetId" TEXT NOT NULL,
    "sheetUrl" TEXT NOT NULL,
    "sheetTitle" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "google_sheets_mappings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "google_sheets_mappings_eventId_key" ON "google_sheets_mappings"("eventId");

-- Step 2: Add the foreign key (this is what migration 3 was supposed to do)
ALTER TABLE "google_sheets_mappings" ADD CONSTRAINT "google_sheets_mappings_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 3: Mark migration 3 as applied
UPDATE "_prisma_migrations"
SET "finished_at" = NOW(),
    "applied_steps_count" = 1,
    "logs" = NULL,
    "rolled_back_at" = NULL
WHERE "migration_name" = '20260625000001_add_sheets_relation';

-- Step 4: Add createdAt column to events (migration 4)
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Step 5: Mark migration 4 as applied
INSERT INTO "_prisma_migrations" (
    "id", "checksum", "migration_name", "started_at", "finished_at", "applied_steps_count", "logs", "rolled_back_at"
) VALUES (
    '2026-06-27-000000',
    'checksum-from-prisma-migrations-table',
    '20260627000000_add_event_createdAt',
    NOW(), NOW(), 1, NULL, NULL
);
```

**Note:** For Option B step 5, the checksum can be obtained from:
```bash
npx prisma migrate resolve --help
# Or copy from a fresh project's _prisma_migrations table
```

---

## Verification Checklist

After recovery, verify all of the following:

```bash
# 1. Migration status — all migrations should be "Applied"
npx prisma migrate status

# 2. Schema matches Prisma
npx prisma db execute --stdin <<'EOF'
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
EOF

# 3. Verify specific objects exist
npx prisma db execute --stdin <<'EOF'
-- Event.slug column
SELECT column_name FROM information_schema.columns
WHERE table_name = 'events' AND column_name = 'slug';

-- Event.createdAt column
SELECT column_name FROM information_schema.columns
WHERE table_name = 'events' AND column_name = 'createdAt';

-- google_sheets_mappings table
SELECT table_name FROM information_schema.tables
WHERE table_name = 'google_sheets_mappings';

-- Foreign keys
SELECT constraint_name FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY' AND table_name = 'google_sheets_mappings';

-- Indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'google_sheets_mappings';
EOF
```

### Expected Results

| Object | Type | Expected |
|--------|------|----------|
| `events.slug` | Column | ✅ `text` |
| `events.slug` | Unique Index | ✅ `events_slug_key` |
| `events.createdAt` | Column | ✅ `timestamp(3)` |
| `google_sheets_mappings` | Table | ✅ Exists |
| `google_sheets_mappings.eventId` | Unique Index | ✅ |
| `google_sheets_mappings.eventId` | Foreign Key | → `events.id` |
| `_prisma_migrations` | All 4 rows | ✅ All `finished_at` set |

---

## Rollback Plan

If recovery fails:

```sql
-- Undo migration 4
ALTER TABLE "events" DROP COLUMN IF EXISTS "createdAt";

-- Undo migration 3 (FK constraint)
ALTER TABLE "google_sheets_mappings" DROP CONSTRAINT IF EXISTS "google_sheets_mappings_eventId_fkey";

-- Undo migration 3 (table)
DROP TABLE IF EXISTS "google_sheets_mappings";

-- Clean up migration history
DELETE FROM "_prisma_migrations" WHERE "migration_name" IN (
  '20260625000001_add_sheets_relation',
  '20260627000000_add_event_createdAt'
);
```

After rollback, the application will work with the compatibility fallbacks in `lib/events.ts`.

---

## Connection Instructions

### Getting DATABASE_URL

The DATABASE_URL is encrypted in Vercel as a `sensitive` environment variable. To obtain it:

1. **Neon Dashboard** (preferred):
   - Visit https://console.neon.tech
   - Navigate to project `risingdead12-4363s-projects`
   - Database: `neondb`
   - Copy connection string from dashboard

2. **Vercel CLI** (limited — sensitive values not returned):
   ```bash
   npx vercel env pull .env --environment=production --yes
   # Note: DATABASE_URL will be empty (encrypted)
   ```

3. **Direct from build logs**:
   The host is visible: `ep-young-mouse-aoriqxi6-pooler.c-2.ap-southeast-1.aws.neon.tech`
   Format: `postgresql://<user>:<password>@ep-young-mouse-aoriqxi6-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`

### Connecting

```bash
# With psql
psql "postgresql://<user>:<password>@ep-young-mouse-aoriqxi6-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# With Prisma
export DATABASE_URL="postgresql://<user>:<password>@ep-young-mouse-aoriqxi6-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
npx prisma migrate status
```

---

## Post-Recovery Validation

After successful recovery:

1. **Redeploy to Vercel:**
   ```bash
   git add -A && git commit -m "fix: database migration applied" && git push
   npx vercel deploy --prod --yes
   ```

2. **Verify production endpoints:**
   ```bash
   curl -s https://guestlist-platform.vercel.app/api/events | head -c 200
   curl -s https://guestlist-platform.vercel.app/api/stats
   ```

3. **Remove compatibility fallbacks** (optional, after confirming stability):
   - Remove try/catch blocks in `lib/events.ts` `getEventList` and `getEventBySlug`
   - These are harmless but unnecessary once the migration is applied

---

## Lessons Learned

1. **Always create migration files for every schema change.** The `google_sheets_mappings` table was added to the schema but no migration was created to match it.

2. **Test migrations in a staging environment** before deploying to production.

3. **Use `prisma migrate diff`** to compare schema against database and catch gaps early.

4. **Add a CI check** that runs `prisma migrate status` to ensure all migrations are applied.

---

**Prepared by:** Hermes (Release Engineer)
**Date:** 2026-06-27
