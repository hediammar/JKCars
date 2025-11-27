# 🔴 Troubleshooting RLS 401 Error

## Current Status
You're still getting error `42501` (insufficient_privilege) even after running fixes.

## Root Cause Analysis

The error "new row violates row-level security policy" means:
1. Either no INSERT policy exists for `anon` role
2. Or the WITH CHECK clause is failing
3. Or there's a conflicting policy blocking it

## Solution: Run FINAL_RLS_FIX.sql

This script:
1. **Temporarily disables RLS** (to clean up)
2. **Drops ALL existing policies** (removes conflicts)
3. **Grants explicit permissions** (gives anon INSERT rights)
4. **Re-enables RLS** with fresh policies
5. **Creates simple policies** with `WITH CHECK (true)` (always passes)

## Step-by-Step Instructions

### 1. Run the Fix Script
1. Open **Supabase Dashboard** → **SQL Editor**
2. Open `FINAL_RLS_FIX.sql`
3. **Copy the ENTIRE script** (everything)
4. **Paste into SQL Editor**
5. Click **Run** (or Ctrl+Enter)
6. Wait for "Success" message

### 2. Verify Policies Were Created
Run this query:
```sql
SELECT tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'car_reservations'
ORDER BY policyname;
```

**Expected Results:**
- `anon_insert_car` (INSERT, anon)
- `auth_insert_car` (INSERT, authenticated)
- `auth_select_car` (SELECT, authenticated)
- `auth_update_car` (UPDATE, authenticated)
- `auth_delete_car` (DELETE, authenticated)

### 3. Verify Permissions
Run this query:
```sql
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'car_reservations'
  AND grantee = 'anon';
```

**Expected Results:**
- `anon` should have `INSERT`
- `anon` should have `SELECT`

### 4. Test Direct Insert (Optional)
If you want to test directly in SQL:
```sql
-- Switch to anon role
SET ROLE anon;

-- Try inserting
INSERT INTO car_reservations (
  reference_code, car_id, car_name, pickup_date,
  pickup_location, total_price, customer_name,
  customer_email, customer_phone, payment_method
) VALUES (
  'TEST-' || gen_random_uuid()::text, '1', 'Test Car', '2025-12-01',
  'Tunis', 100.00, 'Test User',
  'test@example.com', '+216123456789', 'agency'
);

-- Reset role
RESET ROLE;
```

If this works, the policies are correct and the issue is elsewhere.

## If Still Not Working

### Check 1: Environment Variables
Verify in Vercel that you're using:
- `VITE_SUPABASE_ANON_KEY` = Your **anon/public** key (NOT service role)

To find it:
1. Supabase Dashboard → Settings → API
2. Copy "anon public" key
3. Make sure it matches Vercel

### Check 2: Supabase Project Settings
1. Go to **Settings** → **API**
2. Check **"Enable Row Level Security"** is ON
3. Check **"Enable PostgREST"** is ON

### Check 3: Check for Conflicting Policies
```sql
-- List ALL policies (including from other schemas)
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename IN ('car_reservations', 'excursion_reservations', 'airport_reservations')
ORDER BY schemaname, tablename, policyname;
```

If you see policies in schemas other than `public`, that might be the issue.

### Check 4: Verify Table Ownership
```sql
SELECT tablename, tableowner
FROM pg_tables
WHERE tablename IN ('car_reservations', 'excursion_reservations', 'airport_reservations');
```

Tables should be owned by a user that can grant permissions.

### Check 5: Check PostgREST Logs
1. Go to **Logs** → **Postgres Logs**
2. Look for errors around the time of your request
3. Check for any policy-related errors

## Nuclear Option: Temporarily Disable RLS

If nothing works, you can temporarily disable RLS to test:

```sql
ALTER TABLE car_reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE excursion_reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE airport_reservations DISABLE ROW LEVEL SECURITY;
```

**⚠️ WARNING:** This makes tables publicly writable. Only use for testing, then re-enable RLS!

To re-enable:
```sql
ALTER TABLE car_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE excursion_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE airport_reservations ENABLE ROW LEVEL SECURITY;
```

## Files to Use

1. **`FINAL_RLS_FIX.sql`** - Most comprehensive fix (USE THIS)
2. `URGENT_RLS_FIX.sql` - Previous version
3. `verify_reservations.sql` - Verification queries

## After Running FINAL_RLS_FIX.sql

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** the page (Ctrl+F5)
3. **Try creating a reservation again**
4. Check browser console for any new errors

If it still doesn't work, the issue might be:
- Environment variables not set correctly in Vercel
- Cached JavaScript bundle with old Supabase client
- Network/CORS issues

