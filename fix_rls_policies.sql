-- ============================================================================
-- FIX RLS POLICIES FOR RESERVATIONS
-- Run this in Supabase SQL Editor to fix the RLS policies
-- ============================================================================

-- First, drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public can insert car reservations" ON car_reservations;
DROP POLICY IF EXISTS "Admins can read car reservations" ON car_reservations;
DROP POLICY IF EXISTS "Admins can update car reservations" ON car_reservations;
DROP POLICY IF EXISTS "Admins can delete car reservations" ON car_reservations;

DROP POLICY IF EXISTS "Public can insert excursion reservations" ON excursion_reservations;
DROP POLICY IF EXISTS "Admins can read excursion reservations" ON excursion_reservations;
DROP POLICY IF EXISTS "Admins can update excursion reservations" ON excursion_reservations;
DROP POLICY IF EXISTS "Admins can delete excursion reservations" ON excursion_reservations;

DROP POLICY IF EXISTS "Public can insert airport reservations" ON airport_reservations;
DROP POLICY IF EXISTS "Admins can read airport reservations" ON airport_reservations;
DROP POLICY IF EXISTS "Admins can update airport reservations" ON airport_reservations;
DROP POLICY IF EXISTS "Admins can delete airport reservations" ON airport_reservations;

-- Ensure RLS is enabled
ALTER TABLE car_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE excursion_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE airport_reservations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CAR RESERVATIONS POLICIES
-- ============================================================================

-- Allow public (anon) users to insert car reservations (for booking flow)
CREATE POLICY "Public can insert car reservations"
  ON car_reservations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users (admins) to read all car reservations
CREATE POLICY "Admins can read car reservations"
  ON car_reservations
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users (admins) to update car reservations
CREATE POLICY "Admins can update car reservations"
  ON car_reservations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users (admins) to delete car reservations
CREATE POLICY "Admins can delete car reservations"
  ON car_reservations
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- EXCURSION RESERVATIONS POLICIES
-- ============================================================================

-- Allow public (anon) users to insert excursion reservations (for booking flow)
CREATE POLICY "Public can insert excursion reservations"
  ON excursion_reservations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users (admins) to read all excursion reservations
CREATE POLICY "Admins can read excursion reservations"
  ON excursion_reservations
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users (admins) to update excursion reservations
CREATE POLICY "Admins can update excursion reservations"
  ON excursion_reservations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users (admins) to delete excursion reservations
CREATE POLICY "Admins can delete excursion reservations"
  ON excursion_reservations
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- AIRPORT RESERVATIONS POLICIES
-- ============================================================================

-- Allow public (anon) users to insert airport reservations (for booking flow)
CREATE POLICY "Public can insert airport reservations"
  ON airport_reservations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users (admins) to read all airport reservations
CREATE POLICY "Admins can read airport reservations"
  ON airport_reservations
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users (admins) to update airport reservations
CREATE POLICY "Admins can update airport reservations"
  ON airport_reservations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users (admins) to delete airport reservations
CREATE POLICY "Admins can delete airport reservations"
  ON airport_reservations
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After running this, verify the policies:
-- SELECT * FROM pg_policies WHERE tablename = 'car_reservations';
-- 
-- Test that anon users can insert:
-- (This should work from your frontend using the anon key)

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================
-- If you still get RLS errors, check:
-- 1. Make sure you're using the ANON key (not service role key) in your frontend
-- 2. Verify RLS is enabled: SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'car_reservations';
-- 3. Check existing policies: SELECT * FROM pg_policies WHERE tablename = 'car_reservations';
-- 4. Make sure the enum types exist:
--    SELECT typname FROM pg_type WHERE typname IN ('reservation_status', 'payment_method');

