/**
 * Run the Supabase SQL migration.
 * Usage: node server/scripts/run-migration.js
 * 
 * This script sends the migration SQL directly to the Supabase
 * PostgreSQL database using the REST API.
 */
import fs from 'fs';
import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Extract project ref from URL
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];

async function runMigration() {
  console.log('\n  ✦ Running Supabase SQL Migration...\n');

  const sql = fs.readFileSync('./database/supabase-migration.sql', 'utf8');

  // Use Supabase's SQL endpoint via pg-meta
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({}),
  });

  // The REST API doesn't support raw SQL execution.
  // We'll use the Supabase SQL API (pg-meta) instead.
  // This endpoint is available at /pg/query
  const sqlResponse = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (sqlResponse.ok) {
    console.log('  ✓ Migration completed successfully!\n');
  } else {
    const text = await sqlResponse.text();
    console.log('  ℹ Could not run migration via API.');
    console.log('  → Please run the SQL migration manually:');
    console.log('');
    console.log('  1. Go to: https://supabase.com/dashboard/project/' + projectRef + '/sql');
    console.log('  2. Open the file: database/supabase-migration.sql');
    console.log('  3. Copy-paste the entire contents into the SQL Editor');
    console.log('  4. Click "Run"');
    console.log('');
    console.log('  After running the migration, seed the database with:');
    console.log('  → node server/scripts/run-migration.js --seed-only');
    console.log('');
  }
}

async function seedOnly() {
  console.log('\n  ✦ Seeding database...\n');
  const { seedDatabase } = await import('../config/database.js');
  await seedDatabase();
}

const args = process.argv.slice(2);
if (args.includes('--seed-only')) {
  await seedOnly();
} else {
  await runMigration();
}

process.exit(0);

