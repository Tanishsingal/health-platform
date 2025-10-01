-- Development utility queries
-- Use these to quickly check your database setup

-- Check all users and their roles
SELECT u.email, u.role, u.status, up.first_name, up.last_name 
FROM users u 
LEFT JOIN user_profiles up ON u.id = up.user_id;

-- Check medications inventory
SELECT m.name, i.quantity_available, i.expiry_date, i.batch_number
FROM medications m
JOIN inventory i ON m.id = i.medication_id
ORDER BY m.name;

-- Check lab test types
SELECT name, category, cost, normal_range_text
FROM lab_test_types
ORDER BY category, name;

-- Quick stats
SELECT 
  'Total Users' as metric, COUNT(*) as count FROM users
UNION ALL
SELECT 
  'Total Medications' as metric, COUNT(*) as count FROM medications
UNION ALL
SELECT 
  'Total Lab Tests' as metric, COUNT(*) as count FROM lab_test_types;