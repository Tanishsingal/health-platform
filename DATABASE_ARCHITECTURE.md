# 🗄️ Database Architecture - Complete Guide

## 📊 **System Overview**

This healthcare platform uses a **multi-level user system** where user data is spread across multiple related tables. Understanding this architecture is crucial to understanding how the system works.

---

## 🏗️ **Table Structure & Relationships**

### **Visual Hierarchy**

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS                                │
│  Primary Key: id (UUID)                                      │
│  Purpose: Authentication & Role Assignment                   │
│                                                               │
│  Columns:                                                    │
│  • id: UUID (primary key)                                   │
│  • email: VARCHAR(255) (unique)                             │
│  • password_hash: VARCHAR(255)                              │
│  • role: VARCHAR(50) - doctor, patient, nurse, admin, etc.  │
│  • status: VARCHAR(20) - active, suspended, deleted         │
│  • email_verified: BOOLEAN                                  │
│  • created_at, updated_at: TIMESTAMP                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ (1:1 relationship via user_id)
                   │
    ┌──────────────┴──────────────┬──────────────────────────┐
    │                             │                          │
    ▼                             ▼                          ▼
┌─────────────────┐    ┌─────────────────┐      ┌─────────────────┐
│ USER_PROFILES   │    │    DOCTORS      │      │    PATIENTS     │
│ (ALL users)     │    │ (role=doctor)   │      │ (role=patient)  │
├─────────────────┤    ├─────────────────┤      ├─────────────────┤
│ id: UUID (PK)   │    │ id: UUID (PK)   │      │ id: UUID (PK)   │
│ user_id → users │    │ user_id → users │      │ user_id → users │
│ first_name      │    │ specialization  │      │ patient_id      │
│ last_name       │    │ license_number  │      │ medical_record_ │
│ phone           │    │ department      │      │   number        │
│ date_of_birth   │    │ consultation_   │      │ insurance_info  │
│ gender          │    │   fee           │      │ blood_type      │
│ address         │    │ available_days  │      │ allergies       │
│ emergency_      │    │ created_at      │      │ created_at      │
│   contact       │    │ updated_at      │      │ updated_at      │
└─────────────────┘    └─────────────────┘      └────────┬────────┘
                                │                         │
                                │                         │
                                └────────┬────────────────┘
                                         │
                         ┌───────────────┴────────────────┐
                         │                                │
                         ▼                                ▼
              ┌─────────────────────┐        ┌────────────────────┐
              │   APPOINTMENTS      │        │   PRESCRIPTIONS    │
              ├─────────────────────┤        ├────────────────────┤
              │ id: UUID (PK)       │        │ id: UUID (PK)      │
              │ patient_id → patients│       │ patient_id → patients│
              │ doctor_id → doctors │        │ doctor_id → doctors│
              │ appointment_date    │        │ medication_id      │
              │ duration_minutes    │        │ dosage             │
              │ reason              │        │ frequency          │
              │ status              │        │ duration_days      │
              │ notes               │        │ instructions       │
              │ created_at          │        │ status             │
              │ updated_at          │        │ prescribed_date    │
              └─────────────────────┘        └────────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │  MEDICAL_RECORDS    │
              ├─────────────────────┤
              │ id: UUID (PK)       │
              │ patient_id → patients│
              │ doctor_id → doctors │
              │ visit_date          │
              │ diagnosis           │
              │ symptoms            │
              │ treatment           │
              │ notes               │
              │ created_at          │
              │ updated_at          │
              └─────────────────────┘
