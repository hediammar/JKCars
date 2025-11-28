-- ============================================================================
-- DIRECT INSERT TEST
-- Run this as anon role to test if RLS policies work
-- ============================================================================

-- Switch to anon role
SET ROLE anon;

-- Try inserting a car reservation
INSERT INTO car_reservations (
  reference_code,
  car_id,
  car_name,
  pickup_date,
  return_date,
  pickup_location,
  return_location,
  add_ons,
  total_price,
  customer_name,
  customer_email,
  customer_phone,
  driver_license,
  payment_method,
  status
) VALUES (
  'TEST-' || gen_random_uuid()::text,
  '1',
  'Test Car Model',
  '2025-12-01'::date,
  '2025-12-05'::date,
  'Tunis',
  'Tunis',
  ARRAY[]::text[],
  100.00,
  'Test User',
  'test@example.com',
  '+216123456789',
  'TUN123456',
  'agency'::payment_method,
  'pending'::reservation_status
) RETURNING *;

-- Reset role
RESET ROLE;

-- If the above works, the RLS policies are correct
-- If it fails, check the error message for specific field issues

