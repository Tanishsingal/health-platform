require('dotenv').config();
const { Pool } = require('pg');

async function checkColumns() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name='prescriptions' 
      ORDER BY ordinal_position
    `);
    
    console.log('Prescriptions table columns:');
    res.rows.forEach(r => console.log(' -', r.column_name, '(', r.data_type, ')'));
    
    console.log('\n---');
    console.log('Looking for: medication_name, dosage, frequency, duration');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkColumns(); 