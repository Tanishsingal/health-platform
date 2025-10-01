require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

async function fixRLS() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔧 Fixing RLS policies...');
    const sql = fs.readFileSync('./scripts/fix-rls-policies.sql', 'utf8');
    await pool.query(sql);
    console.log('✅ RLS policies fixed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixRLS(); 