// =====================================================
// HEALTHCARE PLATFORM API CLIENT
// Comprehensive API client with type safety and error handling
// =====================================================

import { ApiResponse, PaginationMeta } from '../types/healthcare';

// =====================================================
// API CONFIGURATION
// =====================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const API_VERSION = 'v1';

// =====================================================
// ERROR TYPES
// =====================================================

export enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    public message: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// =====================================================
// REQUEST CONFIGURATION
// =====================================================

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

// =====================================================
// API CLIENT CLASS
// =====================================================

class HealthcareApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/${API_VERSION}`;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Remove authentication token
  clearAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }

  // Build URL with query parameters
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      timeout = 10000
    } = config;

    try {
      const url = this.buildUrl(endpoint, params);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method,
        headers: { ...this.defaultHeaders, ...headers },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          this.getErrorCode(response.status),
          data.error?.message || 'An error occurred',
          response.status,
          data.error?.details
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError(
            ApiErrorCode.NETWORK_ERROR,
            'Request timeout',
            408
          );
        }
        
        throw new ApiError(
          ApiErrorCode.NETWORK_ERROR,
          error.message || 'Network error occurred'
        );
      }

      throw new ApiError(
        ApiErrorCode.INTERNAL_ERROR,
        'Unknown error occurred'
      );
    }
  }

  // Map HTTP status codes to error codes
  private getErrorCode(status: number): ApiErrorCode {
    switch (status) {
      case 400: return ApiErrorCode.VALIDATION_ERROR;
      case 401: return ApiErrorCode.UNAUTHORIZED;
      case 403: return ApiErrorCode.FORBIDDEN;
      case 404: return ApiErrorCode.NOT_FOUND;
      case 409: return ApiErrorCode.CONFLICT;
      case 429: return ApiErrorCode.RATE_LIMIT_EXCEEDED;
      default: return ApiErrorCode.INTERNAL_ERROR;
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  // POST request
  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  // PUT request
  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  // PATCH request
  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // File upload
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': this.defaultHeaders['Authorization'] || '',
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          this.getErrorCode(response.status),
          data.error?.message || 'Upload failed',
          response.status,
          data.error?.details
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        ApiErrorCode.NETWORK_ERROR,
        'File upload failed'
      );
    }
  }
}

// =====================================================
// API CLIENT INSTANCE
// =====================================================

export const apiClient = new HealthcareApiClient();

// =====================================================
// SPECIALIZED API SERVICES
// =====================================================

import {
  User, UserProfile, Patient, Doctor, Nurse, StaffMember,
  Appointment, Consultation, Prescription, LabOrder, LabResult,
  Medication, Inventory, PharmacySale, PatientAdmission,
  NursingNote, FacilityTask, Equipment, Vendor, PurchaseOrder,
  PatientRegistrationForm, AppointmentBookingForm, ConsultationForm,
  PatientDashboardData, DoctorDashboardData, AdminDashboardData,
  PatientSearchFilters, AppointmentSearchFilters, InventorySearchFilters
} from '../types/healthcare';

// =====================================================
// AUTHENTICATION API
// =====================================================

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<{ user: User; token: string; refreshToken: string }>('/auth/login', {
      email,
      password
    }),

  register: (userData: PatientRegistrationForm) =>
    apiClient.post<{ user: User; patient: Patient }>('/auth/register', userData),

  refreshToken: (refreshToken: string) =>
    apiClient.post<{ token: string; refreshToken: string }>('/auth/refresh', {
      refreshToken
    }),

  logout: () =>
    apiClient.post('/auth/logout'),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }),

  verifyEmail: (token: string) =>
    apiClient.post('/auth/verify-email', { token })
};

// =====================================================
// USER MANAGEMENT API
// =====================================================

export const userApi = {
  getProfile: () =>
    apiClient.get<UserProfile>('/users/profile'),

  updateProfile: (profileData: Partial<UserProfile>) =>
    apiClient.put<UserProfile>('/users/profile', profileData),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post('/users/change-password', {
      currentPassword,
      newPassword
    }),

  uploadProfilePicture: (file: File) =>
    apiClient.uploadFile<{ profilePictureUrl: string }>('/users/profile-picture', file)
};

// =====================================================
// PATIENT API
// =====================================================

export const patientApi = {
  searchPatients: (filters: PatientSearchFilters) =>
    apiClient.get<Patient[]>('/patients', filters),

  getPatient: (id: string) =>
    apiClient.get<Patient>(`/patients/${id}`),

  updatePatient: (id: string, patientData: Partial<Patient>) =>
    apiClient.put<Patient>(`/patients/${id}`, patientData),

  getPatientDashboard: (patientId?: string) =>
    apiClient.get<PatientDashboardData>('/patients/dashboard', 
      patientId ? { patientId } : undefined),

  getMedicalHistory: (patientId: string) =>
    apiClient.get<Consultation[]>(`/patients/${patientId}/medical-history`),

  getPrescriptionHistory: (patientId: string) =>
    apiClient.get<Prescription[]>(`/patients/${patientId}/prescriptions`),

  getLabResults: (patientId: string) =>
    apiClient.get<LabResult[]>(`/patients/${patientId}/lab-results`)
};

// =====================================================
// APPOINTMENT API
// =====================================================

export const appointmentApi = {
  searchAppointments: (filters: AppointmentSearchFilters) =>
    apiClient.get<Appointment[]>('/appointments', filters),

  getAppointment: (id: string) =>
    apiClient.get<Appointment>(`/appointments/${id}`),

  bookAppointment: (appointmentData: AppointmentBookingForm) =>
    apiClient.post<Appointment>('/appointments', appointmentData),

  updateAppointment: (id: string, appointmentData: Partial<Appointment>) =>
    apiClient.put<Appointment>(`/appointments/${id}`, appointmentData),

  cancelAppointment: (id: string, reason?: string) =>
    apiClient.patch<Appointment>(`/appointments/${id}/cancel`, { reason }),

  getDoctorAvailability: (doctorId: string, date: string) =>
    apiClient.get<string[]>(`/appointments/availability/${doctorId}`, { date }),

  getPatientAppointments: (patientId: string) =>
    apiClient.get<Appointment[]>(`/appointments/patient/${patientId}`),

  getDoctorAppointments: (doctorId: string, date?: string) =>
    apiClient.get<Appointment[]>(`/appointments/doctor/${doctorId}`, 
      date ? { date } : undefined)
};

// =====================================================
// CONSULTATION API
// =====================================================

export const consultationApi = {
  createConsultation: (consultationData: ConsultationForm & { patientId: string }) =>
    apiClient.post<Consultation>('/consultations', consultationData),

  getConsultation: (id: string) =>
    apiClient.get<Consultation>(`/consultations/${id}`),

  updateConsultation: (id: string, consultationData: Partial<ConsultationForm>) =>
    apiClient.put<Consultation>(`/consultations/${id}`, consultationData),

  getPatientConsultations: (patientId: string) =>
    apiClient.get<Consultation[]>(`/consultations/patient/${patientId}`),

  getDoctorConsultations: (doctorId: string) =>
    apiClient.get<Consultation[]>(`/consultations/doctor/${doctorId}`)
};

// =====================================================
// PRESCRIPTION API
// =====================================================

export const prescriptionApi = {
  createPrescription: (prescriptionData: Partial<Prescription>) =>
    apiClient.post<Prescription>('/prescriptions', prescriptionData),

  getPrescription: (id: string) =>
    apiClient.get<Prescription>(`/prescriptions/${id}`),

  updatePrescription: (id: string, prescriptionData: Partial<Prescription>) =>
    apiClient.put<Prescription>(`/prescriptions/${id}`, prescriptionData),

  dispensePrescription: (id: string) =>
    apiClient.patch<Prescription>(`/prescriptions/${id}/dispense`),

  getPendingPrescriptions: () =>
    apiClient.get<Prescription[]>('/prescriptions/pending'),

  getPatientPrescriptions: (patientId: string) =>
    apiClient.get<Prescription[]>(`/prescriptions/patient/${patientId}`)
};

// =====================================================
// LABORATORY API
// =====================================================

export const labApi = {
  createLabOrder: (labOrderData: Partial<LabOrder>) =>
    apiClient.post<LabOrder>('/lab-orders', labOrderData),

  getLabOrder: (id: string) =>
    apiClient.get<LabOrder>(`/lab-orders/${id}`),

  updateLabOrderStatus: (id: string, status: string) =>
    apiClient.patch<LabOrder>(`/lab-orders/${id}/status`, { status }),

  addLabResult: (labOrderTestId: string, resultData: Partial<LabResult>) =>
    apiClient.post<LabResult>(`/lab-results`, {
      labOrderTestId,
      ...resultData
    }),

  getPatientLabOrders: (patientId: string) =>
    apiClient.get<LabOrder[]>(`/lab-orders/patient/${patientId}`),

  getPendingLabOrders: () =>
    apiClient.get<LabOrder[]>('/lab-orders/pending'),

  getLabTestTypes: () =>
    apiClient.get<any[]>('/lab-test-types')
};

// =====================================================
// PHARMACY API
// =====================================================

export const pharmacyApi = {
  searchMedications: (query: string) =>
    apiClient.get<Medication[]>('/medications', { search: query }),

  getMedication: (id: string) =>
    apiClient.get<Medication>(`/medications/${id}`),

  getInventory: (filters: InventorySearchFilters) =>
    apiClient.get<Inventory[]>('/inventory', filters),

  updateInventory: (id: string, inventoryData: Partial<Inventory>) =>
    apiClient.put<Inventory>(`/inventory/${id}`, inventoryData),

  createSale: (saleData: Partial<PharmacySale>) =>
    apiClient.post<PharmacySale>('/pharmacy-sales', saleData),

  getLowStockItems: () =>
    apiClient.get<Inventory[]>('/inventory/low-stock'),

  getExpiringItems: (days: number = 30) =>
    apiClient.get<Inventory[]>('/inventory/expiring', { days })
};

// =====================================================
// STAFF API
// =====================================================

export const staffApi = {
  getDoctors: (specialization?: string) =>
    apiClient.get<Doctor[]>('/staff/doctors', 
      specialization ? { specialization } : undefined),

  getDoctor: (id: string) =>
    apiClient.get<Doctor>(`/staff/doctors/${id}`),

  getNurses: (department?: string) =>
    apiClient.get<Nurse[]>('/staff/nurses',
      department ? { department } : undefined),

  getStaffMembers: (department?: string) =>
    apiClient.get<StaffMember[]>('/staff',
      department ? { department } : undefined),

  updateDoctorAvailability: (doctorId: string, availability: any) =>
    apiClient.put(`/staff/doctors/${doctorId}/availability`, availability),

  getDoctorDashboard: (doctorId?: string) =>
    apiClient.get<DoctorDashboardData>('/staff/doctors/dashboard',
      doctorId ? { doctorId } : undefined)
};

// =====================================================
// ADMIN API
// =====================================================

export const adminApi = {
  getDashboard: () =>
    apiClient.get<AdminDashboardData>('/admin/dashboard'),

  getSystemStats: () =>
    apiClient.get<any>('/admin/stats'),

  getAuditLogs: (filters?: any) =>
    apiClient.get<any[]>('/admin/audit-logs', filters),

  manageUser: (userId: string, action: string, data?: any) =>
    apiClient.post(`/admin/users/${userId}/${action}`, data),

  getReports: (reportType: string, filters?: any) =>
    apiClient.get(`/admin/reports/${reportType}`, filters)
};

// =====================================================
// FACILITY MANAGEMENT API
// =====================================================

export const facilityApi = {
  getTasks: (filters?: any) =>
    apiClient.get<FacilityTask[]>('/facility/tasks', filters),

  createTask: (taskData: Partial<FacilityTask>) =>
    apiClient.post<FacilityTask>('/facility/tasks', taskData),

  updateTask: (id: string, taskData: Partial<FacilityTask>) =>
    apiClient.put<FacilityTask>(`/facility/tasks/${id}`, taskData),

  getEquipment: (filters?: any) =>
    apiClient.get<Equipment[]>('/facility/equipment', filters),

  updateEquipment: (id: string, equipmentData: Partial<Equipment>) =>
    apiClient.put<Equipment>(`/facility/equipment/${id}`, equipmentData)
};

// =====================================================
// PROCUREMENT API
// =====================================================

export const procurementApi = {
  getVendors: () =>
    apiClient.get<Vendor[]>('/procurement/vendors'),

  createVendor: (vendorData: Partial<Vendor>) =>
    apiClient.post<Vendor>('/procurement/vendors', vendorData),

  getPurchaseOrders: (filters?: any) =>
    apiClient.get<PurchaseOrder[]>('/procurement/purchase-orders', filters),

  createPurchaseOrder: (poData: Partial<PurchaseOrder>) =>
    apiClient.post<PurchaseOrder>('/procurement/purchase-orders', poData),

  updatePurchaseOrder: (id: string, poData: Partial<PurchaseOrder>) =>
    apiClient.put<PurchaseOrder>(`/procurement/purchase-orders/${id}`, poData)
};

// =====================================================
// NOTIFICATION API
// =====================================================

export const notificationApi = {
  getNotifications: (unreadOnly?: boolean) =>
    apiClient.get<any[]>('/notifications', 
      unreadOnly ? { unreadOnly } : undefined),

  markAsRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`),

  markAllAsRead: () =>
    apiClient.patch('/notifications/read-all'),

  sendNotification: (notificationData: any) =>
    apiClient.post('/notifications', notificationData)
};

// Export the main API client
export default apiClient; 