```

---

## 🔑 **Understanding the Multi-Level System**

### **Level 1: Authentication (`users` table)**
Every person in the system has **exactly ONE** record in the `users` table.

**Purpose:**
- Store login credentials (email + password_hash)
- Assign role (doctor, patient, nurse, pharmacist, etc.)
- Track account status (active, suspended, etc.)

**Example:**
```sql
INSERT INTO users (id, email, password_hash, role, status)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'john.doe@hospital.com',
  '$2a$12$encrypted...',
  'patient',
  'active'
);
```

---

### **Level 2: Personal Information (`user_profiles` table)**
Every user has **exactly ONE** profile record with personal details.

**Purpose:**
- Store common personal information (name, phone, DOB, etc.)
- Information that ALL roles need (doctor, patient, nurse, etc.)

**Example:**
```sql
INSERT INTO user_profiles (id, user_id, first_name, last_name, phone)
VALUES (
  '223e4567-e89b-12d3-a456-426614174000',
  '123e4567-e89b-12d3-a456-426614174000', -- Links to users.id
  'John',
  'Doe',
  '+1234567890'
);
```

---

### **Level 3: Role-Specific Data (`doctors` / `patients` tables)**
Only users with specific roles get records in these tables.

**Purpose:**
- Store data unique to each role
- Doctors: specialization, license number, department
- Patients: medical record number, insurance, blood type

**Example (Patient):**
```sql
-- Only created if users.role = 'patient'
INSERT INTO patients (id, user_id, medical_record_number)
VALUES (
  '323e4567-e89b-12d3-a456-426614174000',
  '123e4567-e89b-12d3-a456-426614174000', -- Links to users.id
  'PAT-2025-001'
);
```

**Example (Doctor):**
```sql
-- Only created if users.role = 'doctor'
INSERT INTO doctors (id, user_id, specialization, license_number, department)
VALUES (
  '423e4567-e89b-12d3-a456-426614174000',
  '456e4567-e89b-12d3-a456-426614174001', -- Links to users.id
  'Cardiology',
  'MD-12345',
  'Medical'
);
```

---

## 🔄 **Complete Registration Flow**

### **What Happens When a Patient Registers?**

```typescript
// User submits registration form
{
  email: "jane@example.com",
  password: "password123",
  role: "patient",
  firstName: "Jane",
  lastName: "Smith"
}

// Step 1: lib/auth.ts - Create user record
const userResult = await query(
  `INSERT INTO users (email, password_hash, role, status) 
   VALUES ($1, $2, $3, 'active') RETURNING *`,
  ['jane@example.com', hashedPassword, 'patient']
);
const user = userResult.rows[0]; // { id: 'abc-123', email: 'jane@...', role: 'patient' }

// Step 2: lib/auth.ts - Create profile record
const profileResult = await query(
  `INSERT INTO user_profiles (user_id, first_name, last_name) 
   VALUES ($1, $2, $3) RETURNING *`,
  [user.id, 'Jane', 'Smith']
);

// Step 3: lib/auth.ts - Create role-specific record (AUTOMATIC!)
if (role === 'patient') {
  await query(
    `INSERT INTO patients (user_id, medical_record_number) 
     VALUES ($1, $2)`,
    [user.id, `PAT-${Date.now()}`]
  );
}

// Step 4: Generate JWT token and return
const token = await generateToken({ userId: user.id, email: user.email, role: user.role });
return { user, profile, token };
```

**Result:**
- ✅ 1 record in `users` table
- ✅ 1 record in `user_profiles` table
- ✅ 1 record in `patients` table
- ✅ User can immediately login and access patient dashboard

---

## 🔍 **Dashboard Data Retrieval Flow**

### **What Happens When a Patient Accesses Their Dashboard?**

```typescript
// GET /api/patient/dashboard

// Step 1: Verify authentication from cookie
const token = request.cookies.get('auth-token');
const payload = await verifyToken(token);
// payload = { userId: 'abc-123', email: 'jane@...', role: 'patient' }

// Step 2: Verify user role
const userResult = await query(
  'SELECT role FROM users WHERE id = $1 AND status = $2',
  [payload.userId, 'active']
);
if (userResult.rows[0].role !== 'patient') {
  return 401; // Unauthorized
}

// Step 3: Get patient record with profile (JOIN query)
const patientResult = await query(`
  SELECT 
    p.*,
    up.first_name,
    up.last_name,
    up.phone,
    up.date_of_birth,
    up.gender
  FROM patients p
  LEFT JOIN user_profiles up ON p.user_id = up.user_id
  WHERE p.user_id = $1
`, [payload.userId]);

