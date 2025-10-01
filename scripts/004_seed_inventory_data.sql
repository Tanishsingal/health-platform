-- Seed inventory data with common medications and medical supplies
-- This provides sample data for the pharmacy system

INSERT INTO public.inventory (item_name, item_type, sku, current_stock, minimum_stock, unit_price, expiry_date, supplier, location) VALUES
-- Common Medications
('Amoxicillin 500mg', 'medication', 'MED-AMX-500', 150, 50, 12.50, '2025-08-15', 'PharmaCorp', 'Shelf A1'),
('Ibuprofen 200mg', 'medication', 'MED-IBU-200', 300, 100, 8.75, '2025-12-20', 'MediSupply', 'Shelf A2'),
('Lisinopril 10mg', 'medication', 'MED-LIS-10', 80, 30, 15.25, '2025-06-10', 'PharmaCorp', 'Shelf A3'),
('Metformin 500mg', 'medication', 'MED-MET-500', 200, 75, 18.50, '2025-09-30', 'HealthDist', 'Shelf A4'),
('Atorvastatin 20mg', 'medication', 'MED-ATO-20', 120, 40, 22.00, '2025-07-25', 'MediSupply', 'Shelf A5'),
('Omeprazole 20mg', 'medication', 'MED-OME-20', 90, 35, 16.75, '2025-05-15', 'PharmaCorp', 'Shelf A6'),
('Amlodipine 5mg', 'medication', 'MED-AML-5', 110, 45, 14.25, '2025-11-08', 'HealthDist', 'Shelf A7'),
('Hydrochlorothiazide 25mg', 'medication', 'MED-HCT-25', 75, 25, 11.50, '2025-04-20', 'MediSupply', 'Shelf A8'),
('Prednisone 10mg', 'medication', 'MED-PRE-10', 60, 20, 19.75, '2025-10-12', 'PharmaCorp', 'Shelf A9'),
('Azithromycin 250mg', 'medication', 'MED-AZI-250', 45, 15, 28.50, '2025-03-30', 'HealthDist', 'Shelf A10'),

-- Low stock items (for testing alerts)
('Insulin Glargine', 'medication', 'MED-INS-GLA', 8, 20, 85.00, '2025-06-15', 'DiabetesCare', 'Refrigerator R1'),
('EpiPen Auto-Injector', 'medication', 'MED-EPI-AUTO', 3, 10, 120.00, '2025-08-01', 'EmergencyMed', 'Emergency Kit'),
('Warfarin 5mg', 'medication', 'MED-WAR-5', 12, 25, 24.75, '2025-07-10', 'CardioMeds', 'Shelf B1'),

-- Items expiring soon (for testing alerts)
('Nitroglycerin Spray', 'medication', 'MED-NIT-SPR', 25, 10, 45.50, '2025-02-15', 'CardioMeds', 'Emergency Kit'),
('Albuterol Inhaler', 'medication', 'MED-ALB-INH', 40, 15, 32.25, '2025-02-28', 'RespiratoryCare', 'Shelf B2'),

-- Medical Supplies
('Disposable Syringes 10ml', 'medical_supply', 'SUP-SYR-10', 500, 200, 0.75, '2026-12-31', 'MedicalSupplies Inc', 'Storage Room S1'),
('Sterile Gauze Pads 4x4', 'medical_supply', 'SUP-GAU-4X4', 1000, 300, 0.25, '2027-06-30', 'WoundCare Co', 'Storage Room S2'),
('Latex Gloves Size M', 'medical_supply', 'SUP-GLV-M', 2000, 500, 0.15, '2026-09-15', 'SafetyFirst', 'Storage Room S3'),
('Blood Pressure Cuffs', 'equipment', 'EQP-BP-CUFF', 15, 5, 45.00, NULL, 'MedEquip Ltd', 'Equipment Room E1'),
('Digital Thermometers', 'equipment', 'EQP-THERM-DIG', 25, 10, 28.50, NULL, 'TempTech', 'Equipment Room E2'),
('Stethoscopes', 'equipment', 'EQP-STETH', 12, 5, 85.00, NULL, 'MedEquip Ltd', 'Equipment Room E3'),

-- Controlled substances (for regulatory tracking)
('Morphine 10mg', 'medication', 'MED-MOR-10', 30, 10, 45.00, '2025-09-15', 'ControlledMeds', 'Secure Vault V1'),
('Oxycodone 5mg', 'medication', 'MED-OXY-5', 25, 8, 38.75, '2025-08-20', 'ControlledMeds', 'Secure Vault V2'),
('Lorazepam 1mg', 'medication', 'MED-LOR-1', 40, 15, 22.50, '2025-07-30', 'ControlledMeds', 'Secure Vault V3');

-- Update timestamps to show recent activity
UPDATE public.inventory 
SET updated_at = NOW() - INTERVAL '1 day' 
WHERE item_name IN ('Amoxicillin 500mg', 'Ibuprofen 200mg', 'Disposable Syringes 10ml');

UPDATE public.inventory 
SET updated_at = NOW() - INTERVAL '2 hours' 
WHERE item_name IN ('Insulin Glargine', 'EpiPen Auto-Injector');
