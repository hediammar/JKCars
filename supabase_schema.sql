-- Create enum types for reservation status and payment method
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE payment_method AS ENUM ('card', 'agency');

-- ============================================================================
-- CAR RESERVATIONS TABLE
-- ============================================================================
CREATE TABLE car_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code TEXT NOT NULL UNIQUE,
  car_id TEXT NOT NULL,
  car_name TEXT NOT NULL,
  pickup_date DATE NOT NULL,
  return_date DATE,
  pickup_location TEXT NOT NULL,
  return_location TEXT,
  add_ons TEXT[] DEFAULT '{}',
  total_price NUMERIC(10, 2) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  driver_license TEXT,
  payment_method payment_method NOT NULL,
  status reservation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_car_reservations_pickup_date ON car_reservations(pickup_date);
CREATE INDEX idx_car_reservations_reference_code ON car_reservations(reference_code);
CREATE INDEX idx_car_reservations_car_id ON car_reservations(car_id);
CREATE INDEX idx_car_reservations_status ON car_reservations(status);

-- ============================================================================
-- EXCURSION RESERVATIONS TABLE
-- ============================================================================
CREATE TABLE excursion_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code TEXT NOT NULL UNIQUE,
  excursion_id TEXT NOT NULL,
  excursion_title TEXT NOT NULL,
  date DATE NOT NULL,
  persons INTEGER NOT NULL,
  car_type TEXT NOT NULL,
  add_ons TEXT[] DEFAULT '{}',
  total_price NUMERIC(10, 2) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  payment_method payment_method NOT NULL,
  status reservation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_excursion_reservations_date ON excursion_reservations(date);
CREATE INDEX idx_excursion_reservations_reference_code ON excursion_reservations(reference_code);
CREATE INDEX idx_excursion_reservations_excursion_id ON excursion_reservations(excursion_id);
CREATE INDEX idx_excursion_reservations_status ON excursion_reservations(status);

-- ============================================================================
-- AIRPORT RESERVATIONS TABLE
-- ============================================================================
CREATE TABLE airport_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code TEXT NOT NULL UNIQUE,
  airport TEXT NOT NULL,
  pickup_location TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  passengers INTEGER NOT NULL,
  car_preference TEXT NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  payment_method payment_method NOT NULL,
  status reservation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_airport_reservations_date ON airport_reservations(date);
CREATE INDEX idx_airport_reservations_reference_code ON airport_reservations(reference_code);
CREATE INDEX idx_airport_reservations_status ON airport_reservations(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE car_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE excursion_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE airport_reservations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - Public Inserts, Admin-Only Reads/Updates/Deletes
-- ============================================================================

-- CAR RESERVATIONS POLICIES
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

-- EXCURSION RESERVATIONS POLICIES
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

-- AIRPORT RESERVATIONS POLICIES
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
-- NOTES:
-- ============================================================================
-- 1. Public (anon) users can INSERT reservations for the booking flow
--    Only authenticated admin users can READ/UPDATE/DELETE reservations
--
-- 2. For stricter admin access, you can restrict to specific admin emails:
--    Replace "USING (true)" with:
--    USING (auth.jwt() ->> 'email' IN ('admin1@example.com', 'admin2@example.com'))
--
-- 3. To test the schema:
--    - Run this SQL in Supabase SQL Editor
--    - Verify tables are created: SELECT * FROM car_reservations LIMIT 1;
--    - Test RLS: Try querying as anon (should fail) vs authenticated (should work)
--
-- 4. After creating tables, create an admin user in Supabase Auth:
--    - Go to Authentication > Users > Add User
--    - Use this email/password to log into /admin dashboard

