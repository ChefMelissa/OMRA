-- Secure Profiles RLS Policy Migration
-- Run this query in your Supabase SQL editor to secure the profiles table.

-- 1. Drop the old insecure policy that allows public read of all profiles
DROP POLICY IF EXISTS "Allow public read of profiles" ON public.profiles;

-- 2. Create a secure policy that only allows authenticated users to read their own profile
CREATE POLICY "Allow users to read their own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- 3. The admin policy already exists and gives admins full access:
-- CREATE POLICY "Admin full access on profiles" ON public.profiles FOR ALL TO authenticated USING (public.is_admin());
