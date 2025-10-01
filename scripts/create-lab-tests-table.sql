-- Create lab_tests table
CREATE TABLE IF NOT EXISTS lab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  ordered_by UUID REFERENCES doctors(id) ON DELETE CASCADE,
  test_name VARCHAR(200) NOT NULL,
  test_type VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'ordered',
  notes TEXT,
  ordered_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sample_collected_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  results JSONB,
  reference_ranges JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lab_tests_patient_id ON lab_tests(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_tests_ordered_by ON lab_tests(ordered_by);
CREATE INDEX IF NOT EXISTS idx_lab_tests_status ON lab_tests(status);
CREATE INDEX IF NOT EXISTS idx_lab_tests_ordered_date ON lab_tests(ordered_date DESC); 