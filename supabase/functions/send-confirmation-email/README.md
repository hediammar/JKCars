# Send Confirmation Email Edge Function

This Supabase Edge Function sends a confirmation email with a PDF attachment when a car reservation status changes to 'confirmed'.

## Setup

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link Your Project

```bash
supabase link --project-ref your-project-ref
```

You can find your project ref in your Supabase dashboard URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

### 4. Set Environment Variables

Create a `.env` file in the `supabase/functions/send-confirmation-email/` directory or set them via Supabase CLI:

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key
supabase secrets set RESEND_FROM_EMAIL=noreply@jkcars.tn
```

**Note**: The `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically available in Edge Functions.

### 5. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Verify your domain (or use the default resend.com domain for testing)
4. Add the API key to your Supabase secrets

### 6. Deploy the Function

```bash
supabase functions deploy send-confirmation-email
```

## Database Trigger Setup

After deploying the function, you need to create a database trigger that calls this function when a car reservation status changes to 'confirmed'.

Run this SQL in your Supabase SQL Editor:

```sql
-- Create a function to call the edge function
CREATE OR REPLACE FUNCTION notify_confirmation_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if status changed to 'confirmed'
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    -- Call the edge function via HTTP
    PERFORM
      net.http_post(
        url := current_setting('app.settings.edge_function_url', true) || '/send-confirmation-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
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
CREATE TRIGGER car_reservation_confirmed_trigger
  AFTER UPDATE ON car_reservations
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed'))
  EXECUTE FUNCTION notify_confirmation_email();
```

**Alternative: Use pg_net extension (Recommended)**

If you have the `pg_net` extension enabled, use this instead:

```sql
-- Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to call the edge function
CREATE OR REPLACE FUNCTION notify_confirmation_email()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Only trigger if status changed to 'confirmed'
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    -- Get the edge function URL (replace with your actual project URL)
    edge_function_url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-confirmation-email';
    
    -- Get service role key from secrets (you'll need to set this)
    service_role_key := current_setting('app.settings.service_role_key', true);
    
    -- Call the edge function
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
CREATE TRIGGER car_reservation_confirmed_trigger
  AFTER UPDATE ON car_reservations
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed'))
  EXECUTE FUNCTION notify_confirmation_email();
```

**Simpler Alternative: Direct HTTP Call**

If pg_net is not available, you can use a simpler approach with `http` extension:

```sql
-- Enable http extension
CREATE EXTENSION IF NOT EXISTS http;

-- Create the trigger function
CREATE OR REPLACE FUNCTION notify_confirmation_email()
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
CREATE TRIGGER car_reservation_confirmed_trigger
  AFTER UPDATE ON car_reservations
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed'))
  EXECUTE FUNCTION notify_confirmation_email();
```

**Important**: Replace `YOUR_PROJECT_REF` and `YOUR_SERVICE_ROLE_KEY` with your actual values.

## Testing

You can test the function manually:

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-confirmation-email' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "record": {
      "id": "test-id",
      "reference_code": "TND123456",
      "car_name": "Test Car",
      "customer_name": "Test User",
      "customer_email": "test@example.com",
      "customer_phone": "+21650123456",
      "pickup_date": "2024-01-15",
      "return_date": "2024-01-20",
      "pickup_location": "Tunis",
      "return_location": "Tunis",
      "add_ons": ["gps"],
      "total_price": 500,
      "payment_method": "agency",
      "status": "confirmed",
      "driver_license": "TUN123456"
    }
  }'
```

## Monitoring

Check function logs:

```bash
supabase functions logs send-confirmation-email
```

Or view in Supabase Dashboard → Edge Functions → send-confirmation-email → Logs

## Troubleshooting

1. **Email not sending**: Check Resend API key and domain verification
2. **PDF generation fails**: Check function logs for errors
3. **Trigger not firing**: Verify trigger is created and enabled
4. **Permission errors**: Ensure service role key has proper permissions

