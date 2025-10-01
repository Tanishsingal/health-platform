-- Enable Row Level Security (RLS) for all tables
-- This ensures data security and proper access control

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Medical staff can view patient profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.role IN ('doctor', 'nurse', 'admin', 'receptionist')
    )
  );

-- Patients Policies
CREATE POLICY "Patients can view their own data" ON public.patients
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Patients can update their own data" ON public.patients
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Medical staff can view patient data" ON public.patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.role IN ('doctor', 'nurse', 'admin', 'receptionist')
    )
  );

CREATE POLICY "Medical staff can update patient data" ON public.patients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.role IN ('doctor', 'nurse', 'admin')
    )
  );

-- Medical Staff Policies
CREATE POLICY "Staff can view their own data" ON public.medical_staff
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Staff can update their own data" ON public.medical_staff
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can view all staff data" ON public.medical_staff
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.role = 'admin'
    )
  );

-- Appointments Policies
CREATE POLICY "Patients can view their appointments" ON public.appointments
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view their appointments" ON public.appointments
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "Medical staff can view all appointments" ON public.appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.role IN ('doctor', 'nurse', 'admin', 'receptionist')
    )
  );

CREATE POLICY "Medical staff can manage appointments" ON public.appointments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.role IN ('doctor', 'nurse', 'admin', 'receptionist')
    )
  );

-- Medical Records Policies
CREATE POLICY "Patients can view their medical records" ON public.medical_records
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view their patient records" ON public.medical_records
  FOR SELECT USING (
    doctor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.role IN ('admin', 'nurse')
    )
  );

CREATE POLICY "Doctors can create medical records" ON public.medical_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.role IN ('doctor', 'nurse')
    )
  );

CREATE POLICY "Doctors can update medical records" ON public.medical_records
  FOR UPDATE USING (
    doctor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.role IN ('admin', 'nurse')
    )
  );

-- Prescriptions Policies
CREATE POLICY "Patients can view their prescriptions" ON public.prescriptions
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Medical staff can view prescriptions" ON public.prescriptions
  FOR SELECT USING (
    doctor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.role IN ('doctor', 'nurse', 'admin', 'pharmacist')
    )
  );

CREATE POLICY "Doctors can create prescriptions" ON public.prescriptions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.role = 'doctor'
    )
  );

CREATE POLICY "Pharmacists can update prescription status" ON public.prescriptions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.role IN ('pharmacist', 'admin')
    )
  );

-- Lab Tests Policies
CREATE POLICY "Patients can view their lab tests" ON public.lab_tests
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Medical staff can view lab tests" ON public.lab_tests
  FOR SELECT USING (
    ordered_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.role IN ('doctor', 'nurse', 'admin', 'lab_technician')
    )
  );

CREATE POLICY "Doctors can order lab tests" ON public.lab_tests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.role = 'doctor'
    )
  );

CREATE POLICY "Lab technicians can update test results" ON public.lab_tests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.role IN ('lab_technician', 'admin')
    )
  );

-- Inventory Policies
CREATE POLICY "Staff can view inventory" ON public.inventory
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.role IN ('doctor', 'nurse', 'admin', 'pharmacist')
    )
  );

CREATE POLICY "Pharmacists and admin can manage inventory" ON public.inventory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.role IN ('pharmacist', 'admin')
    )
  );

-- Audit Logs Policies (read-only for most users)
CREATE POLICY "Admin can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.role = 'admin'
    )
  );
