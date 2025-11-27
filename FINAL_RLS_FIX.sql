-- ============================================================================
-- FINAL COMPREHENSIVE RLS FIX
-- This script will completely reset and fix RLS policies
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: DISABLE RLS temporarily (to clean up)
ALTER TABLE car_reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE excursion_reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE airport_reservations DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies (comprehensive cleanup)
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
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not drop policy % on %: %', r.policyname, r.tablename, SQLERRM;
        END;
    END LOOP;
END $$;

-- Step 3: Grant schema usage
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 4: Grant ALL necessary permissions to anon
GRANT SELECT, INSERT ON car_reservations TO anon;
GRANT SELECT, INSERT ON excursion_reservations TO anon;
GRANT SELECT, INSERT ON airport_reservations TO anon;

-- Step 5: Grant ALL permissions to authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON car_reservations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON excursion_reservations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON airport_reservations TO authenticated;

-- Step 6: Grant enum type usage
GRANT USAGE ON TYPE reservation_status TO anon, authenticated;
GRANT USAGE ON TYPE payment_method TO anon, authenticated;

-- Step 7: RE-ENABLE RLS
ALTER TABLE car_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE excursion_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE airport_reservations ENABLE ROW LEVEL SECURITY;

-- Step 8: Create SIMPLE policies for anon INSERT (no conditions)
CREATE POLICY "anon_insert_car"
  ON car_reservations
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon_insert_excursion"
  ON excursion_reservations
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon_insert_airport"
  ON airport_reservations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Step 9: Create policies for authenticated INSERT
CREATE POLICY "auth_insert_car"
  ON car_reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "auth_insert_excursion"
  ON excursion_reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "auth_insert_airport"
  ON airport_reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Step 10: Create policies for authenticated SELECT/UPDATE/DELETE
CREATE POLICY "auth_select_car"
  ON car_reservations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "auth_update_car"
  ON car_reservations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "auth_delete_car"
  ON car_reservations
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "auth_select_excursion"
  ON excursion_reservations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "auth_update_excursion"
  ON excursion_reservations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "auth_delete_excursion"
  ON excursion_reservations
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "auth_select_airport"
  ON airport_reservations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "auth_update_airport"
  ON airport_reservations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "auth_delete_airport"
  ON airport_reservations
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- VERIFICATION QUERIES (run these to confirm)
-- ============================================================================

-- 1. Check RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('car_reservations', 'excursion_reservations', 'airport_reservations');

-- 2. Check policies exist
SELECT 
  tablename,
  policyname,
  roles,
  cmd as command
FROM pg_policies
WHERE tablename IN ('car_reservations', 'excursion_reservations', 'airport_reservations')
ORDER BY tablename, policyname;

-- 3. Check permissions
SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('car_reservations', 'excursion_reservations', 'airport_reservations')
  AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;

-- 4. Test insert as anon (this should work after the fix)
-- Uncomment to test:
/*
SET ROLE anon;
INSERT INTO car_reservations (
  reference_code, car_id, car_name, pickup_date,
  pickup_location, total_price, customer_name,
  customer_email, customer_phone, payment_method
) VALUES (
  'TEST-' || gen_random_uuid()::text, '1', 'Test Car', '2025-12-01',
  'Tunis', 100.00, 'Test User',
  'test@example.com', '+216123456789', 'agency'
);
RESET ROLE;
*/

