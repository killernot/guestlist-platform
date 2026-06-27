/**
 * Database pre-flight check for Vercel build.
 * Runs migrate status and outputs the current state.
 * Does NOT modify the database.
 */
const { execSync } = require('child_process');

try {
  console.log('=== Database Migration Status ===');
  const status = execSync('npx prisma migrate status 2>&1', {
    encoding: 'utf8',
    env: process.env,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  console.log(status);
  
  // Check if there are failed migrations
  if (status.includes('failed') || status.includes('P3009')) {
    console.log('\n=== FAILED MIGRATIONS DETECTED ===');
    
    // Try to get more detail
    try {
      const resolve = execSync('npx prisma migrate resolve --help 2>&1', {
        encoding: 'utf8',
        env: process.env,
      });
      console.log('Available recovery commands:');
      console.log(resolve.split('\n').slice(0, 10).join('\n'));
    } catch (e) {
      // ignore
    }
    
    // Don't fail the build — just warn
    console.log('\n⚠️  Failed migrations detected. Database may need recovery.');
    console.log('See DATABASE_RECOVERY.md for instructions.');
  }
} catch (e) {
  console.log('Note: Could not check migration status:', e.message?.split('\n')[0]);
}
