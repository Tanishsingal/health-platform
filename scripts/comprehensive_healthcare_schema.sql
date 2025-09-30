-- Comprehensive Healthcare Platform Database Schema
-- Supporting all stakeholders: Patients, Doctors, Nurses, Admin, Pharmacy, Lab, etc.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE AUTHENTICATION & USER MANAGEMENT
-- =====================================================

-- User roles enum
CREATE TYPE user_role AS ENUM (
    'patient',
    'doctor', 
    'nurse',
    'admin_staff',
    'pharmacist',
    'lab_technician',
    'cleaning_staff',
    'maintenance_staff',
    'sales_procurement',
    'public_health_admin',
    'super_admin'
);

-- User status enum
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');

-- Core users table
CREATE TABLE users (
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
);

-- User profiles (common fields for all users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    profile_picture_url TEXT,
    address JSONB, -- Flexible address structure
    emergency_contact JSONB,
    national_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PATIENT-SPECIFIC TABLES
-- =====================================================

-- Patient medical information
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    patient_id VARCHAR(50) UNIQUE NOT NULL, -- Hospital-generated patient ID
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
);

-- Patient family members (for family health records)
CREATE TABLE patient_family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    member_patient_id UUID REFERENCES patients(id), -- If family member is also a patient
    name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    medical_conditions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- HEALTHCARE STAFF TABLES
-- =====================================================

-- Doctors
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id VARCHAR(50) UNIQUE NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(100),
    qualification TEXT[],
    experience_years INTEGER,
    consultation_fee DECIMAL(10,2),
    available_slots JSONB, -- Weekly schedule
    telemedicine_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nurses
CREATE TABLE nurses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    nurse_id VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100),
    shift_type VARCHAR(20), -- morning, evening, night
    license_number VARCHAR(100),
    specialization VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Other staff (Admin, Pharmacy, Lab, etc.)
CREATE TABLE staff_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    staff_id VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    supervisor_id UUID REFERENCES staff_members(id),
    salary DECIMAL(10,2),
    hire_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- APPOINTMENTS & SCHEDULING
-- =====================================================

CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE appointment_type AS ENUM ('consultation', 'follow_up', 'emergency', 'telemedicine', 'procedure');

CREATE TABLE appointments (
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
);

-- =====================================================
-- MEDICAL RECORDS & CONSULTATIONS
-- =====================================================

CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    chief_complaint TEXT,
    history_of_present_illness TEXT,
    physical_examination JSONB,
    vital_signs JSONB, -- BP, temperature, pulse, etc.
    diagnosis TEXT[],
    treatment_plan TEXT,
    follow_up_instructions TEXT,
    next_appointment_date DATE,
    consultation_fee DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescriptions
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID REFERENCES consultations(id),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    prescription_number VARCHAR(50) UNIQUE NOT NULL,
    instructions TEXT,
    is_dispensed BOOLEAN DEFAULT FALSE,
    dispensed_at TIMESTAMP WITH TIME ZONE,
    dispensed_by UUID REFERENCES staff_members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescription medications
CREATE TABLE prescription_medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
    medication_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    instructions TEXT,
    quantity INTEGER,
    unit VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- LABORATORY & DIAGNOSTICS
-- =====================================================

CREATE TYPE lab_test_status AS ENUM ('ordered', 'sample_collected', 'in_progress', 'completed', 'cancelled');

