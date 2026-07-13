-- ═══════════════════════════════════════════════════════════
-- HavenIQ Database Schema
-- Run this in Supabase → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════

-- ── Businesses ───────────────────────────────────────────────
-- One row per business owner account
create table if not exists businesses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null unique,
  name          text,
  type          text,
  email         text,
  phone         text,
  slug          text unique, -- used in booking URL e.g. /book/glam-studio
  created_at    timestamptz default now()
);

-- ── Bookings ─────────────────────────────────────────────────
create table if not exists bookings (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid references businesses(id) on delete cascade not null,
  customer_name   text not null,
  customer_email  text,
  customer_phone  text,
  service         text,
  date            text,
  time            text,
  notes           text,
  status          text default 'pending', -- pending | confirmed | declined | missing | replied
  file_name       text,
  file_preview    text, -- base64 data URL for image preview
  created_at      timestamptz default now()
);

-- ── Quotes ───────────────────────────────────────────────────
create table if not exists quotes (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid references businesses(id) on delete cascade not null,
  customer_name   text not null,
  customer_email  text,
  service         text,
  message         text,
  details         jsonb default '[]',
  status          text default 'open', -- open | sent
  created_at      timestamptz default now()
);

-- ── Complaints ───────────────────────────────────────────────
create table if not exists complaints (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid references businesses(id) on delete cascade not null,
  customer_name   text not null,
  customer_email  text,
  service         text,
  date            text,
  message         text,
  status          text default 'open', -- open | replied | resolved
  created_at      timestamptz default now()
);

-- ── Enquiries ────────────────────────────────────────────────
create table if not exists enquiries (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid references businesses(id) on delete cascade not null,
  customer_name   text not null,
  customer_email  text,
  topic           text,
  channel         text default 'Booking page',
  message         text,
  status          text default 'open', -- open | replied
  created_at      timestamptz default now()
);

-- ── Business settings ────────────────────────────────────────
create table if not exists business_settings (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid references businesses(id) on delete cascade not null unique,
  working_hours   jsonb default '[]',
  services        jsonb default '[]',
  notifications   jsonb default '{}',
  appointment_duration text default '60 minutes',
  updated_at      timestamptz default now()
);

-- ── Knowledge blocks ─────────────────────────────────────────
create table if not exists knowledge_blocks (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid references businesses(id) on delete cascade not null,
  category        text not null,
  label           text,
  content         text,
  created_at      timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════
-- Row Level Security — each business only sees their own data
-- ═══════════════════════════════════════════════════════════

alter table businesses       enable row level security;
alter table bookings         enable row level security;
alter table quotes           enable row level security;
alter table complaints       enable row level security;
alter table enquiries        enable row level security;
alter table business_settings enable row level security;
alter table knowledge_blocks enable row level security;

-- Businesses: owner can read/write their own row
create policy "businesses_owner" on businesses
  for all using (auth.uid() = user_id);

-- Helper: get business_id for current user
create or replace function get_my_business_id()
returns uuid language sql security definer as $$
  select id from businesses where user_id = auth.uid() limit 1;
$$;

-- Bookings: owner can read/write their own business bookings
create policy "bookings_owner" on bookings
  for all using (business_id = get_my_business_id());

-- Public insert for booking page (anyone can submit a booking)
create policy "bookings_public_insert" on bookings
  for insert with check (true);

-- Quotes: owner only
create policy "quotes_owner" on quotes
  for all using (business_id = get_my_business_id());

-- Complaints: owner only
create policy "complaints_owner" on complaints
  for all using (business_id = get_my_business_id());

-- Enquiries: owner only
create policy "enquiries_owner" on enquiries
  for all using (business_id = get_my_business_id());

-- Settings: owner only
create policy "settings_owner" on business_settings
  for all using (business_id = get_my_business_id());

-- Knowledge: owner only
create policy "knowledge_owner" on knowledge_blocks
  for all using (business_id = get_my_business_id());

-- ═══════════════════════════════════════════════════════════
-- Auto-create business row when user signs up
-- ═══════════════════════════════════════════════════════════
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into businesses (user_id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ═══════════════════════════════════════════════════════════
-- Public read policies (required for unauthenticated booking page)
-- ═══════════════════════════════════════════════════════════
create policy "businesses_public_read" on businesses
  for select using (true);

create policy "business_settings_public_read" on business_settings
  for select using (true);

create policy "bookings_public_read" on bookings
  for select using (true);

-- ── Feedback ─────────────────────────────────────────────
create table if not exists feedback (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid references businesses(id) on delete set null,
  business_name text,
  user_email    text,
  type          text, -- bug | feature | general
  message       text,
  created_at    timestamptz default now()
);

alter table feedback enable row level security;
create policy "feedback_insert" on feedback for insert with check (true);
create policy "feedback_owner_read" on feedback for select using (auth.uid() is not null);

-- Add show_deposit column to business_settings
alter table business_settings add column if not exists show_deposit boolean default true;

-- Add contact_method to bookings
alter table bookings add column if not exists contact_method text default 'email';

-- ═══════════════════════════════════════════════════════════
-- Knowledge base: public read (deposit/cancellation/aftercare/
-- location notes are meant to be shown on the public booking page)
-- ═══════════════════════════════════════════════════════════
create policy "knowledge_blocks_public_read" on knowledge_blocks
  for select using (true);

-- ═══════════════════════════════════════════════════════════
-- Lock down public access to bookings.
-- "bookings_public_read" previously exposed the ENTIRE bookings
-- table (customer name, email, phone, notes) to anyone, unauthenticated,
-- for every business on the platform. The public booking page only
-- ever needed date/time/service/status to check for slot conflicts,
-- so we replace table-level public access with a narrow view that
-- exposes only those columns, and remove the old blanket policy.
-- ═══════════════════════════════════════════════════════════
drop policy if exists "bookings_public_read" on bookings;

create or replace view public_booking_slots as
  select business_id, date, time, service, status
  from bookings;

grant select on public_booking_slots to anon, authenticated;

-- ═══════════════════════════════════════════════════════════
-- Manual calendar date overrides ("Block day" / "Mark available"),
-- persisted per business instead of only living in local component state.
-- ═══════════════════════════════════════════════════════════
alter table business_settings add column if not exists date_overrides jsonb default '{}';

-- ═══════════════════════════════════════════════════════════
-- Dashboard "Recent Bookings" dismissed entries, persisted per business
-- so "Clear" survives a page refresh.
-- ═══════════════════════════════════════════════════════════
alter table business_settings add column if not exists dismissed_booking_ids jsonb default '[]';


