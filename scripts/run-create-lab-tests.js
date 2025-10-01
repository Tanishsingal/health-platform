require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

async function createLabTestsTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🚀 Creating lab_tests table...');
    const sql = fs.readFileSync('./scripts/create-lab-tests-table.sql', 'utf8');
    await pool.query(sql);
    console.log('✅ lab_tests table created successfully!');
    console.log('   - Table created');
    console.log('   - Indexes added');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createLabTestsTable(); 