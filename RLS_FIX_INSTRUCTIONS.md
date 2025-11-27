# Fix RLS Policy Error for Reservations

## Problem
You're getting this error when trying to create a reservation:
```
new row violates row-level security policy for table "car_reservations"
```

## Solution

### Step 1: Run the SQL Fix
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file `fix_rls_policies.sql` from this project
4. Copy and paste the entire SQL script
5. Click **Run** to execute

### Step 2: Verify Policies Were Created
Run this query in SQL Editor to check:
```sql
SELECT * FROM pg_policies WHERE tablename = 'car_reservations';
```

You should see 4 policies:
- Public can insert car reservations
- Admins can read car reservations
- Admins can update car reservations
- Admins can delete car reservations

### Step 3: Verify RLS is Enabled
```sql
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('car_reservations', 'excursion_reservations', 'airport_reservations');
```

All should show `rowsecurity = true`

### Step 4: Check Your Environment Variables
Make sure in Vercel (or your deployment) you have:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase **anon/public** key (NOT the service role key)

You can find these in:
- Supabase Dashboard → Settings → API → Project URL and anon/public key

### Step 5: Test the Booking
After applying the SQL fix, try creating a reservation again from your website.

## Why This Happens
Row Level Security (RLS) was enabled on the tables, but the policies allowing public inserts weren't properly applied. The SQL script will:
1. Drop any existing conflicting policies
2. Recreate the correct policies that allow:
   - **Public (anon) users** to INSERT reservations (for bookings)
   - **Authenticated users** to READ/UPDATE/DELETE (for admin dashboard)

## Still Having Issues?

If you still get errors after running the SQL:

1. **Check the Supabase logs:**
   - Go to Supabase Dashboard → Logs → Postgres Logs
   - Look for any policy-related errors

2. **Verify enum types exist:**
   ```sql
   SELECT typname FROM pg_type 
   WHERE typname IN ('reservation_status', 'payment_method');
   ```
   If these don't exist, you need to create them first (see `supabase_schema.sql`)

3. **Check table structure matches:**
   Make sure your table columns match what the code expects. The error might be due to a column mismatch.

4. **Test with a direct SQL insert:**
   ```sql
   -- This should work after applying policies
   INSERT INTO car_reservations (
     reference_code, car_id, car_name, pickup_date, 
     pickup_location, total_price, customer_name, 
     customer_email, customer_phone, payment_method
   ) VALUES (
     'TEST-001', '1', 'Test Car', '2025-12-01',
     'Tunis', 100.00, 'Test User',
     'test@example.com', '+216123456789', 'agency'
   );
   ```

