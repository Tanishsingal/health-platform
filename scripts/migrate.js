const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration for Neon DB
const dbConfig = {
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_TfCLG5ti0ean@ep-holy-fog-ad56sest-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false // Neon requires SSL
  }
};

console.log('🔄 Healthcare Platform Database Migration (Neon DB)');
console.log('==================================================');

async function runMigration() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('📡 Connecting to Neon database...');
    const client = await pool.connect();
    
    console.log('✅ Connected to Neon database successfully');
    
    // Check if migrations table exists
    const migrationTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'migrations'
      );
    `);
    
    if (!migrationTableExists.rows[0].exists) {
      console.log('📋 Creating migrations table...');
      await client.query(`
        CREATE TABLE migrations (
          id SERIAL PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
    }
    
    // Get list of executed migrations
    const executedMigrations = await client.query('SELECT filename FROM migrations');
    const executedFiles = executedMigrations.rows.map(row => row.filename);
    
    // Read migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    
    // Create migrations directory if it doesn't exist
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir);
      console.log('📁 Created migrations directory');
    }
    
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`📄 Found ${migrationFiles.length} migration files`);
    
    // Execute pending migrations
    for (const file of migrationFiles) {
      if (!executedFiles.includes(file)) {
        console.log(`🔄 Executing migration: ${file}`);
        
        const migrationSQL = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        
        try {
          await client.query('BEGIN');
          await client.query(migrationSQL);
          await client.query('INSERT INTO migrations (filename) VALUES ($1)', [file]);
          await client.query('COMMIT');
          
          console.log(`✅ Migration ${file} executed successfully`);
        } catch (error) {
          await client.query('ROLLBACK');
          console.error(`❌ Migration ${file} failed:`, error.message);
          throw error;
        }
      } else {
        console.log(`⏭️  Migration ${file} already executed`);
      }
    }
    
    // Run basic schema validation
    console.log('🔍 Validating schema...');
    
    const requiredTables = [
      'users',
      'user_profiles',
      'patients',
      'doctors',
      'medications',
      'inventory',
      'lab_test_types'
    ];
    
    for (const table of requiredTables) {
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [table]);
      
      if (tableExists.rows[0].exists) {
        console.log(`✅ Table '${table}' exists`);
      } else {
        console.log(`❌ Table '${table}' missing`);
      }
    }
    
    // Show Neon-specific info
    const dbInfo = await client.query('SELECT version(), current_database(), current_user');
    console.log('�� Database Info:');
    console.log(`   Database: ${dbInfo.rows[0].current_database}`);
    console.log(`   User: ${dbInfo.rows[0].current_user}`);
    console.log(`   Version: ${dbInfo.rows[0].version.split(',')[0]}`);
    
    client.release();
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check your DATABASE_URL in .env file');
    console.log('2. Ensure your Neon database is active');
    console.log('3. Verify your credentials are correct');
    console.log('4. Check the migration SQL for syntax errors');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Create initial migration if migrations directory is empty
function createInitialMigration() {
  const migrationsDir = path.join(__dirname, 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir);
  }
  
  const migrationFiles = fs.readdirSync(migrationsDir);
  
  if (migrationFiles.length === 0) {
    console.log('📝 Creating initial migration for Neon DB...');
    
    const initialMigration = `-- Initial Healthcare Platform Schema for Neon DB
-- This migration sets up the basic database structure

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create user roles enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM (
      'super_admin',
      'admin', 
      'doctor',
      'nurse',
      'patient',
      'pharmacist',
      'lab_technician'
    );
  END IF;
END $$;

-- Create user status enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
  END IF;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255),
    role user_role NOT NULL,
    status user_status DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    address TEXT,
    phone VARCHAR(20),
    emergency_contact VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    generic_name VARCHAR(255),
    category VARCHAR(100),
    description TEXT,
    dosage_form VARCHAR(50),
    strength VARCHAR(50),
    unit_price DECIMAL(10,2),
    requires_prescription BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
    batch_number VARCHAR(100),
    quantity_available INTEGER NOT NULL DEFAULT 0,
    quantity_reserved INTEGER DEFAULT 0,
    expiry_date DATE,
    cost_price DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    minimum_stock_level INTEGER DEFAULT 10,
    location VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lab test types table
CREATE TABLE IF NOT EXISTS lab_test_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100),
    description TEXT,
    normal_range_min DECIMAL(10,3),
    normal_range_max DECIMAL(10,3),
    normal_range_text TEXT,
    unit VARCHAR(50),
    cost DECIMAL(10,2),
    preparation_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    patient_id VARCHAR(50) UNIQUE,
    blood_group VARCHAR(5),
    allergies TEXT[],
    medical_history TEXT,
    insurance_number VARCHAR(100),
    insurance_provider VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id VARCHAR(50) UNIQUE,
    specialization VARCHAR(255),
    license_number VARCHAR(100) UNIQUE,
    department VARCHAR(255),
    consultation_fee DECIMAL(10,2),
    experience_years INTEGER,
    qualifications TEXT[],
    available_days INTEGER[] DEFAULT '{1,2,3,4,5}', -- 1=Monday, 7=Sunday
    available_from TIME DEFAULT '09:00',
    available_to TIME DEFAULT '17:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_doctor_id ON doctors(doctor_id);
CREATE INDEX IF NOT EXISTS idx_inventory_medication_id ON inventory(medication_id);
CREATE INDEX IF NOT EXISTS idx_medications_name ON medications(name);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to main tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_medications_updated_at ON medications;
CREATE TRIGGER update_medications_updated_at 
  BEFORE UPDATE ON medications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
CREATE TRIGGER update_inventory_updated_at 
  BEFORE UPDATE ON inventory 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at 
  BEFORE UPDATE ON patients 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_doctors_updated_at ON doctors;
CREATE TRIGGER update_doctors_updated_at 
  BEFORE UPDATE ON doctors 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lab_test_types_updated_at ON lab_test_types;
CREATE TRIGGER update_lab_test_types_updated_at 
  BEFORE UPDATE ON lab_test_types 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `${timestamp}_initial_neon_migration.sql`;
    
    fs.writeFileSync(path.join(migrationsDir, filename), initialMigration);
    console.log(`✅ Created initial Neon migration: ${filename}`);
  }
}

// Main execution
async function main() {
  createInitialMigration();
  await runMigration();
}

main().catch(console.error); 