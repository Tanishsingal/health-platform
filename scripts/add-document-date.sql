-- Add document_date column to patient_documents table if it doesn't exist
ALTER TABLE patient_documents 
ADD COLUMN IF NOT EXISTS document_date DATE;

-- Add index for document_date
CREATE INDEX IF NOT EXISTS idx_patient_documents_date ON patient_documents(document_date DESC);

-- Update existing records to use uploaded_at as document_date if null
UPDATE patient_documents 
SET document_date = uploaded_at::DATE 
WHERE document_date IS NULL; 