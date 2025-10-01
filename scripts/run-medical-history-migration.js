const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function runMigration() {
  try {
    console.log('🚀 Starting medical history table migration...');
    
    // Create database connection using environment variables
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    const sqlPath = path.join(__dirname, 'add_medical_history_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('   - Created patient_documents table');
    console.log('   - Added indexes for better performance');
    console.log('   - Set up RLS policies');
    console.log('   - Added emergency_contact_relationship column to patients table');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nPlease check:');
    console.error('1. DATABASE_URL is set in your .env file');
    console.error('2. Database is accessible');
    console.error('3. You have sufficient permissions');
    process.exit(1);
  }
}

runMigration(); 