-- ============================================================================
-- Fix Update Permission Error for Car Reservations
-- Run this in Supabase SQL Editor
-- ============================================================================

-- First, check if pg_net extension exists (needed for triggers calling edge functions)
-- If it doesn't exist, the trigger might be causing the error
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'car_reservations';

-- Drop any conflicting policies
DROP POLICY IF EXISTS "Admins can update car reservations" ON car_reservations;
DROP POLICY IF EXISTS "authenticated_update_car_reservations" ON car_reservations;
DROP POLICY IF EXISTS "authenticated_can_update_car_reservations" ON car_reservations;

-- Ensure RLS is enabled
ALTER TABLE car_reservations ENABLE ROW LEVEL SECURITY;

-- Grant UPDATE permission to authenticated role
GRANT UPDATE ON car_reservations TO authenticated;

-- Create a simple, clear UPDATE policy for authenticated users
CREATE POLICY "authenticated_can_update_car_reservations"
  ON car_reservations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Verify the policy was created
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'car_reservations' AND cmd = 'UPDATE';

-- If you have a trigger that's causing issues, temporarily disable it to test
-- DROP TRIGGER IF EXISTS car_reservation_confirmed_trigger ON car_reservations;

