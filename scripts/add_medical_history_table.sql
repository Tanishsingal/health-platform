-- First, add missing columns to patients table if they don't exist
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS blood_type VARCHAR(10),
ADD COLUMN IF NOT EXISTS height_cm DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS allergies TEXT[],
ADD COLUMN IF NOT EXISTS chronic_conditions TEXT[],
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(100);

-- Add patient_documents table for medical history uploads
CREATE TABLE IF NOT EXISTS patient_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL, -- 'lab_report', 'prescription', 'radiology', 'discharge_summary', 'vaccination_record', 'other'
  document_name VARCHAR(255) NOT NULL,
  document_date DATE, -- Date when the medical event/report occurred
  document_data TEXT NOT NULL, -- Base64 encoded file data or file URL
  file_type VARCHAR(50) NOT NULL, -- 'pdf', 'jpg', 'png', 'docx', etc.
  file_size INTEGER, -- in bytes
  notes TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_patient_documents_patient_id ON patient_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_documents_type ON patient_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_patient_documents_date ON patient_documents(document_date DESC);
CREATE INDEX IF NOT EXISTS idx_patient_documents_uploaded_at ON patient_documents(uploaded_at DESC);

-- Add RLS policies for patient_documents
ALTER TABLE patient_documents ENABLE ROW LEVEL SECURITY;

-- Patients can view their own documents
CREATE POLICY patient_documents_select_policy ON patient_documents
  FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = current_setting('app.user_id')::UUID
    )
  );

-- Patients can insert their own documents
CREATE POLICY patient_documents_insert_policy ON patient_documents
  FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = current_setting('app.user_id')::UUID
    )
  );

-- Patients can delete their own documents
CREATE POLICY patient_documents_delete_policy ON patient_documents
  FOR DELETE
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = current_setting('app.user_id')::UUID
    )
  );

-- Doctors can view documents of their patients
CREATE POLICY patient_documents_doctor_select_policy ON patient_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      INNER JOIN doctors d ON a.doctor_id = d.id
      WHERE a.patient_id = patient_documents.patient_id
      AND d.user_id = current_setting('app.user_id')::UUID
    )
  );

-- Add comment for documentation
COMMENT ON TABLE patient_documents IS 'Stores patient-uploaded medical history documents and reports';
COMMENT ON COLUMN patient_documents.document_data IS 'Base64 encoded file data or storage URL'; 