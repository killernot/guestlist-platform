/**
 * Migration recovery script for Vercel build environment.
 * Fixes the broken migration state in production.
 * Safe to run multiple times (idempotent).
 */
const { execSync } = require('child_process');

function run(cmd, input) {
  try {
    const output = execSync(cmd, {
      encoding: 'utf8',
      env: process.env,
      input: input,
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 30000,
    });
    return { success: true, output: output.trim() };
  } catch (e) {
    return { success: false, output: (e.stdout || '').trim(), error: e };
  }
}

async function main() {
  console.log('=== Migration Recovery ===');
  
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('file:')) {
    console.log('No production DATABASE_URL, skipping.');
    process.exit(0);
  }

  // Step 1: Check if google_sheets_mappings table exists
  console.log('\n--- Step 1: Check table ---');
  const check = run(
    'npx prisma db execute --stdin',
    `SELECT count(*) as cnt FROM information_schema.tables WHERE table_name = 'google_sheets_mappings' AND table_schema = 'public';`
  );
  console.log('Check result:', check.output);
  const tableExists = check.output && parseInt(check.output) > 0;
  console.log('Table exists:', tableExists);

  if (!tableExists) {
    console.log('\n--- Creating google_sheets_mappings table (WITHOUT FK) ---');
    const create = run(
      'npx prisma db execute --stdin',
      `CREATE TABLE "google_sheets_mappings" (
        "id" TEXT NOT NULL,
        "eventId" TEXT NOT NULL,
        "spreadsheetId" TEXT NOT NULL,
        "sheetUrl" TEXT NOT NULL,
        "sheetTitle" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "google_sheets_mappings_pkey" PRIMARY KEY ("id")
      );
      CREATE UNIQUE INDEX "google_sheets_mappings_eventId_key" ON "google_sheets_mappings"("eventId");`
    );
    
    if (!create.success) {
      console.error('Failed to create table:', create.output);
      process.exit(1);
    }
    console.log('✅ Table created');
  } else {
    console.log('✅ Table already exists');
  }

  // Step 2: Check if FK constraint exists
  console.log('\n--- Step 2: Check FK constraint ---');
  const fkCheck = run(
    'npx prisma db execute --stdin',
    `SELECT count(*) as cnt FROM information_schema.table_constraints 
     WHERE table_name = 'google_sheets_mappings' AND constraint_type = 'FOREIGN KEY';`
  );
  console.log('FK check result:', fkCheck.output);
  const fkExists = fkCheck.output && parseInt(fkCheck.output) > 0;
  console.log('FK exists:', fkExists);

  // Step 3: Check migration status
  console.log('\n--- Step 3: Check migration status ---');
  const status = run('npx prisma migrate status 2>&1');
  console.log(status.output);

  // Step 4: If migration 3 is failed, resolve it
  if (status.output?.includes('20260625000001_add_sheets_relation') && 
      (status.output?.includes('failed') || status.output?.includes('not applied'))) {
    console.log('\n--- Step 4: Resolve migration 3 ---');
    
    if (!fkExists) {
      // Table exists but no FK — mark migration 3 as rolled back so it re-runs
      run('npx prisma migrate resolve --rolled-back 20260625000001_add_sheets_relation 2>&1');
    } else {
      // FK already exists — migration 3 is effectively done, mark it as applied
      console.log('FK already exists, marking migration 3 as applied...');
      run(
        'npx prisma db execute --stdin',
        `UPDATE "_prisma_migrations" 
         SET "finished_at" = NOW(), "applied_steps_count" = 1, "rolled_back_at" = NULL, "logs" = NULL
         WHERE "migration_name" = '20260625000001_add_sheets_relation';`
      );
    }
  }

  // Step 5: Deploy remaining migrations
  console.log('\n--- Step 5: Deploy migrations ---');
  const deploy = run('npx prisma migrate deploy 2>&1');
  
  if (deploy.success && !deploy.output?.includes('Error')) {
    console.log('✅ Migrations deployed');
  } else {
    console.log('Deploy output:', deploy.output?.split('\n').slice(0, 5).join('\n'));
  }

  // Step 6: Final status
  console.log('\n--- Step 6: Final status ---');
  run('npx prisma migrate status 2>&1');
}

main();
