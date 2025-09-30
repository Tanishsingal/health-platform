const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function runSQL(sql, description) {
  console.log(`🔄 ${description}...`);
  try {
    const command = `docker exec healthcare-postgres psql -U healthcare_user -d healthcare_db -c "${sql}"`;
    const result = await execAsync(command);
    console.log(`✅ ${description} completed`);
    return result;
  } catch (error) {
    console.log(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

async function initializeSchema() {
  console.log('🏥 Initializing Healthcare Database Schema');
  console.log('=========================================');

  try {
    // Skip extensions for now - we'll use generated UUIDs differently
    console.log('⏩ Skipping extensions (using built-in UUID generation)');

    // Create enums
    await runSQL(`CREATE TYPE user_role AS ENUM (
      'patient', 'doctor', 'nurse', 'admin_staff', 'pharmacist',
      'lab_technician', 'cleaning_staff', 'maintenance_staff',
      'sales_procurement', 'public_health_admin', 'super_admin'
    );`, 'Creating user_role enum');

    await runSQL(`CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');`, 'Creating user_status enum');

    // Create core users table
    await runSQL(`CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20),
      password_hash VARCHAR(255),
      role user_role NOT NULL,
      status user_status DEFAULT 'pending_verification',
      email_verified BOOLEAN DEFAULT FALSE,
      phone_verified BOOLEAN DEFAULT FALSE,
      last_login TIMESTAMP WITH TIME ZONE,
      failed_login_attempts INTEGER DEFAULT 0,
      locked_until TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`, 'Creating users table');

    // Create user profiles table
    await runSQL(`CREATE TABLE user_profiles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      date_of_birth DATE,
      gender VARCHAR(20),
      profile_picture_url TEXT,
      address JSONB,
      emergency_contact JSONB,
      national_id VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`, 'Creating user_profiles table');

    // Create patients table
    await runSQL(`CREATE TABLE patients (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      patient_id VARCHAR(50) UNIQUE NOT NULL,
      blood_group VARCHAR(5),
      height_cm INTEGER,
      weight_kg DECIMAL(5,2),
      allergies TEXT[],
      chronic_conditions TEXT[],
      emergency_contact_name VARCHAR(100),
      emergency_contact_phone VARCHAR(20),
      insurance_provider VARCHAR(100),
      insurance_policy_number VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`, 'Creating patients table');

    // Create doctors table
    await runSQL(`CREATE TABLE doctors (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      doctor_id VARCHAR(50) UNIQUE NOT NULL,
      specialization VARCHAR(100) NOT NULL,
      license_number VARCHAR(100) UNIQUE NOT NULL,
      department VARCHAR(100),
      qualification TEXT[],
      experience_years INTEGER,
      consultation_fee DECIMAL(10,2),
      available_slots JSONB,
      telemedicine_enabled BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`, 'Creating doctors table');

    // Create medications table
    await runSQL(`CREATE TABLE medications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(200) NOT NULL,
      generic_name VARCHAR(200),
      brand_name VARCHAR(200),
      manufacturer VARCHAR(200),
      category VARCHAR(100),
      dosage_form VARCHAR(100),
      strength VARCHAR(100),
      unit_price DECIMAL(10,2),
      requires_prescription BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`, 'Creating medications table');

    // Create appointment enums and table
    await runSQL(`CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');`, 'Creating appointment_status enum');
    await runSQL(`CREATE TYPE appointment_type AS ENUM ('consultation', 'follow_up', 'emergency', 'telemedicine', 'procedure');`, 'Creating appointment_type enum');

    await runSQL(`CREATE TABLE appointments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
      doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
      appointment_type appointment_type NOT NULL,
      status appointment_status DEFAULT 'scheduled',
      scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
      duration_minutes INTEGER DEFAULT 30,
      reason_for_visit TEXT,
      notes TEXT,
      telemedicine_link TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`, 'Creating appointments table');

    // Create basic indexes
    await runSQL('CREATE INDEX idx_users_email ON users(email);', 'Creating users email index');
    await runSQL('CREATE INDEX idx_patients_patient_id ON patients(patient_id);', 'Creating patients patient_id index');
    await runSQL('CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);', 'Creating appointments patient_id index');
    await runSQL('CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);', 'Creating appointments doctor_id index');

    console.log('');
    console.log('🎉 Database schema initialized successfully!');
    console.log('📊 Core tables created:');
    console.log('   - users & user_profiles');
    console.log('   - patients & doctors');
    console.log('   - medications & appointments');
    console.log('');
    console.log('✨ Ready to add sample data!');

  } catch (error) {
    console.error('💥 Schema initialization failed:', error.message);
    process.exit(1);
  }
}

// Run the initialization
initializeSchema(); 