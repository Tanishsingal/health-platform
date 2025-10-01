require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

async function createTables() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🚀 Creating doctor features tables...');
    const sql = fs.readFileSync('./scripts/create-doctor-tables.sql', 'utf8');
    await pool.query(sql);
    console.log('✅ Tables created successfully!');
    console.log('   - prescriptions table');
    console.log('   - lab_tests table');
    console.log('   - Indexes created');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createTables(); 