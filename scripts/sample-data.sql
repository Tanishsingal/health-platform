-- Sample data for healthcare platform development
-- Run this after the main schema is created

-- Insert sample users
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

-- Insert sample medications
INSERT INTO medications (name, generic_name, category, requires_prescription, unit_price) VALUES
('Paracetamol 500mg', 'Acetaminophen', 'Analgesic', false, 0.50),
('Amoxicillin 250mg', 'Amoxicillin', 'Antibiotic', true, 2.00),
('Metformin 500mg', 'Metformin', 'Antidiabetic', true, 1.50),
('Lisinopril 10mg', 'Lisinopril', 'ACE Inhibitor', true, 3.00),
('Ibuprofen 400mg', 'Ibuprofen', 'NSAID', false, 0.75);

-- Insert sample lab test types
INSERT INTO lab_test_types (name, category, normal_range_text, unit, cost) VALUES
('Complete Blood Count', 'Hematology', '4.5-11.0 x10³/µL', 'x10³/µL', 25.00),
('Blood Glucose (Fasting)', 'Chemistry', '70-100 mg/dL', 'mg/dL', 15.00),
('Lipid Panel', 'Chemistry', 'Total Cholesterol <200 mg/dL', 'mg/dL', 35.00),
('Thyroid Function (TSH)', 'Endocrinology', '0.4-4.0 mIU/L', 'mIU/L', 45.00),
('Liver Function Test', 'Chemistry', 'ALT: 7-56 U/L', 'U/L', 30.00);

-- Insert sample doctor
INSERT INTO doctors (id, user_id, doctor_id, specialization, license_number, department, consultation_fee) VALUES
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440002', 'DOC001', 'Internal Medicine', 'LIC123456', 'General Medicine', 100.00);

-- Insert sample patient
INSERT INTO patients (id, user_id, patient_id, blood_group) VALUES
('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440004', 'PAT001', 'O+');

-- Insert sample inventory
INSERT INTO inventory (medication_id, batch_number, quantity_available, expiry_date, cost_price, minimum_stock_level) 
SELECT id, 'BATCH001', 100, '2025-12-31'::date, unit_price * 0.8, 10
FROM medications;

COMMIT;