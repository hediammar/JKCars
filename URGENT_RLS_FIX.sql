-- ============================================================================
-- URGENT FIX FOR RLS 401 ERRORS
-- This fixes the "insufficient_privilege" error (42501)
-- Run this IMMEDIATELY in Supabase SQL Editor
-- ============================================================================

-- Step 1: Drop ALL existing policies (comprehensive cleanup)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE tablename IN ('car_reservations', 'excursion_reservations', 'airport_reservations')
    ) 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Step 2: Ensure RLS is enabled
ALTER TABLE car_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE excursion_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE airport_reservations ENABLE ROW LEVEL SECURITY;

-- Step 3: Grant schema usage
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 4: Grant table permissions to anon (CRITICAL!)
GRANT SELECT, INSERT ON car_reservations TO anon;
GRANT SELECT, INSERT ON excursion_reservations TO anon;
GRANT SELECT, INSERT ON airport_reservations TO anon;

-- Step 5: Grant table permissions to authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON car_reservations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON excursion_reservations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON airport_reservations TO authenticated;

-- Step 6: Grant enum type usage
GRANT USAGE ON TYPE reservation_status TO anon, authenticated;
GRANT USAGE ON TYPE payment_method TO anon, authenticated;

-- ============================================================================
-- CAR RESERVATIONS POLICIES
-- ============================================================================

-- Policy for anon INSERT (separate policy for clarity)
CREATE POLICY "anon_can_insert_car_reservations"
  ON car_reservations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy for authenticated INSERT
CREATE POLICY "authenticated_can_insert_car_reservations"
  ON car_reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy for authenticated SELECT
CREATE POLICY "authenticated_can_select_car_reservations"
  ON car_reservations
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for authenticated UPDATE
CREATE POLICY "authenticated_can_update_car_reservations"
  ON car_reservations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy for authenticated DELETE
CREATE POLICY "authenticated_can_delete_car_reservations"
  ON car_reservations
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- EXCURSION RESERVATIONS POLICIES
-- ============================================================================

CREATE POLICY "anon_can_insert_excursion_reservations"
  ON excursion_reservations
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "authenticated_can_insert_excursion_reservations"
  ON excursion_reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_can_select_excursion_reservations"
  ON excursion_reservations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_can_update_excursion_reservations"
  ON excursion_reservations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_can_delete_excursion_reservations"
  ON excursion_reservations
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- AIRPORT RESERVATIONS POLICIES
-- ============================================================================

CREATE POLICY "anon_can_insert_airport_reservations"
  ON airport_reservations
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "authenticated_can_insert_airport_reservations"
  ON airport_reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_can_select_airport_reservations"
  ON airport_reservations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_can_update_airport_reservations"
  ON airport_reservations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_can_delete_airport_reservations"
  ON airport_reservations
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- VERIFICATION (run these after to confirm)
-- ============================================================================

-- Check policies exist
SELECT tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('car_reservations', 'excursion_reservations', 'airport_reservations')
ORDER BY tablename, policyname;

-- Check permissions
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('car_reservations', 'excursion_reservations', 'airport_reservations')
  AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;

