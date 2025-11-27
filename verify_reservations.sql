-- ============================================================================
-- VERIFY RESERVATION TABLES AND POLICIES
-- Run this to check if everything is set up correctly
-- ============================================================================

-- 1. Check if tables exist
SELECT 
  table_name,
  table_schema
FROM information_schema.tables
WHERE table_name IN ('car_reservations', 'excursion_reservations', 'airport_reservations')
ORDER BY table_name;

-- 2. Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('car_reservations', 'excursion_reservations', 'airport_reservations')
ORDER BY tablename;

-- 3. Check all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename IN ('car_reservations', 'excursion_reservations', 'airport_reservations')
ORDER BY tablename, policyname;

-- 4. Check enum types exist
SELECT 
  typname as enum_name,
  typtype as type_type
FROM pg_type
WHERE typname IN ('reservation_status', 'payment_method')
ORDER BY typname;

-- 5. Check enum values
SELECT 
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('reservation_status', 'payment_method')
ORDER BY t.typname, e.enumsortorder;

-- 6. Verify table columns match expected structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name IN ('car_reservations', 'excursion_reservations', 'airport_reservations')
ORDER BY table_name, ordinal_position;

-- ============================================================================
-- EXPECTED RESULTS:
-- ============================================================================
-- 1. All 3 tables should exist in 'public' schema
-- 2. All tables should have rowsecurity = true
-- 3. Each table should have 4 policies:
--    - Public can insert [table] reservations
--    - Admins can read [table] reservations
--    - Admins can update [table] reservations
--    - Admins can delete [table] reservations
-- 4. Both enum types should exist
-- 5. reservation_status should have: pending, confirmed, completed, cancelled
-- 6. payment_method should have: card, agency
-- 7. All expected columns should be present

