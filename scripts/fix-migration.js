/**
 * Migration recovery script for Vercel build environment.
 * Fixes the broken migration state in production.
 * Safe to run multiple times (idempotent).
 */
const { execSync } = require('child_process');

function run(cmd, input) {
  console.log(`\n> ${cmd}`);
  try {
    const output = execSync(cmd, {
      encoding: 'utf8',
      env: process.env,
      input: input,
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 30000,
    });
    console.log(output);
    return { success: true, output };
  } catch (e) {
    if (e.stdout) console.log(e.stdout);
    if (e.stderr) console.error(e.stderr.split('\n').slice(0, 5).join('\n'));
    return { success: false, error: e };
  }
}

async function main() {
  console.log('=== Migration Recovery ===');
  
  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL not set, skipping.');
    process.exit(0);
  }

  // Step 1: Check if google_sheets_mappings table exists
  console.log('\n--- Checking if google_sheets_mappings exists ---');
  const check = run(
    'npx prisma db execute --stdin',
    `SELECT table_name FROM information_schema.tables WHERE table_name = 'google_sheets_mappings' AND table_schema = 'public';`
  );
  
  const tableExists = check.output?.includes('google_sheets_mappings');

  if (!tableExists) {
    console.log('\n--- Creating google_sheets_mappings table (WITHOUT FK, migration 3 will add it) ---');
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
      console.error('Failed to create table:', create.error?.message?.split('\n')[0]);
      process.exit(1);
    }
    console.log('✅ Table created successfully (without FK constraint)');
  } else {
    console.log('✅ Table already exists');
  }

  // Step 2: Mark the failed migration as rolled back
  console.log('\n--- Resolving failed migration ---');
  run('npx prisma migrate resolve --rolled-back 20260625000001_add_sheets_relation 2>&1');

  // Step 3: Deploy all pending migrations
  console.log('\n--- Deploying migrations ---');
  const deploy = run('npx prisma migrate deploy 2>&1');
  
  if (deploy.success && !deploy.output?.includes('Error')) {
    console.log('\n✅ All migrations deployed successfully!');
  } else {
    console.log('\n⚠️  Migration deploy had issues. Checking status...');
  }

  // Step 4: Verify final status
  console.log('\n--- Final status ---');
  run('npx prisma migrate status 2>&1');
}

main();
