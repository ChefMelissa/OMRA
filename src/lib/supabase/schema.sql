-- OMRA Database Schema
-- Place this in the Supabase SQL Editor to initialize the database tables.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    role text not null check (role in ('agency', 'admin')) default 'agency',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

-- 2. Agencies Table
create table public.agencies (
    id uuid references public.profiles(id) on delete cascade primary key,
    name text not null,
    license_number text not null,
    logo_url text,
    description text,
    city text not null,
    phone text not null,
    whatsapp text not null,
    email text not null,
    status text not null check (status in ('pending', 'approved', 'rejected', 'suspended')) default 'pending',
    rejection_reason text,
    commission_rate numeric(5, 2) not null default 5.00 check (commission_rate >= 0),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.agencies enable row level security;

-- 3. Programs Table
create table public.programs (
    id uuid primary key default gen_random_uuid(),
    agency_id uuid references public.agencies(id) on delete cascade not null,
    title text not null,
    description text,
    duration_days integer not null check (duration_days > 0),
    departure_date date not null,
    return_date date not null,
    departure_city text not null,
    airline text not null,
    seats_available integer not null default 0 check (seats_available >= 0),
    status text not null check (status in ('draft', 'active', 'closed')) default 'draft',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint departure_before_return check (departure_date <= return_date)
);

alter table public.programs enable row level security;

-- 4. Program Hotels Table
create table public.program_hotels (
    id uuid primary key default gen_random_uuid(),
    program_id uuid references public.programs(id) on delete cascade not null,
    city text not null check (city in ('مكة', 'المدينة')),
    hotel_name text not null,
    stars integer not null check (stars between 1 and 5),
    distance_meters integer not null check (distance_meters >= 0),
    nights integer not null check (nights >= 0),
    board_basis text, -- (فطور، نصف إقامة، إقامة كاملة، بدون وجبات)
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.program_hotels enable row level security;

-- 5. Program Room Prices Table (Prices are in Algerian Dinar - DZD)
create table public.program_room_prices (
    id uuid primary key default gen_random_uuid(),
    program_id uuid references public.programs(id) on delete cascade not null,
    room_type text not null check (room_type in ('ثنائية', 'ثلاثية', 'رباعية', 'خماسية')),
    price numeric(12, 2) not null check (price >= 0),
    commission numeric(12, 2) not null default 0.00 check (commission >= 0),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_program_room_type unique (program_id, room_type)
);

alter table public.program_room_prices enable row level security;

-- 6. Program Inclusions Table
create table public.program_inclusions (
    id uuid primary key default gen_random_uuid(),
    program_id uuid references public.programs(id) on delete cascade not null,
    inclusion text not null -- e.g. التأشيرة، النقل، المزارات
);

alter table public.program_inclusions enable row level security;

-- 7. Booking Requests Table (Algerian Dinar - DZD for booking_value)
create table public.booking_requests (
    id uuid primary key default gen_random_uuid(),
    reference_number text not null unique,
    program_id uuid references public.programs(id) on delete set null,
    agency_id uuid references public.agencies(id) on delete cascade not null,
    customer_name text not null,
    customer_phone text not null,
    is_whatsapp boolean not null default false,
    room_type text not null check (room_type in ('ثنائية', 'ثلاثية', 'رباعية', 'خماسية')),
    notes text,
    status text not null check (status in ('new', 'contacted', 'booked', 'cancelled')) default 'new',
    booking_value numeric(12, 2) check (booking_value >= 0),
    commission_value numeric(12, 2) check (commission_value >= 0),
    admin_approval text not null check (admin_approval in ('pending', 'approved', 'rejected')) default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.booking_requests enable row level security;

-- 8. Commission Settlements Table (Algerian Dinar - DZD)
create table public.commission_settlements (
    id uuid primary key default gen_random_uuid(),
    agency_id uuid references public.agencies(id) on delete cascade not null,
    period_start date not null,
    period_end date not null,
    bookings_count integer not null default 0 check (bookings_count >= 0),
    total_bookings_value numeric(12, 2) not null default 0.00 check (total_bookings_value >= 0),
    total_commission numeric(12, 2) not null default 0.00 check (total_commission >= 0),
    status text not null check (status in ('unpaid', 'paid')) default 'unpaid',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_agency_period unique (agency_id, period_start, period_end)
);

alter table public.commission_settlements enable row level security;

-- 9. Inquiries (Analytics) Table
create table public.inquiries (
    id uuid primary key default gen_random_uuid(),
    program_id uuid references public.programs(id) on delete cascade not null,
    type text not null check (type in ('view', 'whatsapp_click', 'call_click')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.inquiries enable row level security;

-- 10. Edit Requests Table
create table public.edit_requests (
    id uuid primary key default gen_random_uuid(),
    program_id uuid references public.programs(id) on delete cascade not null,
    admin_notes text not null,
    status text not null check (status in ('pending', 'resolved')) default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.edit_requests enable row level security;


-- ==========================================
-- Triggers and Functions
-- ==========================================

-- Function: Auto update updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_agencies_updated_at before update on public.agencies
    for each row execute procedure public.update_updated_at_column();

create trigger update_programs_updated_at before update on public.programs
    for each row execute procedure public.update_updated_at_column();

create trigger update_booking_requests_updated_at before update on public.booking_requests
    for each row execute procedure public.update_updated_at_column();

create trigger update_commission_settlements_updated_at before update on public.commission_settlements
    for each row execute procedure public.update_updated_at_column();

-- Trigger: Insert profile when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, role)
    values (new.id, 'agency');
    return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();


-- ==========================================
-- Row Level Security (RLS) Policies
-- ==========================================

-- Profiles Policies
create policy "Allow public read of profiles"
    on public.profiles for select
    to authenticated, anon
    using (true);

create policy "Allow users to update their own profile"
    on public.profiles for update
    to authenticated
    using (auth.uid() = id);

-- Agencies Policies
create policy "Allow public read of approved agencies"
    on public.agencies for select
    to authenticated, anon
    using (status = 'approved');

create policy "Allow agency owner read/write of own agency"
    on public.agencies for all
    to authenticated
    using (auth.uid() = id)
    with check (auth.uid() = id);

-- Programs Policies
create policy "Allow public read of active programs"
    on public.programs for select
    to authenticated, anon
    using (status = 'active' and exists (
        select 1 from public.agencies
        where agencies.id = programs.agency_id and agencies.status = 'approved'
    ));

create policy "Allow agency to manage own programs"
    on public.programs for all
    to authenticated
    using (auth.uid() = agency_id)
    with check (auth.uid() = agency_id);

-- Program Hotels Policies
create policy "Allow public read of hotels of active programs"
    on public.program_hotels for select
    to authenticated, anon
    using (exists (
        select 1 from public.programs
        join public.agencies on agencies.id = programs.agency_id
        where programs.id = program_hotels.program_id
        and programs.status = 'active'
        and agencies.status = 'approved'
    ));

create policy "Allow agency to manage own program hotels"
    on public.program_hotels for all
    to authenticated
    using (exists (
        select 1 from public.programs
        where programs.id = program_hotels.program_id
        and programs.agency_id = auth.uid()
    ));

-- Program Room Prices Policies
create policy "Allow public read of room prices of active programs"
    on public.program_room_prices for select
    to authenticated, anon
    using (exists (
        select 1 from public.programs
        join public.agencies on agencies.id = programs.agency_id
        where programs.id = program_room_prices.program_id
        and programs.status = 'active'
        and agencies.status = 'approved'
    ));

create policy "Allow agency to manage own program room prices"
    on public.program_room_prices for all
    to authenticated
    using (exists (
        select 1 from public.programs
        where programs.id = program_room_prices.program_id
        and programs.agency_id = auth.uid()
    ));

-- Program Inclusions Policies
create policy "Allow public read of inclusions of active programs"
    on public.program_inclusions for select
    to authenticated, anon
    using (exists (
        select 1 from public.programs
        join public.agencies on agencies.id = programs.agency_id
        where programs.id = program_inclusions.program_id
        and programs.status = 'active'
        and agencies.status = 'approved'
    ));

create policy "Allow agency to manage own program inclusions"
    on public.program_inclusions for all
    to authenticated
    using (exists (
        select 1 from public.programs
        where programs.id = program_inclusions.program_id
        and programs.agency_id = auth.uid()
    ));

-- Booking Requests Policies (Citizen creates them, agency can manage own)
create policy "Allow public to submit booking requests"
    on public.booking_requests for insert
    to authenticated, anon
    with check (true);

create policy "Allow agency to view and update own booking requests"
    on public.booking_requests for all
    to authenticated
    using (agency_id = auth.uid())
    with check (agency_id = auth.uid());

-- Commission Settlements Policies
create policy "Allow agency to view own settlements"
    on public.commission_settlements for select
    to authenticated
    using (agency_id = auth.uid());

-- Inquiries Policies
create policy "Allow public to insert inquiries"
    on public.inquiries for insert
    to authenticated, anon
    with check (true);

-- Edit Requests Policies
create policy "Allow agency to view own edit requests"
    on public.edit_requests for select
    to authenticated
    using (exists (
        select 1 from public.programs
        where programs.id = edit_requests.program_id
        and programs.agency_id = auth.uid()
    ));


-- ==========================================
-- Admin Overrides (Bypass RLS using Service Role or Admin role check)
-- ==========================================

-- Admin policies for all tables
create policy "Admin full access on profiles" on public.profiles for all to authenticated
    using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admin full access on agencies" on public.agencies for all to authenticated
    using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admin full access on programs" on public.programs for all to authenticated
    using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admin full access on program_hotels" on public.program_hotels for all to authenticated
    using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admin full access on program_room_prices" on public.program_room_prices for all to authenticated
    using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admin full access on program_inclusions" on public.program_inclusions for all to authenticated
    using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admin full access on booking_requests" on public.booking_requests for all to authenticated
    using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admin full access on commission_settlements" on public.commission_settlements for all to authenticated
    using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admin full access on inquiries" on public.inquiries for all to authenticated
    using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admin full access on edit_requests" on public.edit_requests for all to authenticated
    using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));


-- ========================================================
-- Query Performance Indexes
-- ========================================================

-- Indexes for frequently joined/filtered foreign keys
create index if not exists idx_programs_agency_id on public.programs(agency_id);
create index if not exists idx_programs_status on public.programs(status);
create index if not exists idx_program_hotels_program_id on public.program_hotels(program_id);
create index if not exists idx_program_room_prices_program_id on public.program_room_prices(program_id);
create index if not exists idx_program_inclusions_program_id on public.program_inclusions(program_id);
create index if not exists idx_booking_requests_agency_id on public.booking_requests(agency_id);
create index if not exists idx_booking_requests_program_id on public.booking_requests(program_id);
create index if not exists idx_booking_requests_status on public.booking_requests(status);
create index if not exists idx_commission_settlements_agency_id on public.commission_settlements(agency_id);
create index if not exists idx_inquiries_program_id on public.inquiries(program_id);
create index if not exists idx_edit_requests_program_id on public.edit_requests(program_id);

