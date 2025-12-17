# Supabase Edge Function Setup Guide

This guide will help you set up the email confirmation system using Supabase Edge Functions.

## Overview

When an admin confirms a car reservation (changes status from `pending` to `confirmed`), an email with a PDF attachment is automatically sent to the customer.

## Prerequisites

1. **Supabase Account** - You already have this
2. **Resend Account** - Sign up at [resend.com](https://resend.com) (free tier available)
3. **Supabase CLI** - Install it: `npm install -g supabase`

## Step-by-Step Setup

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

This will open your browser to authenticate.

### Step 3: Link Your Project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

**Find your project ref:**
- Go to your Supabase Dashboard
- Look at the URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
- Or go to Settings → General → Reference ID

### Step 4: Set Up Resend

1. **Sign up at [resend.com](https://resend.com)**
2. **Create an API Key:**
   - Go to API Keys section
   - Click "Create API Key"
   - Copy the key (starts with `re_`)
3. **Verify your domain** (optional but recommended):
   - Add your domain (e.g., `jkcars.tn`)
   - Add DNS records as instructed
   - Or use the default `onboarding.resend.com` for testing

### Step 5: Set Environment Variables

Set the secrets in Supabase:

```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
supabase secrets set RESEND_FROM_EMAIL=noreply@jkcars.tn
```

**Note:** If you haven't verified a domain, use `onboarding@resend.com` for testing.

### Step 6: Deploy the Edge Function

From the project root directory:

```bash
supabase functions deploy send-confirmation-email
```

You should see output like:
```
Deploying function send-confirmation-email...
Function send-confirmation-email deployed successfully!
```

### Step 7: Set Up Database Trigger

You have **three options** for triggering the function:

#### Option A: Using Supabase Webhooks (Recommended - Easiest)

1. Go to Supabase Dashboard → Database → Webhooks
2. Click "Create a new webhook"
3. Configure:
   - **Name:** `car_reservation_confirmation`
   - **Table:** `car_reservations`
   - **Events:** Check `Update`
   - **HTTP Request:**
     - **URL:** `https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-confirmation-email`
     - **Method:** `POST`
     - **HTTP Request Headers:**
       - Key: `Authorization`
       - Value: `Bearer YOUR_SERVICE_ROLE_KEY`
     - **HTTP Request Body:** Leave as default (it will send the record)
   - **Filter:** Add a filter: `status = 'confirmed'`
4. Click "Save"

**Get your Service Role Key:**
- Supabase Dashboard → Settings → API
- Copy the `service_role` key (keep this secret!)

#### Option B: Using Database Trigger (More Control)

Run the SQL script in `database_triggers/send_confirmation_email_trigger.sql`:

1. Go to Supabase Dashboard → SQL Editor
2. Open the file `database_triggers/send_confirmation_email_trigger.sql`
3. **Replace placeholders:**
   - `YOUR_PROJECT_REF` → Your actual project ref
   - `YOUR_SERVICE_ROLE_KEY` → Your service role key
4. Run the SQL script

#### Option C: Call from Admin Dashboard (Simplest for Testing)

Modify `client/src/pages/AdminDashboard.tsx` to call the function directly:

```typescript
const handleStatusUpdate = async (reservation: AdminEvent, newStatus: ReservationStatus) => {
  try {
    // ... existing code ...
    
    // If confirming a car reservation, trigger email
    if (reservation.type === 'car' && newStatus === 'confirmed') {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-confirmation-email`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              record: reservation, // Make sure this matches the CarReservation structure
            }),
          }
        );
      }
    }
    
    // ... rest of existing code ...
  } catch (error) {
    // ... error handling ...
  }
};
```

**Note:** This approach requires the function to accept requests from authenticated users. You may need to adjust the function's CORS settings.

### Step 8: Test the Function

#### Test Manually via cURL:

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
      "customer_email": "your-email@example.com",
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

#### Test via Admin Dashboard:

1. Create a test car reservation
2. In Admin Dashboard, change its status to `confirmed`
3. Check the customer's email inbox

### Step 9: Monitor Function Logs

View logs in real-time:

```bash
supabase functions logs send-confirmation-email --follow
```

Or in Supabase Dashboard:
- Go to Edge Functions → `send-confirmation-email` → Logs

## Troubleshooting

### Email Not Sending

1. **Check Resend API Key:**
   ```bash
   supabase secrets list
   ```

2. **Check Function Logs:**
   ```bash
   supabase functions logs send-confirmation-email
   ```

3. **Verify Resend Domain:**
   - Go to Resend Dashboard → Domains
   - Make sure your domain is verified OR use `onboarding@resend.com`

### PDF Generation Errors

- Check function logs for specific errors
- Verify all reservation fields are present
- Test with a minimal record first

### Trigger Not Firing

1. **For Webhooks:**
   - Check webhook is enabled in Dashboard
   - Verify filter is correct: `status = 'confirmed'`
   - Check webhook logs in Dashboard

2. **For Database Triggers:**
   - Verify trigger exists:
     ```sql
     SELECT * FROM pg_trigger WHERE tgname = 'car_reservation_confirmed_trigger';
     ```
   - Test trigger manually:
     ```sql
     UPDATE car_reservations 
     SET status = 'confirmed' 
     WHERE id = 'some-id' AND status != 'confirmed';
     ```

### Permission Errors

- Ensure you're using the **service_role** key (not anon key) for the trigger
- Service role key bypasses RLS policies

## Security Notes

1. **Never expose service_role key** in client-side code
2. **Use webhooks or database triggers** instead of calling from client
3. **Keep Resend API key secret** - only set via Supabase secrets
4. **Verify email domains** in production

## Cost Considerations

- **Supabase Edge Functions:** Free tier includes 500K invocations/month
- **Resend:** Free tier includes 3,000 emails/month, then $20/month for 50K emails
- **PDF Generation:** Included in Edge Function execution time

## Next Steps

1. ✅ Deploy the function
2. ✅ Set up the trigger/webhook
3. ✅ Test with a real reservation
4. ✅ Monitor logs for first few confirmations
5. ✅ Customize email template if needed
6. ✅ Set up email domain verification in Resend

## Support

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Resend API Docs](https://resend.com/docs/api-reference/emails/send-email)
- [PDF-lib Docs](https://pdf-lib.js.org/)

