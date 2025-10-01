-- Healthcare Platform Database Schema
-- This script creates the foundational tables for the healthcare platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for better data integrity
CREATE TYPE user_role AS ENUM (
  'patient',
  'doctor', 
  'nurse',
  'admin',
  'pharmacist',
  'lab_technician',
  'receptionist',
  'insurance_staff',
  'public_health_official'
);

CREATE TYPE appointment_status AS ENUM (
  'scheduled',
  'confirmed', 
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
);

CREATE TYPE prescription_status AS ENUM (
  'pending',
  'filled',
  'partially_filled',
  'cancelled'
);

CREATE TYPE lab_test_status AS ENUM (
  'ordered',
  'sample_collected',
  'in_progress',
  'completed',
  'cancelled'
);

-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  address JSONB,
  emergency_contact JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table (additional patient-specific data)
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  medical_record_number TEXT UNIQUE NOT NULL,
  insurance_info JSONB,
  allergies TEXT[],
  chronic_conditions TEXT[],
  blood_type TEXT,
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical staff table (doctors, nurses, etc.)
CREATE TABLE IF NOT EXISTS public.medical_staff (
  id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  license_number TEXT UNIQUE NOT NULL,
  specialization TEXT,
  department TEXT,
  years_of_experience INTEGER,
  qualifications TEXT[],
  availability JSONB, -- Store working hours, days off, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  doctor_id UUID NOT NULL REFERENCES public.medical_staff(id),
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status appointment_status DEFAULT 'scheduled',
  reason TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical records table
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  doctor_id UUID NOT NULL REFERENCES public.medical_staff(id),
  appointment_id UUID REFERENCES public.appointments(id),
  visit_date TIMESTAMP WITH TIME ZONE NOT NULL,
  chief_complaint TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  vital_signs JSONB, -- Store BP, temperature, pulse, etc.
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  doctor_id UUID NOT NULL REFERENCES public.medical_staff(id),
  medical_record_id UUID REFERENCES public.medical_records(id),
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT,
  quantity INTEGER,
  refills_remaining INTEGER DEFAULT 0,
  status prescription_status DEFAULT 'pending',
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab tests table
CREATE TABLE IF NOT EXISTS public.lab_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  ordered_by UUID NOT NULL REFERENCES public.medical_staff(id),
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL,
  status lab_test_status DEFAULT 'ordered',
  ordered_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sample_collected_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  results JSONB,
  reference_ranges JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory table (for pharmacy and medical supplies)
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_name TEXT NOT NULL,
  item_type TEXT NOT NULL, -- 'medication', 'medical_supply', 'equipment'
  sku TEXT UNIQUE,
  current_stock INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER NOT NULL DEFAULT 0,
  unit_price DECIMAL(10,2),
  expiry_date DATE,
  supplier TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log table for tracking changes
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES public.user_profiles(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_tests_patient_id ON public.lab_tests(patient_id);
CREATE INDEX IF NOT EXISTS idx_inventory_item_type ON public.inventory(item_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
