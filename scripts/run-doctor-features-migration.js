require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🚀 Starting doctor features migration...');
    console.log('📊 Database URL:', process.env.DATABASE_URL ? 'Found' : 'NOT FOUND!');

    const sqlPath = path.join(__dirname, 'add-doctor-features-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Executing SQL...\n');
    await pool.query(sql);

    console.log('\n✅ Migration completed successfully!');
    console.log('   - prescriptions table created');
    console.log('   - lab_tests table created');
    console.log('   - Indexes added');
    console.log('   - RLS policies applied');
    console.log('\n🎉 You can now use prescription and lab test features!');

  } catch (error) {
    console.error('❌ Migration failed!');
    console.error('Error:', error.message);
    if (error.detail) console.error('Detail:', error.detail);
    if (error.hint) console.error('Hint:', error.hint);
  } finally {
    await pool.end();
  }
}

runMigration(); 