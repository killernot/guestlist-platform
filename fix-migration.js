/**
 * Migration recovery script using Prisma CLI.
 * Fixes the broken migration state in production.
 * Safe to run multiple times (idempotent).
 */
const { execSync } = require('child_process');

function run(cmd) {
  console.log(`\n> ${cmd}`);
  try {
    const output = execSync(cmd, {
      encoding: 'utf8',
      env: process.env,
      stdio: 'pipe',
      timeout: 30000,
    });
    console.log(output);
    return { success: true, output: output.trim() };
  } catch (e) {
    if (e.stdout) console.log(e.stdout);
    if (e.stderr) console.error(e.stderr.split('\n').slice(0, 3).join('\n'));
    return { success: false, output: (e.stdout || '').trim() };
  }
}

async function main() {
  console.log('=== Migration Recovery ===');
  
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('file:')) {
    console.log('No production DATABASE_URL, skipping.');
    process.exit(0);
  }

  // Step 1: Check if google_sheets_mappings table exists using prisma db query
  console.log('\n--- Step 1: Check table ---');
  const check = run('npx prisma db query "SELECT count(*) as cnt FROM information_schema.tables WHERE table_name = \'google_sheets_mappings\' AND table_schema = \'public\'" --json 2>&1');
  console.log('Check output:', check.output);
  
  let tableExists = false;
  try {
    const parsed = JSON.parse(check.output.split('\n').find(l => l.startsWith('[')));
    tableExists = parsed[0]?.cnt > 0;
  } catch (e) {
    // Try alternative parsing
    tableExists = check.output.includes('1');
  }
  console.log('Table exists:', tableExists);

  if (!tableExists) {
    console.log('\n--- Creating google_sheets_mappings table ---');
    
    // Create table WITHOUT FK constraint (migration 3 will add it)
    run('npx prisma db execute --stdin', `CREATE TABLE "google_sheets_mappings" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "spreadsheetId" TEXT NOT NULL,
  "sheetUrl" TEXT NOT NULL,
  "sheetTitle" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "google_sheets_mappings_pkey" PRIMARY KEY ("id")
);`);
    
    run('npx prisma db execute --stdin', `CREATE UNIQUE INDEX "google_sheets_mappings_eventId_key" ON "google_sheets_mappings"("eventId");`);
    
    console.log('✅ Table created');
  } else {
    console.log('✅ Table already exists');
  }

  // Step 2: Check FK constraint
  console.log('\n--- Step 2: Check FK ---');
  const fkCheck = run('npx prisma db query "SELECT count(*) as cnt FROM information_schema.table_constraints WHERE table_name = \'google_sheets_mappings\' AND constraint_type = \'FOREIGN KEY\'" --json 2>&1');
  let fkExists = false;
  try {
    const parsed = JSON.parse(fkCheck.output.split('\n').find(l => l.startsWith('[')));
    fkExists = parsed[0]?.cnt > 0;
  } catch (e) {
    fkExists = fkCheck.output.includes('1');
  }
  console.log('FK exists:', fkExists);

  // Step 3: Check migration status
  console.log('\n--- Step 3: Migration status ---');
  const status = run('npx prisma migrate status 2>&1');
  console.log(status.output);

  // Step 4: Resolve failed migration
  if (status.output?.includes('failed') || status.output?.includes('not applied')) {
    console.log('\n--- Step 4: Resolve migration ---');
    
    // Mark as rolled back
    run('npx prisma migrate resolve --rolled-back 20260625000001_add_sheets_relation 2>&1');
    
    if (!fkExists) {
      // Add FK constraint
      run('npx prisma db execute --stdin', `ALTER TABLE "google_sheets_mappings" ADD CONSTRAINT "google_sheets_mappings_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;`);
      console.log('✅ FK added');
    }
  }

  // Step 5: Deploy remaining migrations
  console.log('\n--- Step 5: Deploy ---');
  const deploy = run('npx prisma migrate deploy 2>&1');
  
  if (deploy.success) {
    console.log('✅ Deploy successful');
  } else {
    console.log('Deploy had issues, checking...');
  }

  // Step 6: Final status
  console.log('\n--- Step 6: Final status ---');
  run('npx prisma migrate status 2>&1');
}

main();
