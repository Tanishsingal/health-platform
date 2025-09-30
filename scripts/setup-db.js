const fs = require('fs');
const path = require('path');

console.log('🏥 Healthcare Platform Database Setup (Neon DB)');
console.log('===============================================');

// Instructions for Neon DB setup
function showNeonSetupInstructions() {
  console.log('🌐 Neon Database Setup Instructions');
  console.log('===================================');
  console.log('');
  console.log('✅ Great! You\'re using Neon DB - a serverless PostgreSQL database.');
  console.log('');
  console.log('📋 Setup Steps:');
  console.log('1. ✅ You already have a Neon database instance');
  console.log('2. 📝 Copy your environment variables:');
  console.log('   cp env.example .env');
  console.log('');
  console.log('3. 🔧 Update your .env file with your Neon credentials:');
  console.log('   DATABASE_URL=postgresql://neondb_owner:npg_TfCLG5ti0ean@ep-holy-fog-ad56sest-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');
  console.log('');
  console.log('4. 🚀 Run the database migrations:');
  console.log('   npm run db:migrate');
  console.log('');
  console.log('5. 🌱 Seed the database with sample data:');
  console.log('   npm run db:seed');
  console.log('');
  console.log('6. 🎉 Start your development server:');
  console.log('   npm run dev');
  console.log('');
  console.log('💡 Benefits of Neon DB:');
  console.log('   • Serverless - scales to zero when not in use');
  console.log('   • Branching - create database branches like Git');
  console.log('   • Fast cold starts');
  console.log('   • Built-in connection pooling');
  console.log('   • Automatic backups');
  console.log('');
}

// Test Neon DB connection
async function testNeonConnection() {
  const { Pool } = require('pg');
  
  const dbConfig = {
    connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_TfCLG5ti0ean@ep-holy-fog-ad56sest-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
    ssl: {
      rejectUnauthorized: false
    }
  };

  console.log('🔍 Testing Neon DB connection...');
  
  const pool = new Pool(dbConfig);
  
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    
    console.log('✅ Connection successful!');
    console.log(`📅 Server time: ${result.rows[0].current_time}`);
    console.log(`🗄️  Database: ${result.rows[0].db_version.split(',')[0]}`);
    
    client.release();
    await pool.end();
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check your DATABASE_URL in .env file');
    console.log('2. Ensure your Neon database is active (not suspended)');
    console.log('3. Verify your credentials are correct');
    console.log('4. Check if your IP is allowed (Neon allows all by default)');
    
    await pool.end();
    return false;
  }
}

