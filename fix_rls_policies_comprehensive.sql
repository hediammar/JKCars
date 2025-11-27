-- ============================================================================
-- COMPREHENSIVE FIX FOR RLS POLICIES
-- This script ensures all policies are correctly set up
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Drop ALL existing policies (to start fresh)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies 
              WHERE tablename IN ('car_reservations', 'excursion_reservations', 'airport_reservations')) 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- Step 2: Ensure RLS is enabled
ALTER TABLE car_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE excursion_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE airport_reservations ENABLE ROW LEVEL SECURITY;

-- Step 3: Grant necessary permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT ON car_reservations TO anon;
GRANT SELECT, INSERT ON excursion_reservations TO anon;
GRANT SELECT, INSERT ON airport_reservations TO anon;

-- Grant permissions to authenticated role (for admin)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON car_reservations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON excursion_reservations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON airport_reservations TO authenticated;

-- Step 4: Grant usage on enum types
GRANT USAGE ON TYPE reservation_status TO anon, authenticated;
GRANT USAGE ON TYPE payment_method TO anon, authenticated;

-- ============================================================================
-- CAR RESERVATIONS POLICIES
-- ============================================================================

-- Allow public (anon) users to insert car reservations
CREATE POLICY "anon_insert_car_reservations"
  ON car_reservations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to insert car reservations
CREATE POLICY "authenticated_insert_car_reservations"
  ON car_reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users (admins) to read all car reservations
CREATE POLICY "authenticated_read_car_reservations"
  ON car_reservations
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users (admins) to update car reservations
CREATE POLICY "authenticated_update_car_reservations"
  ON car_reservations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users (admins) to delete car reservations
CREATE POLICY "authenticated_delete_car_reservations"
  ON car_reservations
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- EXCURSION RESERVATIONS POLICIES
-- ============================================================================

-- Allow public (anon) users to insert excursion reservations
CREATE POLICY "anon_insert_excursion_reservations"
  ON excursion_reservations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to insert excursion reservations
CREATE POLICY "authenticated_insert_excursion_reservations"
  ON excursion_reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users (admins) to read all excursion reservations
CREATE POLICY "authenticated_read_excursion_reservations"
  ON excursion_reservations
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users (admins) to update excursion reservations
CREATE POLICY "authenticated_update_excursion_reservations"
  ON excursion_reservations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users (admins) to delete excursion reservations
CREATE POLICY "authenticated_delete_excursion_reservations"
  ON excursion_reservations
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- AIRPORT RESERVATIONS POLICIES
-- ============================================================================

-- Allow public (anon) users to insert airport reservations
CREATE POLICY "anon_insert_airport_reservations"
  ON airport_reservations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to insert airport reservations
CREATE POLICY "authenticated_insert_airport_reservations"
  ON airport_reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users (admins) to read all airport reservations
CREATE POLICY "authenticated_read_airport_reservations"
  ON airport_reservations
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users (admins) to update airport reservations
CREATE POLICY "authenticated_update_airport_reservations"
  ON airport_reservations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users (admins) to delete airport reservations
CREATE POLICY "authenticated_delete_airport_reservations"
  ON airport_reservations
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check policies were created
SELECT 
  tablename,
  policyname,
  cmd as command,
  roles
FROM pg_policies
WHERE tablename IN ('car_reservations', 'excursion_reservations', 'airport_reservations')
ORDER BY tablename, policyname;

-- Check RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('car_reservations', 'excursion_reservations', 'airport_reservations');

-- Check permissions
SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('car_reservations', 'excursion_reservations', 'airport_reservations')
  AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;

