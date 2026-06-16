-- Custom Commission Migration
-- Run these queries in your Supabase SQL editor to enable custom commissions per room type and program.

-- 1. Add commission column to program_room_prices
ALTER TABLE public.program_room_prices 
ADD COLUMN commission numeric(12, 2) NOT NULL DEFAULT 0.00 CHECK (commission >= 0);

-- 2. Add commission_value column to booking_requests
ALTER TABLE public.booking_requests 
ADD COLUMN commission_value numeric(12, 2) CHECK (commission_value >= 0);

COMMENT ON COLUMN public.program_room_prices.commission IS 'Platform commission amount in DZD set by agency for this specific room type and program';
COMMENT ON COLUMN public.booking_requests.commission_value IS 'Locked commission amount in DZD at the time the booking request was confirmed';
