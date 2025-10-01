require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

async function createBlogsTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🚀 Creating blogs table...');
    const sql = fs.readFileSync('./scripts/create-blogs-table.sql', 'utf8');
    await pool.query(sql);
    console.log('✅ Blogs table created successfully!');
    console.log('   - Table created with all columns');
    console.log('   - Indexes added for performance');
    console.log('   - Ready for blog management');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createBlogsTable(); 