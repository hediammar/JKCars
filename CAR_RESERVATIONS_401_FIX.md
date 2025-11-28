# Fix for 401 Unauthorized Error on Car Reservations

## Problem
When users try to book a car rental, they receive a **401 Unauthorized** error with PostgreSQL error code `42501` (insufficient_privilege). This happens when the `anon` role tries to INSERT into the `car_reservations` table.

## Root Cause
The error occurs because:
1. **Row Level Security (RLS)** is enabled on the table
2. The `anon` role either:
   - Doesn't have INSERT permission on the table, OR
   - Doesn't have an RLS policy allowing INSERT operations

## Solution
Run the SQL script `fix_car_reservations_permissions.sql` in your Supabase SQL Editor. This script will:

1. ✅ Grant schema usage to `anon` and `authenticated` roles
2. ✅ Grant INSERT and SELECT permissions on all reservation tables
3. ✅ Grant usage on enum types (`payment_method`, `reservation_status`)
4. ✅ Ensure RLS is enabled on all tables
5. ✅ Create RLS policies allowing `anon` to INSERT and SELECT
6. ✅ Create RLS policies for `authenticated` users (admins)

## How to Apply the Fix

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `fix_car_reservations_permissions.sql`
4. Click **Run** to execute the script
5. Verify the setup by running the verification queries at the end of the script

## Verification

After running the script, you should see:
- ✅ RLS enabled on all reservation tables
- ✅ Policies for `anon` INSERT and SELECT operations
- ✅ Table permissions granted to `anon` role
- ✅ Enum type permissions granted

## Testing

After applying the fix, test the booking flow:
1. Navigate to a car detail page
2. Select dates and location
3. Fill in customer information
4. Submit the booking

The booking should now succeed without a 401 error.

## Notes

- The `anon` role needs SELECT permission because the code calls `.select()` after `.insert()` to return the created record
- Both INSERT and SELECT policies are needed for the booking flow to work
- The `authenticated` role (admins) has full CRUD permissions for managing reservations

