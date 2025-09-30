require('dotenv').config();
const { Client } = require('pg');

async function checkUsers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get all users
    const usersResult = await client.query('SELECT id, email, role FROM users ORDER BY email');
    console.log('📋 All Users:');
    usersResult.rows.forEach(u => {
      console.log(`   - ${u.email} (${u.role}) ID: ${u.id}`);
    });

    // Get all doctors
    console.log('\n👨‍⚕️ Doctor Records:');
    const doctorsResult = await client.query('SELECT d.*, up.first_name, up.last_name FROM doctors d LEFT JOIN user_profiles up ON d.user_id = up.user_id');
    if (doctorsResult.rows.length === 0) {
      console.log('   No doctor records found');
    } else {
      doctorsResult.rows.forEach(d => {
        console.log(`   - ${d.first_name} ${d.last_name} (User ID: ${d.user_id})`);
      });
    }

    // Get all patients
    console.log('\n🤒 Patient Records:');
    const patientsResult = await client.query('SELECT p.*, up.first_name, up.last_name FROM patients p LEFT JOIN user_profiles up ON p.user_id = up.user_id');
    if (patientsResult.rows.length === 0) {
      console.log('   No patient records found');
    } else {
      patientsResult.rows.forEach(p => {
        console.log(`   - ${p.first_name} ${p.last_name} (User ID: ${p.user_id})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkUsers(); 