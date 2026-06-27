/**
 * Migration recovery script using Prisma client directly.
 * Fixes the broken migration state in production.
 * Safe to run multiple times (idempotent).
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function run() {
  console.log('=== Migration Recovery ===');

  // Step 1: Check if google_sheets_mappings table exists
  console.log('\n--- Step 1: Check table ---');
  const tableCheck = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables 
    WHERE table_name = 'google_sheets_mappings' AND table_schema = 'public'
  `;
  const tableExists = Array.isArray(tableCheck) && tableCheck.length > 0;
  console.log('Table exists:', tableExists);

  if (!tableExists) {
    console.log('\n--- Creating google_sheets_mappings table (WITHOUT FK) ---');
    await prisma.$executeRaw`
      CREATE TABLE "google_sheets_mappings" (
        "id" TEXT NOT NULL,
        "eventId" TEXT NOT NULL,
        "spreadsheetId" TEXT NOT NULL,
        "sheetUrl" TEXT NOT NULL,
        "sheetTitle" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "google_sheets_mappings_pkey" PRIMARY KEY ("id")
      )
    `;
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX "google_sheets_mappings_eventId_key" ON "google_sheets_mappings"("eventId")
    `;
    console.log('✅ Table created');
  } else {
    console.log('✅ Table already exists');
  }

  // Step 2: Check if FK constraint exists
  console.log('\n--- Step 2: Check FK constraint ---');
  const fkCheck = await prisma.$queryRaw`
    SELECT constraint_name FROM information_schema.table_constraints 
    WHERE table_name = 'google_sheets_mappings' AND constraint_type = 'FOREIGN KEY'
  `;
  const fkExists = Array.isArray(fkCheck) && fkCheck.length > 0;
  console.log('FK exists:', fkExists);

  // Step 3: Check migration status
  console.log('\n--- Step 3: Check migration status ---');
  const migrations = await prisma.$queryRaw`
    SELECT migration_name, finished_at, rolled_back_at, applied_steps_count
    FROM _prisma_migrations
    ORDER BY started_at
  `;
  console.log(JSON.stringify(migrations, null, 2));

  // Step 4: Check if migration 3 is failed
  const migration3 = migrations.find(function(m) { return m.migration_name === '20260625000001_add_sheets_relation'; });
  const migration3Failed = migration3 && !migration3.finished_at && !migration3.rolled_back_at;
  const migration3NotApplied = !migration3;

  console.log('\nMigration 3 status:', {
    exists: !!migration3,
    failed: migration3Failed,
    notApplied: migration3NotApplied,
    finished: migration3?.finished_at,
    rolledBack: migration3?.rolled_back_at,
  });

  if (migration3Failed || migration3NotApplied) {
    console.log('\n--- Step 4: Fix migration 3 ---');
    
    if (migration3Failed) {
      // Mark as rolled back
      console.log('Marking migration 3 as rolled back...');
      await prisma.$executeRaw`
        UPDATE "_prisma_migrations" SET "rolled_back_at" = NOW()
        WHERE "migration_name" = '20260625000001_add_sheets_relation'
      `;
    }

    if (!fkExists) {
      // Add the FK constraint (this is what migration 3 does)
      console.log('Adding FK constraint...');
      await prisma.$executeRaw`
        ALTER TABLE "google_sheets_mappings" 
        ADD CONSTRAINT "google_sheets_mappings_eventId_fkey" 
        FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      `;
      console.log('✅ FK constraint added');
    }

    // Mark migration 3 as applied
    if (migration3NotApplied) {
      console.log('Recording migration 3 as applied...');
      await prisma.$executeRaw`
        INSERT INTO "_prisma_migrations" (id, checksum, migration_name, started_at, finished_at, applied_steps_count)
        VALUES (
          'c52e71b-0000-0000-0000-000000000001',
          'manual-recovery',
          '20260625000001_add_sheets_relation',
          NOW(), NOW(), 1
        )
      `;
    } else {
      console.log('Marking migration 3 as finished...');
      await prisma.$executeRaw`
        UPDATE "_prisma_migrations" 
        SET "finished_at" = NOW(), "rolled_back_at" = NULL, "applied_steps_count" = 1
        WHERE "migration_name" = '20260625000001_add_sheets_relation'
      `;
    }
    console.log('✅ Migration 3 resolved');
  }

  // Step 5: Check if migration 4 is applied
  const migration4 = migrations.find(function(m) { return m.migration_name === '20260627000000_add_event_createdAt'; });
  if (!migration4) {
    console.log('\n--- Step 5: Apply migration 4 (add createdAt) ---');
    await prisma.$executeRaw`
      ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    `;
    
    await prisma.$executeRaw`
      INSERT INTO "_prisma_migrations" (id, checksum, migration_name, started_at, finished_at, applied_steps_count)
      VALUES (
        'c52e71b-0000-0000-0000-000000000002',
        'manual-recovery',
        '20260627000000_add_event_createdAt',
        NOW(), NOW(), 1
      )
    `;
    console.log('✅ Migration 4 applied');
  } else if (!migration4.finished_at) {
    console.log('\n--- Step 5: Mark migration 4 as finished ---');
    await prisma.$executeRaw`
      UPDATE "_prisma_migrations" 
      SET "finished_at" = NOW(), "rolled_back_at" = NULL, "applied_steps_count" = 1
      WHERE "migration_name" = '20260627000000_add_event_createdAt'
    `;
    console.log('✅ Migration 4 marked as finished');
  } else {
    console.log('\n✅ Migration 4 already applied');
  }

  // Step 6: Verify final state
  console.log('\n--- Step 6: Final verification ---');
  const finalMigrations = await prisma.$queryRaw`
    SELECT migration_name, finished_at, rolled_back_at
    FROM _prisma_migrations
    ORDER BY started_at
  `;
  console.log('Migrations:', JSON.stringify(finalMigrations, null, 2));

  const columns = await prisma.$queryRaw`
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_name = 'events' AND column_schema = 'public'
    ORDER BY ordinal_position
  `;
  console.log('\nEvents table columns:', JSON.stringify(columns, null, 2));

  console.log('\n✅ Recovery complete!');
}

run()
  .catch((e) => {
    console.error('Recovery failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
