// =====================================================
// COMPREHENSIVE HEALTHCARE PLATFORM TYPES
// Supporting all stakeholders and workflows
// =====================================================

// =====================================================
// CORE USER TYPES
// =====================================================

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  ADMIN_STAFF = 'admin_staff',
  PHARMACIST = 'pharmacist',
  LAB_TECHNICIAN = 'lab_technician',
  CLEANING_STAFF = 'cleaning_staff',
  MAINTENANCE_STAFF = 'maintenance_staff',
  SALES_PROCUREMENT = 'sales_procurement',
  PUBLIC_HEALTH_ADMIN = 'public_health_admin',
  SUPER_ADMIN = 'super_admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification'
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  profilePictureUrl?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
  nationalId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

// =====================================================
// PATIENT TYPES
// =====================================================

export interface Patient {
  id: string;
  userId: string;
  patientId: string; // Hospital-generated ID
  bloodGroup?: string;
  heightCm?: number;
  weightKg?: number;
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  profile?: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientFamilyMember {
  id: string;
  patientId: string;
  memberPatientId?: string; // If family member is also a patient
  name: string;
  relationship: string;
  dateOfBirth?: Date;
  medicalConditions?: string[];
  createdAt: Date;
}

// =====================================================
// HEALTHCARE STAFF TYPES
// =====================================================

export interface Doctor {
  id: string;
  userId: string;
  doctorId: string;
  specialization: string;
  licenseNumber: string;
  department?: string;
  qualification?: string[];
  experienceYears?: number;
  consultationFee?: number;
  availableSlots?: WeeklySchedule;
  telemedicineEnabled: boolean;
  profile?: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface Nurse {
  id: string;
  userId: string;
  nurseId: string;
  department?: string;
  shiftType?: 'morning' | 'evening' | 'night';
  licenseNumber?: string;
  specialization?: string;
  profile?: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffMember {
  id: string;
  userId: string;
  staffId: string;
  department: string;
  position: string;
  supervisorId?: string;
  salary?: number;
  hireDate?: Date;
  profile?: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklySchedule {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface DaySchedule {
  startTime: string; // HH:MM format
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  isAvailable: boolean;
}

// =====================================================
// APPOINTMENT TYPES
// =====================================================

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export enum AppointmentType {
  CONSULTATION = 'consultation',
  FOLLOW_UP = 'follow_up',
  EMERGENCY = 'emergency',
  TELEMEDICINE = 'telemedicine',
  PROCEDURE = 'procedure'
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  scheduledAt: Date;
  durationMinutes: number;
  reasonForVisit?: string;
  notes?: string;
  telemedicineLink?: string;
  patient?: Patient;
  doctor?: Doctor;
  createdAt: Date;
  updatedAt: Date;
}

// =====================================================
// MEDICAL RECORD TYPES
// =====================================================

export interface Consultation {
  id: string;
  appointmentId?: string;
  patientId: string;
  doctorId: string;
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  physicalExamination?: Record<string, any>;
  vitalSigns?: VitalSigns;
  diagnosis?: string[];
  treatmentPlan?: string;
  followUpInstructions?: string;
  nextAppointmentDate?: Date;
  consultationFee?: number;
  patient?: Patient;
  doctor?: Doctor;
  appointment?: Appointment;
  createdAt: Date;
  updatedAt: Date;
}

export interface VitalSigns {
  temperature?: number; // Celsius
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number; // BPM
  respiratoryRate?: number;
  oxygenSaturation?: number; // Percentage
  weight?: number; // kg
  height?: number; // cm
  bmi?: number;
}

// =====================================================
// PRESCRIPTION TYPES
// =====================================================

export interface Prescription {
  id: string;
  consultationId?: string;
  patientId: string;
  doctorId: string;
  prescriptionNumber: string;
  instructions?: string;
  isDispensed: boolean;
  dispensedAt?: Date;
  dispensedBy?: string;
  medications: PrescriptionMedication[];
  patient?: Patient;
  doctor?: Doctor;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrescriptionMedication {
  id: string;
  prescriptionId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity?: number;
  unit?: string;
  createdAt: Date;
}

// =====================================================
// LABORATORY TYPES
// =====================================================

export enum LabTestStatus {
  ORDERED = 'ordered',
  SAMPLE_COLLECTED = 'sample_collected',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface LabTestType {
  id: string;
  name: string;
  category?: string;
  normalRangeText?: string;
  unit?: string;
  cost?: number;
  preparationInstructions?: string;
  createdAt: Date;
}

export interface LabOrder {
  id: string;
  consultationId?: string;
  patientId: string;
  doctorId: string;
  orderNumber: string;
  status: LabTestStatus;
  urgent: boolean;
  notes?: string;
  totalCost?: number;
  tests: LabOrderTest[];
  patient?: Patient;
  doctor?: Doctor;
  createdAt: Date;
  updatedAt: Date;
}

export interface LabOrderTest {
  id: string;
  labOrderId: string;
  testTypeId: string;
  sampleCollectedAt?: Date;
  collectedBy?: string;
  testType?: LabTestType;
  result?: LabResult;
  createdAt: Date;
}

export interface LabResult {
  id: string;
  labOrderTestId: string;
  resultValue?: string;
  resultUnit?: string;
  referenceRange?: string;
  isAbnormal: boolean;
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  reportUrl?: string;
  createdAt: Date;
}

// =====================================================
// PHARMACY TYPES
// =====================================================

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  brandName?: string;
  manufacturer?: string;
  category?: string;
  dosageForm?: string; // tablet, capsule, syrup, etc.
  strength?: string;
  unitPrice?: number;
  requiresPrescription: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Inventory {
  id: string;
  medicationId: string;
  batchNumber: string;
  quantityAvailable: number;
  expiryDate: Date;
  costPrice?: number;
  supplier?: string;
  minimumStockLevel: number;
  medication?: Medication;
  createdAt: Date;
  updatedAt: Date;
}

export interface PharmacySale {
  id: string;
  prescriptionId?: string;
  patientId?: string;
  pharmacistId: string;
  saleNumber: string;
  totalAmount: number;
  paymentMethod?: string;
  items: PharmacySaleItem[];
  patient?: Patient;
  pharmacist?: StaffMember;
  createdAt: Date;
}

export interface PharmacySaleItem {
  id: string;
  saleId: string;
  medicationId: string;
  inventoryId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  medication?: Medication;
  createdAt: Date;
}

// =====================================================
// NURSING TYPES
// =====================================================

export interface PatientAdmission {
  id: string;
  patientId: string;
  admissionNumber: string;
  admittedAt: Date;
  dischargedAt?: Date;
  ward?: string;
  bedNumber?: string;
  admissionType?: string; // emergency, planned, transfer
  admittingDoctorId?: string;
  reasonForAdmission?: string;
  dischargeSummary?: string;
  patient?: Patient;
  admittingDoctor?: Doctor;
  createdAt: Date;
  updatedAt: Date;
}

export interface NursingNote {
  id: string;
  patientId: string;
  nurseId: string;
  admissionId?: string;
  noteType?: string; // assessment, intervention, evaluation
  noteText: string;
  vitalSigns?: VitalSigns;
  patient?: Patient;
  nurse?: Nurse;
  createdAt: Date;
}

export interface MedicationAdministration {
  id: string;
  patientId: string;
  prescriptionMedicationId: string;
  nurseId: string;
  administeredAt: Date;
  doseGiven?: string;
  route?: string; // oral, IV, IM, etc.
  notes?: string;
  patient?: Patient;
  nurse?: Nurse;
  createdAt: Date;
}

// =====================================================
// FACILITY MANAGEMENT TYPES
// =====================================================

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface FacilityTask {
  id: string;
  taskType: string; // cleaning, maintenance, repair
  title: string;
  description?: string;
  location?: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo?: string;
  requestedBy?: string;
  dueDate?: Date;
  completedAt?: Date;
  estimatedDurationHours?: number;
  actualDurationHours?: number;
  assignedStaff?: StaffMember;
  requester?: StaffMember;
  createdAt: Date;
  updatedAt: Date;
}

export interface Equipment {
  id: string;
  name: string;
  model?: string;
  serialNumber?: string;
  location?: string;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  lastMaintenance?: Date;
  nextMaintenanceDue?: Date;
  status: string; // operational, maintenance, broken, retired
  createdAt: Date;
  updatedAt: Date;
}

// =====================================================
// PROCUREMENT TYPES
// =====================================================

export interface Vendor {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: Address;
  vendorType?: string; // pharmaceutical, equipment, supplies
  taxId?: string;
  paymentTerms?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  ORDERED = 'ordered',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  requestedBy: string;
  approvedBy?: string;
  status: PurchaseOrderStatus;
  orderDate?: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  totalAmount?: number;
  notes?: string;
  items: PurchaseOrderItem[];
  vendor?: Vendor;
  requester?: StaffMember;
  approver?: StaffMember;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  itemName: string;
  itemCode?: string;
  description?: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  receivedQuantity: number;
  createdAt: Date;
}

// =====================================================
// ANALYTICS TYPES
// =====================================================

export interface DiseaseReport {
  id: string;
  patientId?: string;
  diseaseCode?: string; // ICD-10 codes
  diseaseName?: string;
  severity?: string;
  isInfectious: boolean;
  isNotifiable: boolean; // Requires government notification
  reportedBy?: string;
  reportedAt: Date;
  outbreakRelated: boolean;
  patient?: Patient;
  reporter?: Doctor;
  createdAt: Date;
}

export interface FinancialTransaction {
  id: string;
  transactionType: string; // payment, refund, insurance_claim
  patientId?: string;
  consultationId?: string;
  prescriptionId?: string;
  labOrderId?: string;
  amount: number;
  paymentMethod?: string;
  transactionReference?: string;
  status: string;
  processedBy?: string;
  patient?: Patient;
  processor?: StaffMember;
  createdAt: Date;
  updatedAt: Date;
}

// =====================================================
// NOTIFICATION TYPES
// =====================================================

export enum MessageType {
  APPOINTMENT_REMINDER = 'appointment_reminder',
  TEST_RESULT = 'test_result',
  PRESCRIPTION_READY = 'prescription_ready',
  GENERAL = 'general',
  EMERGENCY = 'emergency'
}

export enum NotificationStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

export interface Notification {
  id: string;
  recipientId: string;
  senderId?: string;
  messageType: MessageType;
  title: string;
  content: string;
  status: NotificationStatus;
  isUrgent: boolean;
  deliveryMethod: string[]; // email, sms, push, in_app
  scheduledFor?: Date;
  sentAt?: Date;
  readAt?: Date;
  recipient?: User;
  sender?: User;
  createdAt: Date;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
    version: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// =====================================================
// FORM TYPES
// =====================================================

export interface PatientRegistrationForm {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: string;
  address?: Address;
  
  // Medical Information
  bloodGroup?: string;
  allergies?: string[];
  chronicConditions?: string[];
  
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  
  // Insurance Information
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
}

export interface AppointmentBookingForm {
  doctorId: string;
  appointmentType: AppointmentType;
  scheduledAt: Date;
  reasonForVisit?: string;
  notes?: string;
}

export interface ConsultationForm {
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  physicalExamination?: Record<string, any>;
  vitalSigns?: VitalSigns;
  diagnosis?: string[];
  treatmentPlan?: string;
  followUpInstructions?: string;
  nextAppointmentDate?: Date;
  prescriptions?: PrescriptionMedicationForm[];
  labOrders?: string[]; // Lab test type IDs
}

export interface PrescriptionMedicationForm {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity?: number;
  unit?: string;
}

// =====================================================
// DASHBOARD TYPES
// =====================================================

export interface PatientDashboardData {
  upcomingAppointments: Appointment[];
  recentConsultations: Consultation[];
  activePrescriptions: Prescription[];
  pendingLabResults: LabOrder[];
  healthSummary: {
    lastVisit?: Date;
    nextAppointment?: Date;
    chronicConditions: string[];
    allergies: string[];
  };
}

export interface DoctorDashboardData {
  todaysAppointments: Appointment[];
  upcomingAppointments: Appointment[];
  pendingLabResults: LabOrder[];
  recentConsultations: Consultation[];
  patientStats: {
    totalPatients: number;
    newPatientsThisMonth: number;
    consultationsToday: number;
  };
}

export interface AdminDashboardData {
  patientStats: {
    totalPatients: number;
    newPatientsToday: number;
    activePatients: number;
  };
  appointmentStats: {
    totalAppointments: number;
    appointmentsToday: number;
    completionRate: number;
  };
  staffStats: {
    totalStaff: number;
    activeStaff: number;
    onLeave: number;
  };
  financialStats: {
    revenueToday: number;
    revenueThisMonth: number;
    pendingPayments: number;
  };
}

// =====================================================
// SEARCH AND FILTER TYPES
// =====================================================

export interface PatientSearchFilters {
  name?: string;
  patientId?: string;
  phone?: string;
  email?: string;
  bloodGroup?: string;
  dateOfBirth?: Date;
  page?: number;
  limit?: number;
}

export interface AppointmentSearchFilters {
  patientId?: string;
  doctorId?: string;
  status?: AppointmentStatus;
  appointmentType?: AppointmentType;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface InventorySearchFilters {
  medicationName?: string;
  category?: string;
  lowStock?: boolean;
  expiringSoon?: boolean; // Within 30 days
  supplier?: string;
  page?: number;
  limit?: number;
} 