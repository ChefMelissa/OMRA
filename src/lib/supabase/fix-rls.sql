-- ========================================================
-- RLS Infinite Recursion Fix
-- Run this in the Supabase SQL Editor to fix the login block.
-- ========================================================

-- 1. Drop the recursive admin policies that cause crashes
drop policy if exists "Admin full access on profiles" on public.profiles;
drop policy if exists "Admin full access on agencies" on public.agencies;
drop policy if exists "Admin full access on programs" on public.programs;
drop policy if exists "Admin full access on program_hotels" on public.program_hotels;
drop policy if exists "Admin full access on program_room_prices" on public.program_room_prices;
drop policy if exists "Admin full access on program_inclusions" on public.program_inclusions;
drop policy if exists "Admin full access on booking_requests" on public.booking_requests;
drop policy if exists "Admin full access on commission_settlements" on public.commission_settlements;
drop policy if exists "Admin full access on inquiries" on public.inquiries;
drop policy if exists "Admin full access on edit_requests" on public.edit_requests;

-- 2. Create a security definer function to check if the user is an admin.
-- Running with 'security definer' bypasses RLS on the profiles table
-- and prevents the infinite recursion.
create or replace function public.is_admin()
returns boolean as $$
begin
    return exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
    );
end;
$$ language plpgsql security definer set search_path = public;

-- 3. Re-create the admin policies using the helper function
create policy "Admin full access on profiles" on public.profiles for all to authenticated using (public.is_admin());
create policy "Admin full access on agencies" on public.agencies for all to authenticated using (public.is_admin());
create policy "Admin full access on programs" on public.programs for all to authenticated using (public.is_admin());
create policy "Admin full access on program_hotels" on public.program_hotels for all to authenticated using (public.is_admin());
create policy "Admin full access on program_room_prices" on public.program_room_prices for all to authenticated using (public.is_admin());
create policy "Admin full access on program_inclusions" on public.program_inclusions for all to authenticated using (public.is_admin());
create policy "Admin full access on booking_requests" on public.booking_requests for all to authenticated using (public.is_admin());
create policy "Admin full access on commission_settlements" on public.commission_settlements for all to authenticated using (public.is_admin());
create policy "Admin full access on inquiries" on public.inquiries for all to authenticated using (public.is_admin());
create policy "Admin full access on edit_requests" on public.edit_requests for all to authenticated using (public.is_admin());
