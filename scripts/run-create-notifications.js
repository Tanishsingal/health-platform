require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

async function createNotificationsTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🚀 Creating notifications table...');
    const sql = fs.readFileSync('./scripts/create-notifications-table.sql', 'utf8');
    await pool.query(sql);
    console.log('✅ Notifications table created successfully!');
    console.log('   - Table created with all columns');
    console.log('   - Indexes added for performance');
    console.log('   - Ready for real-time notifications');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createNotificationsTable(); 