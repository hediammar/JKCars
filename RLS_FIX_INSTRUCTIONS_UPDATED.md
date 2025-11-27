# 🔴 URGENT: Fix RLS 401 Error

## The Problem
You're getting a **401 Unauthorized** error with code `42501` (insufficient_privilege) when trying to create reservations. This means the RLS policies aren't allowing the `anon` role to insert.

## The Solution

### Step 1: Run the Comprehensive Fix
1. Open **Supabase Dashboard** → **SQL Editor**
2. Open the file `URGENT_RLS_FIX.sql`
3. **Copy the ENTIRE script**
4. **Paste it into SQL Editor**
5. Click **Run** (or press Ctrl+Enter)

### Step 2: Verify It Worked
After running, execute this query to verify:

```sql
-- Check policies were created
SELECT tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'car_reservations'
ORDER BY policyname;
```

You should see:
- `anon_can_insert_car_reservations` (INSERT, anon)
- `authenticated_can_insert_car_reservations` (INSERT, authenticated)
- `authenticated_can_select_car_reservations` (SELECT, authenticated)
- `authenticated_can_update_car_reservations` (UPDATE, authenticated)
- `authenticated_can_delete_car_reservations` (DELETE, authenticated)

### Step 3: Check Permissions
```sql
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'car_reservations'
  AND grantee = 'anon';
```

You should see:
- `anon` has `INSERT` privilege
- `anon` has `SELECT` privilege

## What This Fix Does

1. **Drops ALL existing policies** - Removes any conflicting policies
2. **Grants explicit permissions** - Gives `anon` role INSERT permission on tables
3. **Creates separate policies** - One for `anon`, one for `authenticated`
4. **Grants enum type usage** - Allows `anon` to use enum types

## Why the Previous Fix Didn't Work

The issue was likely:
- Missing `GRANT` statements (RLS policies alone aren't enough)
- Conflicting policies
- Enum type permissions not granted

## After Running the Fix

1. **Clear your browser cache** (or do a hard refresh)
2. **Try creating a reservation again**
3. It should work now! ✅

## Still Not Working?

If you still get errors:

1. **Check your environment variables** in Vercel:
   - `VITE_SUPABASE_URL` - Should be your project URL
   - `VITE_SUPABASE_ANON_KEY` - Should be the **anon/public** key (NOT service role)

2. **Verify in Supabase Dashboard**:
   - Go to Settings → API
   - Copy the "anon public" key
   - Make sure it matches what's in Vercel

3. **Check Supabase Logs**:
   - Go to Logs → Postgres Logs
   - Look for any policy-related errors

4. **Test with a direct SQL insert** (as anon):
   ```sql
   -- This should work after the fix
   SET ROLE anon;
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

## Files to Use

- **`URGENT_RLS_FIX.sql`** - The comprehensive fix (USE THIS ONE)
- `fix_rls_policies_comprehensive.sql` - Alternative version
- `verify_reservations.sql` - Verification queries