CREATE TABLE lab_test_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    normal_range_text TEXT,
    unit VARCHAR(50),
    cost DECIMAL(10,2),
    preparation_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lab_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID REFERENCES consultations(id),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status lab_test_status DEFAULT 'ordered',
    urgent BOOLEAN DEFAULT FALSE,
    notes TEXT,
    total_cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lab_order_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_order_id UUID REFERENCES lab_orders(id) ON DELETE CASCADE,
    test_type_id UUID REFERENCES lab_test_types(id),
    sample_collected_at TIMESTAMP WITH TIME ZONE,
    collected_by UUID REFERENCES staff_members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lab_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_order_test_id UUID REFERENCES lab_order_tests(id) ON DELETE CASCADE,
    result_value VARCHAR(200),
    result_unit VARCHAR(50),
    reference_range VARCHAR(100),
    is_abnormal BOOLEAN DEFAULT FALSE,
    notes TEXT,
    verified_by UUID REFERENCES staff_members(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    report_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PHARMACY & INVENTORY
-- =====================================================

CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    brand_name VARCHAR(200),
    manufacturer VARCHAR(200),
    category VARCHAR(100),
    dosage_form VARCHAR(100), -- tablet, capsule, syrup, etc.
    strength VARCHAR(100),
    unit_price DECIMAL(10,2),
    requires_prescription BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medication_id UUID REFERENCES medications(id),
    batch_number VARCHAR(100) NOT NULL,
    quantity_available INTEGER NOT NULL DEFAULT 0,
    expiry_date DATE NOT NULL,
    cost_price DECIMAL(10,2),
    supplier VARCHAR(200),
    minimum_stock_level INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE pharmacy_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID REFERENCES prescriptions(id),
    patient_id UUID REFERENCES patients(id),
    pharmacist_id UUID REFERENCES staff_members(id),
    sale_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2),
    payment_method VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE pharmacy_sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES pharmacy_sales(id) ON DELETE CASCADE,
    medication_id UUID REFERENCES medications(id),
    inventory_id UUID REFERENCES inventory(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NURSING & PATIENT CARE
-- =====================================================

CREATE TABLE patient_admissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    admission_number VARCHAR(50) UNIQUE NOT NULL,
    admitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    discharged_at TIMESTAMP WITH TIME ZONE,
    ward VARCHAR(100),
    bed_number VARCHAR(20),
    admission_type VARCHAR(50), -- emergency, planned, transfer
    admitting_doctor_id UUID REFERENCES doctors(id),
    reason_for_admission TEXT,
    discharge_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE nursing_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    nurse_id UUID REFERENCES nurses(id),
    admission_id UUID REFERENCES patient_admissions(id),
    note_type VARCHAR(50), -- assessment, intervention, evaluation
    note_text TEXT NOT NULL,
    vital_signs JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE medication_administration (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    prescription_medication_id UUID REFERENCES prescription_medications(id),
    nurse_id UUID REFERENCES nurses(id),
    administered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    dose_given VARCHAR(100),
    route VARCHAR(50), -- oral, IV, IM, etc.
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FACILITY MANAGEMENT
-- =====================================================

CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TABLE facility_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_type VARCHAR(50) NOT NULL, -- cleaning, maintenance, repair
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    priority task_priority DEFAULT 'medium',
    status task_status DEFAULT 'pending',
    assigned_to UUID REFERENCES staff_members(id),
    requested_by UUID REFERENCES staff_members(id),
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_duration_hours INTEGER,
    actual_duration_hours INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment and maintenance tracking
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    model VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE,
    location VARCHAR(200),
    purchase_date DATE,
    warranty_expiry DATE,
    last_maintenance DATE,
    next_maintenance_due DATE,
    status VARCHAR(50) DEFAULT 'operational', -- operational, maintenance, broken, retired
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PROCUREMENT & VENDORS
-- =====================================================

CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    address JSONB,
    vendor_type VARCHAR(100), -- pharmaceutical, equipment, supplies
    tax_id VARCHAR(50),
    payment_terms VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE purchase_order_status AS ENUM ('draft', 'pending_approval', 'approved', 'ordered', 'delivered', 'cancelled');

CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(50) UNIQUE NOT NULL,
    vendor_id UUID REFERENCES vendors(id),
    requested_by UUID REFERENCES staff_members(id),
    approved_by UUID REFERENCES staff_members(id),
    status purchase_order_status DEFAULT 'draft',
    order_date DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    total_amount DECIMAL(12,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    item_name VARCHAR(200) NOT NULL,
    item_code VARCHAR(100),
    description TEXT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    received_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS & REPORTING
-- =====================================================

-- Disease tracking for public health
CREATE TABLE disease_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id),
    disease_code VARCHAR(20), -- ICD-10 codes
    disease_name VARCHAR(200),
    severity VARCHAR(50),
    is_infectious BOOLEAN DEFAULT FALSE,
    is_notifiable BOOLEAN DEFAULT FALSE, -- Requires government notification
    reported_by UUID REFERENCES doctors(id),
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    outbreak_related BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial transactions
CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_type VARCHAR(50) NOT NULL, -- payment, refund, insurance_claim
    patient_id UUID REFERENCES patients(id),
    consultation_id UUID REFERENCES consultations(id),
    prescription_id UUID REFERENCES prescriptions(id),
    lab_order_id UUID REFERENCES lab_orders(id),
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_reference VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    processed_by UUID REFERENCES staff_members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs for compliance
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- SELECT, INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MESSAGING & NOTIFICATIONS
-- =====================================================

CREATE TYPE message_type AS ENUM ('appointment_reminder', 'test_result', 'prescription_ready', 'general', 'emergency');
CREATE TYPE notification_status AS ENUM ('sent', 'delivered', 'read', 'failed');

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    message_type message_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    status notification_status DEFAULT 'sent',
    is_urgent BOOLEAN DEFAULT FALSE,
    delivery_method VARCHAR(50)[], -- email, sms, push, in_app
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Core user lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Patient lookups
CREATE INDEX idx_patients_patient_id ON patients(patient_id);
CREATE INDEX idx_patients_user_id ON patients(user_id);

-- Appointment queries
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Medical records
CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX idx_consultations_created_at ON consultations(created_at);

-- Prescriptions
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_prescription_number ON prescriptions(prescription_number);
CREATE INDEX idx_prescriptions_is_dispensed ON prescriptions(is_dispensed);

-- Lab orders
CREATE INDEX idx_lab_orders_patient_id ON lab_orders(patient_id);
CREATE INDEX idx_lab_orders_status ON lab_orders(status);
CREATE INDEX idx_lab_orders_created_at ON lab_orders(created_at);

-- Inventory management
CREATE INDEX idx_inventory_medication_id ON inventory(medication_id);
CREATE INDEX idx_inventory_expiry_date ON inventory(expiry_date);
CREATE INDEX idx_inventory_quantity_available ON inventory(quantity_available);

-- Audit and compliance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Analytics
CREATE INDEX idx_disease_reports_disease_code ON disease_reports(disease_code);
CREATE INDEX idx_disease_reports_reported_at ON disease_reports(reported_at);
CREATE INDEX idx_financial_transactions_patient_id ON financial_transactions(patient_id);
CREATE INDEX idx_financial_transactions_created_at ON financial_transactions(created_at); 