// Create sample data script
function createSampleDataScript() {
  const sampleDataSQL = `
-- Sample data for healthcare platform development
-- Run this after the main schema is created

-- Insert sample users with hashed passwords
-- Default password for all users: password123
INSERT INTO users (id, email, password_hash, role, status, email_verified) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@hospital.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO8u', 'super_admin', 'active', true),
('550e8400-e29b-41d4-a716-446655440002', 'doctor@hospital.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO8u', 'doctor', 'active', true),
('550e8400-e29b-41d4-a716-446655440003', 'nurse@hospital.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO8u', 'nurse', 'active', true),
('550e8400-e29b-41d4-a716-446655440004', 'patient@hospital.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO8u', 'patient', 'active', true),
('550e8400-e29b-41d4-a716-446655440005', 'pharmacist@hospital.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO8u', 'pharmacist', 'active', true)
ON CONFLICT (id) DO NOTHING;

-- Insert user profiles
INSERT INTO user_profiles (id, user_id, first_name, last_name, phone) VALUES
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'Admin', 'User', '+1234567890'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 'Dr. John', 'Smith', '+1234567891'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', 'Sarah', 'Johnson', '+1234567892'),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440004', 'Jane', 'Doe', '+1234567893'),
('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440005', 'Mike', 'Wilson', '+1234567894')
ON CONFLICT (id) DO NOTHING;

-- Insert sample medications
INSERT INTO medications (name, generic_name, category, requires_prescription, unit_price) VALUES
('Paracetamol 500mg', 'Acetaminophen', 'Analgesic', false, 0.50),
('Amoxicillin 250mg', 'Amoxicillin', 'Antibiotic', true, 2.00),
('Metformin 500mg', 'Metformin', 'Antidiabetic', true, 1.50),
('Lisinopril 10mg', 'Lisinopril', 'ACE Inhibitor', true, 3.00),
('Ibuprofen 400mg', 'Ibuprofen', 'NSAID', false, 0.75)
ON CONFLICT (name) DO NOTHING;

-- Insert sample lab test types
INSERT INTO lab_test_types (name, category, normal_range_text, unit, cost) VALUES
('Complete Blood Count', 'Hematology', '4.5-11.0 x10³/µL', 'x10³/µL', 25.00),
('Blood Glucose (Fasting)', 'Chemistry', '70-100 mg/dL', 'mg/dL', 15.00),
('Lipid Panel', 'Chemistry', 'Total Cholesterol <200 mg/dL', 'mg/dL', 35.00),
('Thyroid Function (TSH)', 'Endocrinology', '0.4-4.0 mIU/L', 'mIU/L', 45.00),
('Liver Function Test', 'Chemistry', 'ALT: 7-56 U/L', 'U/L', 30.00)
ON CONFLICT (name) DO NOTHING;

COMMIT;
`;

  const scriptPath = path.join(__dirname, 'neon-sample-data.sql');
  fs.writeFileSync(scriptPath, sampleDataSQL.trim());
  console.log('✅ Neon sample data script created at:', scriptPath);
}

// Create development utilities
function createDevUtilities() {
  const utilsContent = `
-- Development utility queries for Neon DB
-- Use these to quickly check your database setup

-- Check all users and their roles
SELECT u.email, u.role, u.status, up.first_name, up.last_name 
FROM users u 
LEFT JOIN user_profiles up ON u.id = up.user_id
ORDER BY u.role, u.email;

-- Check medications inventory
SELECT m.name, COALESCE(i.quantity_available, 0) as stock, i.expiry_date, i.batch_number
FROM medications m
LEFT JOIN inventory i ON m.id = i.medication_id
ORDER BY m.name;

-- Check lab test types
SELECT name, category, cost, normal_range_text
FROM lab_test_types
ORDER BY category, name;

-- Quick stats
SELECT 
  'Total Users' as metric, COUNT(*) as count FROM users
UNION ALL
SELECT 
  'Total Medications' as metric, COUNT(*) as count FROM medications
UNION ALL
SELECT 
  'Total Lab Tests' as metric, COUNT(*) as count FROM lab_test_types;

-- Check database size (Neon specific)
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
`;

  const utilsPath = path.join(__dirname, 'neon-dev-queries.sql');
  fs.writeFileSync(utilsPath, utilsContent.trim());
  console.log('✅ Neon development utilities created at:', utilsPath);
}

// Main setup function
async function main() {
  console.log('🚀 Starting Neon database setup...');
  
  // Show setup instructions
  showNeonSetupInstructions();
  
  // Test connection if DATABASE_URL is available
  if (process.env.DATABASE_URL) {
    console.log('🔍 Testing connection with provided DATABASE_URL...');
    const connected = await testNeonConnection();
    
    if (connected) {
      console.log('');
      console.log('🎉 Connection successful! You can now run:');
      console.log('   npm run db:migrate');
      console.log('   npm run db:seed');
    }
  } else {
    console.log('💡 Set up your .env file first, then test the connection.');
  }
  
  // Create helper scripts
  createSampleDataScript();
  createDevUtilities();
  
  console.log('');
  console.log('🎉 Neon database setup completed!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Copy env.example to .env and update DATABASE_URL');
  console.log('2. Run migrations: npm run db:migrate');
  console.log('3. Seed data: npm run db:seed');
  console.log('4. Start development: npm run dev');
  console.log('');
  console.log('🔗 Your Neon database dashboard: https://console.neon.tech/');
}

// Run the setup
main().catch(console.error); 