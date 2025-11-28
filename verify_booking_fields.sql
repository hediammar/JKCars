-- ============================================================================
-- VERIFY BOOKING FIELDS MATCH TABLE STRUCTURE
-- Run this to check if there are any mismatches
-- ============================================================================

-- Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'car_reservations'
ORDER BY ordinal_position;

-- Expected fields from code:
-- reference_code (text, NOT NULL) ✓
-- car_id (text, NOT NULL) ✓
-- car_name (text, NOT NULL) ✓
-- pickup_date (date, NOT NULL) ✓
-- return_date (date, NULLABLE) ✓
-- pickup_location (text, NOT NULL) ✓
-- return_location (text, NULLABLE) ✓
-- add_ons (text[], NULLABLE, default '{}') ✓
-- total_price (numeric(10,2), NOT NULL) ✓
-- customer_name (text, NOT NULL) ✓
-- customer_email (text, NOT NULL) ✓
-- customer_phone (text, NOT NULL) ✓
-- driver_license (text, NULLABLE) ✓
-- payment_method (payment_method enum, NOT NULL) ✓
-- status (reservation_status enum, NOT NULL, default 'pending') ✓

-- Test insert with sample data (this will show any field mismatches)
-- Uncomment to test:
/*
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
  '2025-12-01',
  '2025-12-05',
  'Tunis',
  'Tunis',
  ARRAY[]::text[],
  100.00,
  'Test User',
  'test@example.com',
  '+216123456789',
  'TUN123456',
  'agency',
  'pending'
);
*/

