-- Custom Commission & Algerian Market Optimization Migration
-- Run these queries in your Supabase SQL editor to update your schema.

-- 1. Remove the old room-level commission column if it exists
ALTER TABLE public.program_room_prices DROP COLUMN IF EXISTS commission;

-- 2. Add adult and child commission columns, flight type, and child price to programs table
ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS adult_commission numeric(12, 2) NOT NULL DEFAULT 0.00 CHECK (adult_commission >= 0);

ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS child_commission numeric(12, 2) NOT NULL DEFAULT 0.00 CHECK (child_commission >= 0);

ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS flight_type text NOT NULL DEFAULT 'direct' CHECK (flight_type in ('direct', 'transit'));

ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS child_price numeric(12, 2) NOT NULL DEFAULT 0.00 CHECK (child_price >= 0);

-- 3. Add adults_count, children_count, and commission_value columns to booking_requests table
ALTER TABLE public.booking_requests 
ADD COLUMN IF NOT EXISTS adults_count integer NOT NULL DEFAULT 1 CHECK (adults_count >= 1);

ALTER TABLE public.booking_requests 
ADD COLUMN IF NOT EXISTS children_count integer NOT NULL DEFAULT 0 CHECK (children_count >= 0);

ALTER TABLE public.booking_requests 
ADD COLUMN IF NOT EXISTS commission_value numeric(12, 2) CHECK (commission_value >= 0);

-- 4. Add CCP, branch address, and contract verification columns to agencies table
ALTER TABLE public.agencies 
ADD COLUMN IF NOT EXISTS contract_signed boolean NOT NULL DEFAULT false;

ALTER TABLE public.agencies 
ADD COLUMN IF NOT EXISTS ccp_number text;

ALTER TABLE public.agencies 
ADD COLUMN IF NOT EXISTS ccp_holder text;

ALTER TABLE public.agencies 
ADD COLUMN IF NOT EXISTS branches text;

-- 5. Add comments for clarity
COMMENT ON COLUMN public.programs.adult_commission IS 'Platform commission amount in DZD set by agency for an adult traveler';
COMMENT ON COLUMN public.programs.child_commission IS 'Platform commission amount in DZD set by agency for a child traveler';
COMMENT ON COLUMN public.programs.flight_type IS 'Whether the flight is direct or contains transit stops';
COMMENT ON COLUMN public.programs.child_price IS 'Estimated price in DZD for a child traveler';
COMMENT ON COLUMN public.booking_requests.adults_count IS 'Number of adult travelers in the booking request';
COMMENT ON COLUMN public.booking_requests.children_count IS 'Number of child travelers in the booking request';
COMMENT ON COLUMN public.booking_requests.commission_value IS 'Calculated total commission value in DZD for this booking';
COMMENT ON COLUMN public.agencies.contract_signed IS 'Whether the agency has signed the official legal contract with the admin';
COMMENT ON COLUMN public.agencies.ccp_number IS 'Agency CCP Account number';
COMMENT ON COLUMN public.agencies.ccp_holder IS 'Agency CCP Account holder full name';
COMMENT ON COLUMN public.agencies.branches IS 'Agency physical branches list and geographical locations in Algeria';
