require('dotenv').config();
const { Client } = require('pg');

async function checkAppointments() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get all appointments
    console.log('📅 All Appointments:');
    const appointmentsResult = await client.query(`
      SELECT 
        a.id,
        a.appointment_date,
        a.status,
        a.reason,
        a.duration_minutes,
        d.specialization as doctor_specialization,
        dup.first_name as doctor_first_name,
        dup.last_name as doctor_last_name,
        pup.first_name as patient_first_name,
        pup.last_name as patient_last_name,
        a.created_at
      FROM appointments a
      LEFT JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN user_profiles dup ON d.user_id = dup.user_id
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN user_profiles pup ON p.user_id = pup.user_id
      ORDER BY a.appointment_date DESC
    `);

    if (appointmentsResult.rows.length === 0) {
      console.log('   No appointments found');
    } else {
      appointmentsResult.rows.forEach((apt, idx) => {
        console.log(`\n${idx + 1}. Appointment ID: ${apt.id}`);
        console.log(`   Date: ${apt.appointment_date}`);
        console.log(`   Status: ${apt.status}`);
        console.log(`   Duration: ${apt.duration_minutes} minutes`);
        console.log(`   Doctor: ${apt.doctor_first_name} ${apt.doctor_last_name} (${apt.doctor_specialization})`);
        console.log(`   Patient: ${apt.patient_first_name} ${apt.patient_last_name}`);
        console.log(`   Reason: ${apt.reason}`);
        console.log(`   Created: ${apt.created_at}`);
      });
    }

    console.log(`\n📊 Total Appointments: ${appointmentsResult.rows.length}\n`);

    // Get appointment counts by status
    const statusResult = await client.query(`
      SELECT status, COUNT(*) as count
      FROM appointments
      GROUP BY status
    `);

    console.log('📈 Appointments by Status:');
    statusResult.rows.forEach(row => {
      console.log(`   ${row.status}: ${row.count}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAppointments(); 