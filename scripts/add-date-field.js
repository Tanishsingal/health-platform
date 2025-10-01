require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

async function addDateField() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🚀 Adding document_date column...');
    
    const sql = fs.readFileSync('./scripts/add-document-date.sql', 'utf8');
    await pool.query(sql);
    
    console.log('✅ Successfully added document_date column!');
    console.log('   - Column added to patient_documents table');
    console.log('   - Index created for better sorting');
    console.log('   - Existing records updated');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addDateField(); 