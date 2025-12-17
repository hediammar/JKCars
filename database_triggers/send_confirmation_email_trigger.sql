-- ============================================================================
-- Database Trigger: Send Confirmation Email
-- ============================================================================
-- This trigger calls the Supabase Edge Function when a car reservation
-- status changes from any status to 'confirmed'
-- ============================================================================

-- Option 1: Using pg_net extension (Recommended if available)
-- First, enable the extension:
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create the trigger function
CREATE OR REPLACE FUNCTION notify_confirmation_email()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Only trigger if status changed to 'confirmed'
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    -- Set your project ref here (get it from Supabase dashboard URL)
    edge_function_url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-confirmation-email';
    
    -- Get service role key from environment (set via Supabase secrets)
    -- For security, store this in Supabase Vault or use a different method
    service_role_key := current_setting('app.settings.service_role_key', true);
    
    -- Call the edge function using pg_net
    PERFORM
      net.http_post(
        url := edge_function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
          'record', row_to_json(NEW)
        )
      );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS car_reservation_confirmed_trigger ON car_reservations;
CREATE TRIGGER car_reservation_confirmed_trigger
  AFTER UPDATE ON car_reservations
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed'))
  EXECUTE FUNCTION notify_confirmation_email();

-- ============================================================================
-- Alternative Option 2: Using http extension (if pg_net is not available)
-- ============================================================================
-- Uncomment and use this if pg_net is not available:

/*
-- Enable http extension
CREATE EXTENSION IF NOT EXISTS http;

-- Create the trigger function
CREATE OR REPLACE FUNCTION notify_confirmation_email_http()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    PERFORM http_post(
      'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-confirmation-email',
      jsonb_build_object('record', row_to_json(NEW))::text,
      'application/json',
      jsonb_build_object(
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS car_reservation_confirmed_trigger ON car_reservations;
CREATE TRIGGER car_reservation_confirmed_trigger
  AFTER UPDATE ON car_reservations
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed'))
  EXECUTE FUNCTION notify_confirmation_email_http();
*/

-- ============================================================================
-- Alternative Option 3: Using Supabase Webhooks (Recommended for Production)
-- ============================================================================
-- Instead of database triggers, you can use Supabase Webhooks:
-- 1. Go to Supabase Dashboard → Database → Webhooks
-- 2. Create a new webhook
-- 3. Table: car_reservations
-- 4. Events: Update
-- 5. HTTP Request URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-confirmation-email
-- 6. HTTP Request Method: POST
-- 7. HTTP Request Headers: Authorization: Bearer YOUR_SERVICE_ROLE_KEY
-- 8. Filter: status = 'confirmed'
-- ============================================================================

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this to verify the trigger was created:
-- SELECT * FROM pg_trigger WHERE tgname = 'car_reservation_confirmed_trigger';

-- ============================================================================
-- Testing the Trigger
-- ============================================================================
-- To test, update a reservation status to 'confirmed':
-- UPDATE car_reservations 
-- SET status = 'confirmed' 
-- WHERE id = 'some-reservation-id' AND status != 'confirmed';

