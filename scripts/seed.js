const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Database configuration for Neon DB
const dbConfig = {
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_TfCLG5ti0ean@ep-holy-fog-ad56sest-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false // Neon requires SSL
  }
};

console.log('🌱 Healthcare Platform Database Seeding (Neon DB)');
console.log('=================================================');

async function seedDatabase() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('📡 Connecting to Neon database...');
    const client = await pool.connect();
    
    console.log('✅ Connected to Neon database successfully');
    
    // Check if data already exists
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) > 0) {
      console.log('📊 Database already contains data. Skipping seed...');
      console.log(`   Found ${userCount.rows[0].count} existing users`);
      client.release();
      return;
    }
    
    console.log('🌱 Seeding Neon database with initial data...');
    
    await client.query('BEGIN');
    
    // Hash passwords
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);
    console.log('🔐 Generated password hashes...');
    
    // Insert sample users
    console.log('👥 Creating users...');
    const users = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'admin@hospital.com',
        role: 'super_admin',
        status: 'active',
        email_verified: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        email: 'doctor@hospital.com',
        role: 'doctor',
        status: 'active',
        email_verified: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        email: 'nurse@hospital.com',
        role: 'nurse',
        status: 'active',
        email_verified: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        email: 'patient@hospital.com',
        role: 'patient',
        status: 'active',
        email_verified: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        email: 'pharmacist@hospital.com',
        role: 'pharmacist',
        status: 'active',
        email_verified: true
      }
    ];
    
    for (const user of users) {
      await client.query(
        `INSERT INTO users (id, email, password_hash, role, status, email_verified) 
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [user.id, user.email, hashedPassword, user.role, user.status, user.email_verified]
      );
    }
    
    // Insert user profiles
    console.log('📝 Creating user profiles...');
    const profiles = [
      {
        id: '550e8400-e29b-41d4-a716-446655440011',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        first_name: 'Admin',
        last_name: 'User',
        phone: '+1234567890'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440012',
        user_id: '550e8400-e29b-41d4-a716-446655440002',
        first_name: 'Dr. John',
        last_name: 'Smith',
        phone: '+1234567891'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440013',
        user_id: '550e8400-e29b-41d4-a716-446655440003',
        first_name: 'Sarah',
        last_name: 'Johnson',
        phone: '+1234567892'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440014',
        user_id: '550e8400-e29b-41d4-a716-446655440004',
        first_name: 'Jane',
        last_name: 'Doe',
        phone: '+1234567893',
        date_of_birth: '1990-05-15',
        gender: 'female'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440015',
        user_id: '550e8400-e29b-41d4-a716-446655440005',
        first_name: 'Mike',
        last_name: 'Wilson',
        phone: '+1234567894'
      }
    ];
    
    for (const profile of profiles) {
      await client.query(
        `INSERT INTO user_profiles (id, user_id, first_name, last_name, phone, date_of_birth, gender) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [
          profile.id,
          profile.user_id,
          profile.first_name,
          profile.last_name,
          profile.phone,
          profile.date_of_birth || null,
          profile.gender || null
        ]
      );
    }
    
    // Insert sample medications
    console.log('💊 Creating medications...');
    const medications = [
      {
        name: 'Paracetamol 500mg',
        generic_name: 'Acetaminophen',
        category: 'Analgesic',
        requires_prescription: false,
        unit_price: 0.50
      },
      {
        name: 'Amoxicillin 250mg',
        generic_name: 'Amoxicillin',
        category: 'Antibiotic',
        requires_prescription: true,
        unit_price: 2.00
      },
      {
        name: 'Metformin 500mg',
        generic_name: 'Metformin',
        category: 'Antidiabetic',
        requires_prescription: true,
        unit_price: 1.50
      },
      {
        name: 'Lisinopril 10mg',
        generic_name: 'Lisinopril',
        category: 'ACE Inhibitor',
        requires_prescription: true,
        unit_price: 3.00
      },
      {
        name: 'Ibuprofen 400mg',
        generic_name: 'Ibuprofen',
        category: 'NSAID',
        requires_prescription: false,
        unit_price: 0.75
      }
    ];
    
    const medicationIds = [];
    for (const med of medications) {
      const result = await client.query(
        `INSERT INTO medications (name, generic_name, category, requires_prescription, unit_price) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (name) DO UPDATE SET 
           generic_name = EXCLUDED.generic_name,
           category = EXCLUDED.category,
           requires_prescription = EXCLUDED.requires_prescription,
           unit_price = EXCLUDED.unit_price
         RETURNING id`,
        [med.name, med.generic_name, med.category, med.requires_prescription, med.unit_price]
      );
      medicationIds.push(result.rows[0].id);
    }
    
    // Insert sample lab test types
    console.log('🧪 Creating lab test types...');
    const labTests = [
      {
        name: 'Complete Blood Count',
        category: 'Hematology',
        normal_range_text: '4.5-11.0 x10³/µL',
        unit: 'x10³/µL',
        cost: 25.00
      },
      {
        name: 'Blood Glucose (Fasting)',
        category: 'Chemistry',
        normal_range_text: '70-100 mg/dL',
        unit: 'mg/dL',
        cost: 15.00
      },
      {
        name: 'Lipid Panel',
        category: 'Chemistry',
        normal_range_text: 'Total Cholesterol <200 mg/dL',
        unit: 'mg/dL',
        cost: 35.00
      },
      {
        name: 'Thyroid Function (TSH)',
        category: 'Endocrinology',
        normal_range_text: '0.4-4.0 mIU/L',
        unit: 'mIU/L',
        cost: 45.00
      },
      {
        name: 'Liver Function Test',
        category: 'Chemistry',
        normal_range_text: 'ALT: 7-56 U/L',
        unit: 'U/L',
        cost: 30.00
      }
    ];
    
    for (const test of labTests) {
      await client.query(
        `INSERT INTO lab_test_types (name, category, normal_range_text, unit, cost) 
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (name) DO UPDATE SET
           category = EXCLUDED.category,
           normal_range_text = EXCLUDED.normal_range_text,
           unit = EXCLUDED.unit,
           cost = EXCLUDED.cost`,
        [test.name, test.category, test.normal_range_text, test.unit, test.cost]
      );
    }
    
    // Insert sample doctor
    console.log('👨‍⚕️ Creating doctor records...');
    await client.query(
      `INSERT INTO doctors (id, user_id, doctor_id, specialization, license_number, department, consultation_fee) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [
        '550e8400-e29b-41d4-a716-446655440022',
        '550e8400-e29b-41d4-a716-446655440002',
        'DOC001',
        'Internal Medicine',
        'LIC123456',
        'General Medicine',
        100.00
      ]
    );
    
    // Insert sample patient
    console.log('🤒 Creating patient records...');
    await client.query(
      `INSERT INTO patients (id, user_id, patient_id, blood_group) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        '550e8400-e29b-41d4-a716-446655440024',
        '550e8400-e29b-41d4-a716-446655440004',
        'PAT001',
        'O+'
      ]
    );
    
    // Insert sample inventory
    console.log('📦 Creating inventory records...');
    for (const medId of medicationIds) {
      await client.query(
        `INSERT INTO inventory (medication_id, batch_number, quantity_available, expiry_date, cost_price, minimum_stock_level) 
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [medId, 'BATCH001', 100, '2025-12-31', 1.00, 10]
      );
    }
    
    await client.query('COMMIT');
    
    // Get final counts
    const finalCounts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM user_profiles) as profiles,
        (SELECT COUNT(*) FROM medications) as medications,
        (SELECT COUNT(*) FROM lab_test_types) as lab_tests,
        (SELECT COUNT(*) FROM doctors) as doctors,
        (SELECT COUNT(*) FROM patients) as patients,
        (SELECT COUNT(*) FROM inventory) as inventory_items
    `);
    
    client.release();
    
    console.log('🎉 Neon database seeded successfully!');
    console.log('');
    console.log('📊 Data Summary:');
    console.log(`   Users: ${finalCounts.rows[0].users}`);
    console.log(`   Profiles: ${finalCounts.rows[0].profiles}`);
    console.log(`   Medications: ${finalCounts.rows[0].medications}`);
    console.log(`   Lab Tests: ${finalCounts.rows[0].lab_tests}`);
    console.log(`   Doctors: ${finalCounts.rows[0].doctors}`);
    console.log(`   Patients: ${finalCounts.rows[0].patients}`);
    console.log(`   Inventory Items: ${finalCounts.rows[0].inventory_items}`);
    console.log('');
    console.log('📋 Default Login Credentials:');
    console.log('==============================');
    console.log('Super Admin: admin@hospital.com / password123');
    console.log('Doctor: doctor@hospital.com / password123');
    console.log('Nurse: nurse@hospital.com / password123');
    console.log('Patient: patient@hospital.com / password123');
    console.log('Pharmacist: pharmacist@hospital.com / password123');
    console.log('');
    console.log('⚠️  Please change these passwords in production!');
    console.log('🔗 Neon Dashboard: https://console.neon.tech/');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check your DATABASE_URL in .env file');
    console.log('2. Ensure your Neon database is active');
    console.log('3. Run migrations first: npm run db:migrate');
    console.log('4. Check the seed data for conflicts');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase().catch(console.error); 