if (patientResult.rows.length === 0) {
  return 404; // Patient record not found (should never happen with auto-creation!)
}

const patient = patientResult.rows[0];

// Step 4: Get related data
const appointments = await query(
  'SELECT * FROM appointments WHERE patient_id = $1 ORDER BY appointment_date',
  [patient.id]
);

const prescriptions = await query(
  'SELECT * FROM prescriptions WHERE patient_id = $1 AND status = $2',
  [patient.id, 'pending']
);

const medicalRecords = await query(
  'SELECT * FROM medical_records WHERE patient_id = $1 ORDER BY visit_date DESC LIMIT 5',
  [patient.id]
);

// Step 5: Return combined data
return {
  profile: patient,
  upcomingAppointments: appointments.rows,
  activePrescriptions: prescriptions.rows,
  recentRecords: medicalRecords.rows
};
```

---

## ❌ **The Problem We Fixed**

### **Old System (BROKEN):**
```typescript
// registerUser only created user + profile
async function registerUser(email, password, role) {
  // Create user
  const user = await query('INSERT INTO users ... RETURNING *');
  
  // Create profile
  const profile = await query('INSERT INTO user_profiles ... RETURNING *');
  
  // ❌ MISSING: No role-specific record created!
  
  return { user, profile };
}

// Later when patient tries to access dashboard...
const patient = await query('SELECT * FROM patients WHERE user_id = $1');
// ❌ Returns empty! No patient record exists!
// → Frontend gets 404 error
```

### **New System (FIXED):**
```typescript
// registerUser creates user + profile + role record
async function registerUser(email, password, role) {
  // Create user
  const user = await query('INSERT INTO users ... RETURNING *');
  
  // Create profile
  const profile = await query('INSERT INTO user_profiles ... RETURNING *');
  
  // ✅ NEW: Auto-create role-specific record
  if (role === 'patient') {
    await query(
      'INSERT INTO patients (user_id, medical_record_number) VALUES ($1, $2)',
      [user.id, `PAT-${Date.now()}`]
    );
  } else if (role === 'doctor') {
    await query(
      'INSERT INTO doctors (user_id, specialization, license_number, department) VALUES ($1, $2, $3, $4)',
      [user.id, 'General Practice', `MD-${Date.now()}`, 'Medical']
    );
  }
  
  return { user, profile };
}

// Later when patient tries to access dashboard...
const patient = await query('SELECT * FROM patients WHERE user_id = $1');
// ✅ Returns patient record! Exists from registration!
// → Frontend gets data successfully
```

---

## 🎯 **Why This Architecture?**

### **1. Separation of Concerns**
- **Authentication data** (users) is separate from **profile data** (user_profiles)
- **Role-specific data** (doctors/patients) is separate from **common data**
- Each table has a single, clear responsibility

### **2. Data Integrity**
```sql
-- Foreign keys enforce referential integrity
ALTER TABLE user_profiles 
  ADD CONSTRAINT fk_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE patients 
  ADD CONSTRAINT fk_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- If a user is deleted, their profile and patient record are also deleted automatically
```

### **3. Flexibility & Scalability**
Easy to add new roles without changing existing tables:
```typescript
if (role === 'nurse') {
  await query(
    'INSERT INTO nurses (user_id, shift, department) VALUES ($1, $2, $3)',
    [user.id, 'day', 'Emergency']
  );
} else if (role === 'pharmacist') {
  await query(
    'INSERT INTO pharmacists (user_id, license_number, pharmacy_id) VALUES ($1, $2, $3)',
    [user.id, `PH-${Date.now()}`, pharmacyId]
  );
}
```

### **4. Performance**
```sql
-- Only query role tables when needed
-- Don't need to query doctors table for patient dashboard
SELECT * FROM patients WHERE user_id = $1;

