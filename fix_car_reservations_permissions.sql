-- ============================================================================
-- FIX CAR_RESERVATIONS INSERT PERMISSIONS FOR ANON ROLE
-- This script fixes the 401 error when inserting car reservations
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Grant schema usage (required for accessing tables)
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 2: Grant INSERT and SELECT permissions on the table
-- SELECT is needed because .select() is called after insert
GRANT INSERT, SELECT ON car_reservations TO anon;
GRANT INSERT, SELECT ON excursion_reservations TO anon;
GRANT INSERT, SELECT ON airport_reservations TO anon;

-- Step 3: Grant full permissions to authenticated users (admins)
GRANT SELECT, INSERT, UPDATE, DELETE ON car_reservations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON excursion_reservations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON airport_reservations TO authenticated;

-- Step 4: Grant usage on enum types (required for payment_method and reservation_status)
GRANT USAGE ON TYPE payment_method TO anon, authenticated;
GRANT USAGE ON TYPE reservation_status TO anon, authenticated;

-- Step 5: Ensure RLS is enabled
ALTER TABLE car_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE excursion_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE airport_reservations ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "anon_insert_car" ON car_reservations;
DROP POLICY IF EXISTS "anon_insert_excursion" ON excursion_reservations;
DROP POLICY IF EXISTS "anon_insert_airport" ON airport_reservations;
DROP POLICY IF EXISTS "Public can insert car reservations" ON car_reservations;
DROP POLICY IF EXISTS "Public can insert excursion reservations" ON excursion_reservations;
DROP POLICY IF EXISTS "Public can insert airport reservations" ON airport_reservations;
DROP POLICY IF EXISTS "anon_can_insert_car_reservations" ON car_reservations;
DROP POLICY IF EXISTS "anon_can_insert_excursion_reservations" ON excursion_reservations;
DROP POLICY IF EXISTS "anon_can_insert_airport_reservations" ON airport_reservations;

-- Step 7: Create simple INSERT policies for anon role
CREATE POLICY "anon_insert_car_reservations"
  ON car_reservations
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon_insert_excursion_reservations"
  ON excursion_reservations
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon_insert_airport_reservations"
  ON airport_reservations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Step 8: Create SELECT policy for anon (needed for .select() after insert)
CREATE POLICY "anon_select_own_reservations"
  ON car_reservations
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "anon_select_own_excursion_reservations"
  ON excursion_reservations
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "anon_select_own_airport_reservations"
  ON airport_reservations
  FOR SELECT
  TO anon
  USING (true);

-- Step 9: Create policies for authenticated users
CREATE POLICY "authenticated_insert_car_reservations"
  ON car_reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_select_car_reservations"
  ON car_reservations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_update_car_reservations"
  ON car_reservations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_car_reservations"
  ON car_reservations
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert_excursion_reservations"
  ON excursion_reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_select_excursion_reservations"
  ON excursion_reservations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_update_excursion_reservations"
  ON excursion_reservations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_excursion_reservations"
  ON excursion_reservations
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert_airport_reservations"
  ON airport_reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_select_airport_reservations"
  ON airport_reservations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_update_airport_reservations"
  ON airport_reservations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_airport_reservations"
  ON airport_reservations
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- VERIFICATION QUERIES
-- Run these to verify the setup is correct
-- ============================================================================

-- 1. Check RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('car_reservations', 'excursion_reservations', 'airport_reservations');

-- 2. Check policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('car_reservations', 'excursion_reservations', 'airport_reservations')
ORDER BY tablename, policyname;

-- 3. Check table permissions
SELECT 
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('car_reservations', 'excursion_reservations', 'airport_reservations')
  AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;

-- 4. Check enum type permissions
SELECT 
  typname as type_name,
  nspname as schema_name
FROM pg_type t
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE typname IN ('payment_method', 'reservation_status')
  AND nspname = 'public';

