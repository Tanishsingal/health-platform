-- Auto-create user profile when a new user signs up
-- This trigger ensures every authenticated user gets a profile record

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, role, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'patient')::user_role,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', 'User')
  )
  ON CONFLICT (id) DO NOTHING;

  -- If the user is a patient, create a patient record
  IF COALESCE(NEW.raw_user_meta_data ->> 'role', 'patient') = 'patient' THEN
    INSERT INTO public.patients (id, medical_record_number)
    VALUES (
      NEW.id,
      'MRN-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || '-' || SUBSTRING(NEW.id::TEXT, 1, 8)
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- If the user is medical staff, create a medical staff record
  IF COALESCE(NEW.raw_user_meta_data ->> 'role', 'patient') IN ('doctor', 'nurse', 'pharmacist', 'lab_technician') THEN
    INSERT INTO public.medical_staff (id, license_number, specialization, department)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'license_number', 'LIC-' || SUBSTRING(NEW.id::TEXT, 1, 8)),
      COALESCE(NEW.raw_user_meta_data ->> 'specialization', 'General'),
      COALESCE(NEW.raw_user_meta_data ->> 'department', 'General')
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