-- Don't need to query patients table for doctor dashboard
SELECT * FROM doctors WHERE user_id = $1;
```

---

## 📊 **Current Implementation Status**

### **Automatic Role Record Creation**
✅ Implemented in `lib/auth.ts` (lines 238-253)

**Supported Roles:**
- ✅ **Patient**: Auto-creates `patients` record with `medical_record_number`
- ✅ **Doctor**: Auto-creates `doctors` record with specialization, license, department
- ⚠️ **Nurse**: Currently redirects to dedicated dashboard, but no `nurses` table yet
- ⚠️ **Pharmacist**: No auto-creation yet
- ⚠️ **Lab Technician**: No auto-creation yet
- ⚠️ **Admin**: No auto-creation yet

### **Dashboard APIs**
- ✅ `/api/patient/dashboard` - Fetches patient profile + appointments + prescriptions + records
- ✅ `/api/doctor/dashboard` - Fetches doctor profile + appointments + patients + stats
- ⚠️ `/api/nurse/dashboard` - Not implemented yet
- ⚠️ `/api/pharmacy/dashboard` - Not implemented yet

---

## 🧪 **Testing the Complete Flow**

### **Test 1: New Patient Registration**
```bash
1. Go to http://localhost:3000/auth/register
2. Fill in:
   - Email: testpatient@example.com
   - Password: password123
   - Role: Patient
   - First Name: Test
   - Last Name: Patient
3. Click "Create Account"

Expected Result:
✅ Redirected to /patient
✅ Dashboard loads with empty states (no 404!)
✅ Database check shows:
   - 1 record in users (role='patient')
   - 1 record in user_profiles
   - 1 record in patients (auto-created!)
```

### **Test 2: New Doctor Registration**
```bash
1. Go to http://localhost:3000/auth/register
2. Fill in:
   - Email: testdoctor@example.com
   - Password: password123
   - Role: Doctor
   - First Name: Test
   - Last Name: Doctor
3. Click "Create Account"

Expected Result:
✅ Redirected to /doctor
✅ Dashboard loads with empty states (no 404!)
✅ Database check shows:
   - 1 record in users (role='doctor')
   - 1 record in user_profiles
   - 1 record in doctors (auto-created!)
```

### **Verify in Database**
```bash
# Run this script to check all users and their role records
node scripts/check-users.js

Expected Output:
📋 All Users:
   - testpatient@example.com (patient) ID: xxx

👨‍⚕️ Doctor Records:
   - testdoctor@example.com

🤒 Patient Records:
   - testpatient@example.com
```

---

## 🔐 **Security Considerations**

### **Data Access Control**
```typescript
// Users can only access their own data
const patient = await query(
  'SELECT * FROM patients WHERE user_id = $1', // ✅ Uses authenticated user's ID
  [authenticatedUserId] // From JWT token
);

// Never trust user input for IDs
// ❌ BAD: 'SELECT * FROM patients WHERE id = $1', [req.body.patientId]
// ✅ GOOD: 'SELECT * FROM patients WHERE user_id = $1', [authUserId]
```

### **Role Verification**
```typescript
// Always verify role matches expected
const user = await query('SELECT role FROM users WHERE id = $1', [userId]);
if (user.role !== 'patient') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### **SQL Injection Protection**
```typescript
// ✅ ALWAYS use parameterized queries
await query('SELECT * FROM users WHERE email = $1', [email]);

// ❌ NEVER concatenate user input
await query(`SELECT * FROM users WHERE email = '${email}'`); // DANGEROUS!
```

---

## 📚 **Related Files**

- **Database Connection**: `lib/database.ts`
- **Authentication Logic**: `lib/auth.ts`
- **Patient Dashboard API**: `app/api/patient/dashboard/route.ts`
- **Doctor Dashboard API**: `app/api/doctor/dashboard/route.ts`
- **Registration API**: `app/api/auth/register/route.ts`
- **Migration Scripts**: `scripts/migrate.js`
- **Seed Data**: `scripts/seed.js`

---

**Last Updated:** 2025-09-30  
**Status:** ✅ PRODUCTION READY  
**Auto-Creation:** ✅ IMPLEMENTED FOR DOCTORS & PATIENTS 