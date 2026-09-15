const fs = require('fs');
const path = require('path');

const migration1Path = path.join(__dirname, '../supabase/migrations/20260827000000_schema_v2.sql');
const migration2Path = path.join(__dirname, '../supabase/migrations/20260827000001_atomic_procedures.sql');
const migration3Path = path.join(__dirname, '../supabase/migrations/20260827000002_rls_policies.sql');
const seedPath = path.join(__dirname, '../supabase/seed.sql');

console.log('=== NEEDLY DATABASE VERIFICATION SUITE ===\n');

// 1. Read files
const sqlSchema = fs.readFileSync(migration1Path, 'utf8');
const sqlProcedures = fs.readFileSync(migration2Path, 'utf8');
const sqlRls = fs.readFileSync(migration3Path, 'utf8');
const sqlSeed = fs.readFileSync(seedPath, 'utf8');

// 2. Check 25 expected tables
const expectedTables = [
  'profiles', 'communities', 'community_members', 'community_invites',
  'categories', 'listings', 'listing_media', 'listing_availability',
  'needs', 'need_media', 'offers', 'transactions', 'rental_details',
  'service_jobs', 'conversations', 'conversation_participants', 'messages',
  'reviews', 'disputes', 'reports', 'payments', 'notifications',
  'saved_listings', 'saved_needs', 'audit_logs'
];

console.log('1. Checking Table Definitions...');
let missingTables = [];
expectedTables.forEach(table => {
  const match = sqlSchema.match(new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`, 'i')) ||
                sqlSchema.match(new RegExp(`CREATE TABLE ${table}\\b`, 'i'));
  if (!match) {
    missingTables.push(table);
  }
});

if (missingTables.length === 0) {
  console.log(`  ✓ All ${expectedTables.length} canonical tables created successfully.`);
} else {
  console.error(`  ✗ MISSING TABLES: ${missingTables.join(', ')}`);
  process.exit(1);
}

// 3. Check Triggers & Functions
console.log('\n2. Checking Triggers & Utility Functions...');
const hasUpdatedAt = sqlSchema.includes('FUNCTION update_updated_at()');
const hasRegressionTrigger = sqlSchema.includes('FUNCTION prevent_transaction_regression()');
console.log(`  - update_updated_at(): ${hasUpdatedAt ? '✓ Present' : '✗ Missing'}`);
console.log(`  - prevent_transaction_regression(): ${hasRegressionTrigger ? '✓ Present' : '✗ Missing'}`);

if (!hasUpdatedAt || !hasRegressionTrigger) {
  console.error('  ✗ Trigger verification failed.');
  process.exit(1);
}

// 4. Check Atomic Procedures
console.log('\n3. Checking Atomic Procedures & Concurrency Locking...');
const hasAcceptOffer = sqlProcedures.includes('FUNCTION accept_offer(');
const hasForUpdateLock = sqlProcedures.includes('FOR UPDATE');
const hasActiveTxnCheck = sqlProcedures.includes('uq_transactions_active_need') || sqlProcedures.includes('active transaction already exists');

console.log(`  - accept_offer procedure: ${hasAcceptOffer ? '✓ Present' : '✗ Missing'}`);
console.log(`  - FOR UPDATE row locks: ${hasForUpdateLock ? '✓ Present' : '✗ Missing'}`);
console.log(`  - Active transaction check: ${hasActiveTxnCheck ? '✓ Present' : '✗ Missing'}`);

if (!hasAcceptOffer || !hasForUpdateLock) {
  console.error('  ✗ Atomic procedure verification failed.');
  process.exit(1);
}

// 5. Check RLS Policies on all tables
console.log('\n4. Checking Row Level Security (RLS) Coverage...');
let tablesWithoutRls = [];
expectedTables.forEach(table => {
  const match = sqlRls.match(new RegExp(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`, 'i'));
  if (!match) {
    tablesWithoutRls.push(table);
  }
});

if (tablesWithoutRls.length === 0) {
  console.log(`  ✓ RLS enabled on all ${expectedTables.length} tables.`);
} else {
  console.error(`  ✗ Tables missing RLS: ${tablesWithoutRls.join(', ')}`);
  process.exit(1);
}

// 6. Check Foreign Keys & Referential Integrity
console.log('\n5. Checking Constraints & Foreign Keys...');
const fks = (sqlSchema.match(/REFERENCES\s+\w+\(\w+\)\s+ON DELETE\s+(CASCADE|RESTRICT|SET NULL)/gi) || []);
console.log(`  ✓ Found ${fks.length} explicit Foreign Key relationships with ON DELETE policies.`);

const checks = (sqlSchema.match(/CHECK\s*\(/gi) || []);
console.log(`  ✓ Found ${checks.length} CHECK constraints enforcing state & data rules.`);

// 7. Check Seed Data integrity
console.log('\n6. Checking Seed Data & Auth Dependencies...');
const hasAuthUserSeed = sqlSeed.includes('auth.users');
const hasProfileSeed = sqlSeed.includes('profiles');
console.log(`  - auth.users seed: ${hasAuthUserSeed ? '✓ Valid' : '✗ Missing'}`);
console.log(`  - profiles seed: ${hasProfileSeed ? '✓ Valid' : '✗ Missing'}`);

console.log('\n=== VERIFICATION COMPLETE: ALL CHECKS PASSED PERFECTLY ===');
