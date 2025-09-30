-- Minimal Healthcare Platform Database Schema
-- Core tables for development and testing

-- Create enums
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'nurse', 'admin_staff', 'pharmacist', 'lab_technician', 'cleaning_staff', 'maintenance_staff', 'sales_procurement', 'public_health_admin', 'super_admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE appointment_type AS ENUM ('consultation', 'follow_up', 'emergency', 'telemedicine', 'procedure');

-- Core users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
);

-- User profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    profile_picture_url TEXT,
    address TEXT,
    emergency_contact TEXT,
    national_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    patient_id VARCHAR(50) UNIQUE NOT NULL,
    blood_group VARCHAR(5),
    height_cm INTEGER,
    weight_kg DECIMAL(5,2),
    allergies TEXT,
    chronic_conditions TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    insurance_provider VARCHAR(100),
    insurance_policy_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctors table
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id VARCHAR(50) UNIQUE NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(100),
    qualification TEXT,
    experience_years INTEGER,
    consultation_fee DECIMAL(10,2),
    available_slots TEXT,
    telemedicine_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medications table
CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
);

-- Appointments table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_patients_patient_id ON patients(patient_id);
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_doctors_doctor_id ON doctors(doctor_id);
CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);

-- Insert sample data
INSERT INTO users (id, email, role, status, email_verified) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@hospital.com', 'super_admin', 'active', true),
('550e8400-e29b-41d4-a716-446655440002', 'doctor@hospital.com', 'doctor', 'active', true),
('550e8400-e29b-41d4-a716-446655440003', 'nurse@hospital.com', 'nurse', 'active', true),
('550e8400-e29b-41d4-a716-446655440004', 'patient@hospital.com', 'patient', 'active', true),
('550e8400-e29b-41d4-a716-446655440005', 'pharmacist@hospital.com', 'pharmacist', 'active', true);

-- Insert user profiles
INSERT INTO user_profiles (id, user_id, first_name, last_name) VALUES
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'Admin', 'User'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 'Dr. John', 'Smith'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', 'Sarah', 'Johnson'),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440004', 'Jane', 'Doe'),
('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440005', 'Mike', 'Wilson');

-- Insert sample doctor
INSERT INTO doctors (id, user_id, doctor_id, specialization, license_number, department, consultation_fee) VALUES
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440002', 'DOC001', 'Internal Medicine', 'LIC123456', 'General Medicine', 100.00);

-- Insert sample patient
INSERT INTO patients (id, user_id, patient_id, blood_group) VALUES
('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440004', 'PAT001', 'O+');

-- Insert sample medications
INSERT INTO medications (name, generic_name, category, requires_prescription, unit_price) VALUES
('Paracetamol 500mg', 'Acetaminophen', 'Analgesic', false, 0.50),
('Amoxicillin 250mg', 'Amoxicillin', 'Antibiotic', true, 2.00),
('Metformin 500mg', 'Metformin', 'Antidiabetic', true, 1.50),
('Lisinopril 10mg', 'Lisinopril', 'ACE Inhibitor', true, 3.00),
('Ibuprofen 400mg', 'Ibuprofen', 'NSAID', false, 0.75);

COMMIT; 