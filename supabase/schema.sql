-- ============================================
-- Thailand Tracker - Supabase Database Schema
-- ============================================

-- 1. Places table
create table if not exists public.places (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  location text not null,
  date_added text not null default to_char(now(), 'DD Mon YYYY'),
  image text default '',
  is_marked boolean default true,
  category text,
  description text,
  created_at timestamptz default now()
);

-- 2. User provinces (tracks which provinces a user has visited)
create table if not exists public.user_provinces (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  province_id text not null,
  province_name text not null,
  visited boolean default false,
  updated_at timestamptz default now(),
  unique(user_id, province_id)
);

-- ============================================
-- Row Level Security
-- ============================================

alter table public.places enable row level security;
alter table public.user_provinces enable row level security;

-- Places policies
create policy "Users can view their own places"
  on public.places for select
  using (auth.uid() = user_id);

create policy "Users can insert their own places"
  on public.places for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own places"
  on public.places for update
  using (auth.uid() = user_id);

create policy "Users can delete their own places"
  on public.places for delete
  using (auth.uid() = user_id);

-- User provinces policies
create policy "Users can view their own provinces"
  on public.user_provinces for select
  using (auth.uid() = user_id);

create policy "Users can insert their own provinces"
  on public.user_provinces for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own provinces"
  on public.user_provinces for update
  using (auth.uid() = user_id);

-- ============================================
-- Indexes
-- ============================================

create index if not exists idx_places_user_id on public.places(user_id);
create index if not exists idx_places_created_at on public.places(created_at desc);
create index if not exists idx_user_provinces_user_id on public.user_provinces(user_id);
