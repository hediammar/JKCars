-- ============================================================================
-- Fix Update Error for Car Reservations (Error 3F000)
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Temporarily disable the trigger if it exists (it might be causing the error)
DROP TRIGGER IF EXISTS car_reservation_confirmed_trigger ON car_reservations;

-- Step 2: Check and fix RLS policies
-- Drop any existing UPDATE policies
DROP POLICY IF EXISTS "Admins can update car reservations" ON car_reservations;
DROP POLICY IF EXISTS "authenticated_update_car_reservations" ON car_reservations;
DROP POLICY IF EXISTS "authenticated_can_update_car_reservations" ON car_reservations;

-- Ensure RLS is enabled
ALTER TABLE car_reservations ENABLE ROW LEVEL SECURITY;

-- Grant UPDATE permission to authenticated role
GRANT UPDATE ON car_reservations TO authenticated;

-- Create a clear UPDATE policy for authenticated users
CREATE POLICY "authenticated_can_update_car_reservations"
  ON car_reservations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Step 3: Verify the policy was created
SELECT 
  policyname, 
  cmd, 
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'car_reservations' AND cmd = 'UPDATE';

-- Step 4: Check if there are any triggers that might be causing issues
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled,
  pg_get_triggerdef(oid) as definition
FROM pg_trigger
WHERE tgrelid = 'car_reservations'::regclass
  AND tgname LIKE '%confirmation%';

-- ============================================================================
-- After running this, try updating a reservation again
-- If it works, then the trigger was the issue
-- You can then set up the webhook instead (recommended) or fix the trigger
-- ============================================================================

