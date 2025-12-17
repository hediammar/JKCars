# Supabase Setup Steps - Gmail SMTP Configuration

Follow these steps to configure and deploy the email confirmation system using Gmail SMTP.

## Step 1: Set Environment Variables (Secrets) in Supabase

You need to set the Gmail SMTP credentials as secrets in Supabase. You can do this via CLI or Dashboard.

### Option A: Using Supabase CLI (Recommended)

Open your terminal in the project root and run:

```bash
# Make sure you're logged in and linked
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Set the secrets
supabase secrets set SMTP_HOST=smtp.gmail.com
supabase secrets set SMTP_PORT=465
supabase secrets set SMTP_USER=jkcar7647@gmail.com
supabase secrets set SMTP_PASSWORD=your_16_character_app_password_here
supabase secrets set SMTP_FROM_EMAIL=jkcar7647@gmail.com
supabase secrets set SMTP_FROM_NAME="JK Cars"
```

**Important:** Replace `your_16_character_app_password_here` with the actual Gmail App Password you generated.

### Option B: Using Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
3. Add each secret:
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `465`
   - `SMTP_USER` = `jkcar7647@gmail.com`
   - `SMTP_PASSWORD` = `your_16_character_app_password`
   - `SMTP_FROM_EMAIL` = `jkcar7647@gmail.com`
   - `SMTP_FROM_NAME` = `JK Cars`

## Step 2: Deploy the Edge Function

From your project root directory, run:

```bash
supabase functions deploy send-confirmation-email
```

You should see:
```
Deploying function send-confirmation-email...
Function send-confirmation-email deployed successfully!
```

## Step 3: Set Up Database Trigger (Choose One Method)

You need to trigger the function when a car reservation status changes to 'confirmed'. Choose one of these methods:

### Method A: Supabase Webhooks (Easiest - Recommended)

1. Go to Supabase Dashboard → **Database** → **Webhooks**
2. Click **"Create a new webhook"**
3. Configure:
   - **Name:** `car_reservation_confirmation`
   - **Table:** `car_reservations`
   - **Events:** Check ✅ **Update**
   - **HTTP Request:**
     - **URL:** `https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-confirmation-email`
       - Replace `YOUR_PROJECT_REF` with your actual project ref (found in your Supabase dashboard URL)
     - **Method:** `POST`
     - **HTTP Request Headers:**
       - Key: `Authorization`
       - Value: `Bearer YOUR_SERVICE_ROLE_KEY`
         - Get this from: **Settings** → **API** → **service_role** key (keep this secret!)
     - **HTTP Request Body:** Leave as default (it will send the updated record)
   - **Filter:** Add filter: `status = 'confirmed'`
4. Click **"Save"**

### Method B: Database Trigger (SQL)

1. Go to Supabase Dashboard → **SQL Editor**
2. Create a new query
3. Copy and paste this SQL (replace placeholders):

```sql
-- Get your project ref from Supabase dashboard URL
-- Get service role key from Settings → API → service_role key

-- Create the trigger function
CREATE OR REPLACE FUNCTION notify_confirmation_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if status changed to 'confirmed'
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    -- Call the edge function
    PERFORM
      net.http_post(
        url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-confirmation-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
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
```

**Important:** 
- Replace `YOUR_PROJECT_REF` with your actual project ref
- Replace `YOUR_SERVICE_ROLE_KEY` with your service role key
- Make sure the `pg_net` extension is enabled (Supabase usually has it enabled by default)

4. Click **"Run"**

## Step 4: Test the Setup

### Test 1: Test the Function Directly

You can test the function manually using curl or Postman:

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-confirmation-email' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "record": {
      "id": "test-id",
      "reference_code": "TND123456",
      "car_name": "Test Car Model",
      "customer_name": "Test User",
      "customer_email": "your-test-email@gmail.com",
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

Replace:
- `YOUR_PROJECT_REF` with your project ref
- `YOUR_SERVICE_ROLE_KEY` with your service role key
- `your-test-email@gmail.com` with your actual email to test

### Test 2: Test via Admin Dashboard

1. Create a test car reservation through your website
2. Go to Admin Dashboard
3. Find the reservation and change its status to `confirmed`
4. Check the customer's email inbox for the confirmation email with PDF

## Step 5: Monitor Function Logs

View logs to debug any issues:

```bash
supabase functions logs send-confirmation-email --follow
```

Or in Supabase Dashboard:
- Go to **Edge Functions** → `send-confirmation-email` → **Logs**

## Troubleshooting

### Email Not Sending

1. **Check secrets are set:**
   ```bash
   supabase secrets list
   ```

2. **Verify Gmail App Password:**
   - Make sure you're using the 16-character App Password (not your regular Gmail password)
   - Ensure 2-Step Verification is enabled on your Google Account

3. **Check function logs:**
   ```bash
   supabase functions logs send-confirmation-email
   ```

4. **Test SMTP connection:**
   - Try port 587 with TLS instead of 465 with SSL
   - Update `SMTP_PORT=587` in secrets

### Trigger Not Firing

1. **For Webhooks:**
   - Check webhook is enabled in Dashboard
   - Verify filter: `status = 'confirmed'`
   - Check webhook logs in Dashboard

2. **For Database Triggers:**
   - Verify trigger exists:
     ```sql
     SELECT * FROM pg_trigger WHERE tgname = 'car_reservation_confirmed_trigger';
     ```
   - Test manually:
     ```sql
     UPDATE car_reservations 
     SET status = 'confirmed' 
     WHERE id = 'some-id' AND status != 'confirmed';
     ```

### Permission Errors

- Make sure you're using the **service_role** key (not anon key) for the trigger/webhook
- Service role key bypasses RLS policies

## Quick Reference

**Your Gmail SMTP Settings:**
- Host: `smtp.gmail.com`
- Port: `465` (SSL) or `587` (TLS)
- Username: `jkcar7647@gmail.com`
- Password: Your Gmail App Password (16 characters)
- From Email: `jkcar7647@gmail.com`
- From Name: `JK Cars`

**Function URL:**
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-confirmation-email
```

**Service Role Key Location:**
- Supabase Dashboard → Settings → API → service_role key

---

Once you complete these steps, the system will automatically send confirmation emails with PDF attachments when admins confirm car reservations! 🎉

