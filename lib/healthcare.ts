export type UserRole =
  | "patient"
  | "doctor"
  | "nurse"
  | "admin"
  | "pharmacist"
  | "lab_technician"
  | "receptionist"
  | "insurance_staff"
  | "public_health_official"

export type AppointmentStatus = "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show"

export type PrescriptionStatus = "pending" | "filled" | "partially_filled" | "cancelled"

export type LabTestStatus = "ordered" | "sample_collected" | "in_progress" | "completed" | "cancelled"

export interface UserProfile {
  id: string
  role: UserRole
  first_name: string
  last_name: string
  phone?: string
  date_of_birth?: string
  gender?: string
  address?: any
  emergency_contact?: any
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  medical_record_number: string
  insurance_info?: any
  allergies?: string[]
  chronic_conditions?: string[]
  blood_type?: string
  height_cm?: number
  weight_kg?: number
  created_at: string
  updated_at: string
  user_profile?: UserProfile
}

export interface MedicalStaff {
  id: string
  license_number: string
  specialization?: string
  department?: string
  years_of_experience?: number
  qualifications?: string[]
  availability?: any
  created_at: string
  updated_at: string
  user_profile?: UserProfile
}

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  duration_minutes: number
  status: AppointmentStatus
  reason?: string
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
  patient?: Patient
  doctor?: MedicalStaff
}

export interface MedicalRecord {
  id: string
  patient_id: string
  doctor_id: string
  appointment_id?: string
  visit_date: string
  chief_complaint?: string
  diagnosis?: string
  treatment_plan?: string
  vital_signs?: any
  notes?: string
  created_at: string
  updated_at: string
  patient?: Patient
  doctor?: MedicalStaff
}

export interface Prescription {
  id: string
  patient_id: string
  doctor_id: string
  medical_record_id?: string
  medication_name: string
  dosage: string
  frequency: string
  duration?: string
  quantity?: number
  refills_remaining: number
  status: PrescriptionStatus
  instructions?: string
  created_at: string
  updated_at: string
  patient?: Patient
  doctor?: MedicalStaff
}

export interface LabTest {
  id: string
  patient_id: string
  ordered_by: string
  test_name: string
  test_type: string
  status: LabTestStatus
  ordered_date: string
  sample_collected_date?: string
  completed_date?: string
  results?: any
  reference_ranges?: any
  notes?: string
  created_at: string
  updated_at: string
  patient?: Patient
  ordered_by_staff?: MedicalStaff
}

export interface InventoryItem {
  id: string
  item_name: string
  item_type: string
  sku?: string
  current_stock: number
  minimum_stock: number
  unit_price?: number
  expiry_date?: string
  supplier?: string
  location?: string
  created_at: string
  updated_at: string
}
