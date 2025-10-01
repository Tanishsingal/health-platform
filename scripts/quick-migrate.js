require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🚀 Starting migration...');
    console.log('📊 Database URL:', process.env.DATABASE_URL ? 'Found' : 'NOT FOUND!');
    
    const sqlPath = path.join(__dirname, 'add_medical_history_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📝 Executing SQL...\n');
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('   - Added columns to patients table (blood_type, height_cm, weight_kg, etc.)');
    console.log('   - Created patient_documents table');
    console.log('   - Added indexes');
    console.log('   - Set up RLS policies');
    
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