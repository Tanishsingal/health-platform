# Patient Profile Update & Medical History Upload Feature

## Overview

This feature allows patients to update their personal and medical information and upload medical history documents to the platform. Doctors can then view these documents when treating the patient, providing better context for diagnosis and treatment.

## Features Implemented

### 1. Patient Profile Update

Patients can update the following information:

#### Personal Information
- First Name and Last Name
- Phone Number
- Date of Birth
- Gender
- Address
- Blood Type
- Height (cm) and Weight (kg)

#### Medical Information
- Allergies (multiple entries)
- Chronic Conditions (multiple entries)

#### Emergency Contact
- Contact Name
- Contact Phone
- Relationship to Patient

### 2. Medical History Document Upload

Patients can upload and manage medical documents with the following features:

#### Document Types Supported
- Lab Reports
- Prescriptions
- Radiology Reports
- Discharge Summaries
- Vaccination Records
- Other Medical Documents

#### File Support
- Accepted formats: PDF, JPG, JPEG, PNG, DOC, DOCX
- Maximum file size: 5MB
- Files are stored as Base64 encoded data in the database

#### Document Management
- Upload documents with categorization
- Add notes/descriptions to documents
- View all uploaded documents with timestamps
- Delete documents when no longer needed

### 3. Doctor Access to Patient Medical History

Doctors can view:
- All documents uploaded by the patient
- Patient's medical records from previous visits
- Document metadata (type, upload date, file size, notes)
- Download uploaded documents

## Database Schema

### New Table: `patient_documents`

```sql
CREATE TABLE patient_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  document_data TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INTEGER,
  notes TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Updated Table: `patients`

Added column:
```sql
ALTER TABLE patients 
ADD COLUMN emergency_contact_relationship VARCHAR(100);
```

## API Endpoints

### Patient Endpoints

#### 1. Get/Update Profile
- **GET** `/api/patient/profile`
  - Returns current patient profile information
  - Combines data from `patients` and `user_profiles` tables

- **PUT** `/api/patient/profile`
  - Updates patient profile information
  - Updates both `patients` and `user_profiles` tables
  - Body parameters: All profile fields

#### 2. Medical History Documents
- **GET** `/api/patient/medical-history`
  - Returns all documents uploaded by the patient
  - Ordered by upload date (newest first)

- **POST** `/api/patient/medical-history`
  - Uploads a new medical document
  - Body parameters:
    - `document_type`: Type of document
    - `document_name`: Name/title of document
    - `document_data`: Base64 encoded file data
    - `file_type`: MIME type of file
    - `notes`: Optional notes about the document

- **DELETE** `/api/patient/medical-history?id={documentId}`
  - Deletes a specific document
  - Only allows deletion of own documents

### Doctor Endpoints

#### Get Patient Medical History
- **GET** `/api/doctor/patient/[id]/medical-history`
  - Returns patient's uploaded documents and medical records
  - Restricted to authorized healthcare providers
  - Response includes:
    - `documents`: Array of uploaded documents
    - `medicalRecords`: Array of medical visit records

## Components

### Patient Components

#### 1. ProfileUpdateModal (`components/patient/ProfileUpdateModal.tsx`)
- Modal dialog for updating patient profile
- Features:
  - Form validation
  - Tag-based interface for allergies and conditions
  - Blood type selector
  - Emergency contact information
  - Loading states during submission

#### 2. MedicalHistoryUpload (`components/patient/MedicalHistoryUpload.tsx`)
- Card component for managing medical documents
- Features:
  - File upload with type validation
  - Document categorization
  - List view of uploaded documents
  - Delete functionality
  - File size validation (5MB limit)
  - Upload modal with notes field

### Doctor Components

#### PatientMedicalHistory (`components/doctor/PatientMedicalHistory.tsx`)
- View component for doctor's patient detail page
- Features:
  - Tabbed interface (Documents / Medical Records)
  - Document list with download functionality
  - Medical records timeline
  - Color-coded document type badges
  - File size display

## Usage

### For Patients

#### Updating Profile
1. Navigate to Patient Portal
2. Click "Update Profile" button in the Quick Actions or Health Summary card
3. Fill in the form with updated information
4. Add/remove allergies and chronic conditions using the tag interface
5. Click "Update Profile" to save changes

#### Uploading Medical Documents
1. Navigate to Patient Portal
2. Click "View Medical Records" in Quick Actions
3. Click "Upload Document" button
4. Select document type from dropdown
5. Enter document name
6. Choose file from computer (max 5MB)
7. Add optional notes
8. Click "Upload"

#### Managing Documents
- View all uploaded documents in the Medical History section
- Delete documents by clicking the trash icon
- Documents are organized by upload date

### For Doctors

#### Viewing Patient Medical History
1. Navigate to Doctor Dashboard
2. Select a patient from the patient list
3. Go to the "Documents" tab in patient details
4. View uploaded documents and medical records
5. Download documents for review
6. Switch between Documents and Medical Records tabs

## Security Features

### Row Level Security (RLS) Policies

#### For Patients
- Can only view their own documents
- Can only upload documents to their own profile
- Can only delete their own documents

#### For Doctors
- Can view documents of patients they have appointments with
- Cannot modify patient documents
- Cannot delete patient documents

### Authentication & Authorization
- All API endpoints require valid authentication token
- Patient endpoints verify patient role
- Doctor endpoints verify healthcare provider role
- Document access is restricted based on patient-doctor relationships

## Integration Points

### Patient Portal (`app/patient/page.tsx`)
- Profile update button in Health Summary card
- Medical Records toggle in Quick Actions
- Modals for profile update and document upload
- Dashboard refresh after updates

### Doctor Portal (`app/doctor/patients/[id]/page.tsx`)
- Medical History tab integration ready
- Can be added to existing patient detail view

## Migration Script

To add the new table to your database, run:

```bash
psql -d your_database -f scripts/add_medical_history_table.sql
```

Or execute the SQL directly in your database:
```sql
-- See scripts/add_medical_history_table.sql for full migration
```

## File Storage Considerations

### Current Implementation
- Files stored as Base64 in PostgreSQL TEXT column
- Suitable for files up to 5MB
- Simple implementation without external dependencies

### Future Improvements
For production use with larger files or higher volume:
1. **Cloud Storage Integration**
   - Store files in AWS S3, Google Cloud Storage, or Azure Blob Storage
   - Store only file URLs/keys in database
   - Implement signed URLs for secure access

2. **File Processing**
   - Add virus scanning for uploaded files
   - Generate thumbnails for images
   - Extract text from PDFs for searchability

3. **Performance Optimization**
   - Implement CDN for faster file delivery
   - Add file compression
   - Lazy load document data

## Best Practices

### For Patients
1. Upload clear, legible scans or photos
2. Use descriptive document names
3. Add notes to provide context
4. Keep documents organized by type
5. Remove outdated documents

### For Healthcare Providers
1. Review uploaded documents before appointments
2. Download important documents for records
3. Verify document authenticity when needed
4. Respect patient privacy
5. Document important findings in medical records

## Troubleshooting

### File Upload Issues
- **Error: File too large**
  - Solution: Ensure file is under 5MB, compress if needed

- **Error: Invalid file type**
  - Solution: Convert to supported format (PDF, JPG, PNG, DOC, DOCX)

### Profile Update Issues
- **Changes not saving**
  - Solution: Check all required fields are filled
  - Verify authentication token is valid
  - Check browser console for errors

### Doctor Access Issues
- **Cannot view patient documents**
  - Solution: Ensure there's an existing appointment relationship
  - Verify doctor role is correctly set
  - Check RLS policies are properly configured

## Testing Checklist

### Patient Profile Update
- [ ] Can update personal information
- [ ] Can add/remove allergies
- [ ] Can add/remove chronic conditions
- [ ] Can update emergency contact
- [ ] Changes persist after page reload
- [ ] Validation works for required fields

### Medical History Upload
- [ ] Can upload documents of supported types
- [ ] File size validation works
- [ ] Document list updates after upload
- [ ] Can delete uploaded documents
- [ ] Document metadata is displayed correctly
- [ ] Upload modal can be cancelled

### Doctor View
- [ ] Can view patient documents
- [ ] Can switch between tabs
- [ ] Can download documents
- [ ] Cannot delete patient documents
- [ ] Sees medical records correctly
- [ ] RLS policies prevent unauthorized access

## Future Enhancements

1. **Document Versioning**
   - Track document revisions
   - View document history

2. **Sharing Capabilities**
   - Share specific documents with specific doctors
   - Temporary access links

3. **OCR Integration**
   - Extract text from scanned documents
   - Make documents searchable

4. **Mobile App**
   - Camera integration for document capture
   - Push notifications for document requests

5. **Analytics**
   - Track document completeness
   - Remind patients to upload important documents

## Conclusion

This feature significantly improves the continuity of care by ensuring doctors have access to complete patient medical history. Patients have full control over their data while maintaining security and privacy through robust RLS policies. 