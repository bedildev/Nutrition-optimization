-- Enable extensions if needed
create extension if not exists "uuid-ossp";

-- PROFILES
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  bio text,
  goal text,
  budget integer,
  age integer,
  weight integer,
  height integer,
  activity text
);

-- SAVED MENUS
create table if not exists public.saved_menus (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  menu_id integer not null
);

-- OPTIMIZER RESULTS
create table if not exists public.optimizer_results (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  result jsonb not null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists saved_menus_user_id_idx on public.saved_menus (user_id);
create index if not exists optimizer_results_user_id_idx on public.optimizer_results (user_id);

-- RLS ENABLE
alter table public.profiles enable row level security;
alter table public.saved_menus enable row level security;
alter table public.optimizer_results enable row level security;

-- RLS POLICIES
-- Profiles: user can read/update own profile
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);

create policy "profiles_upsert_own" on public.profiles
  for insert with check (auth.uid() = user_id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id);

-- Saved menus: user can read/insert/delete own rows
create policy "saved_menus_select_own" on public.saved_menus
  for select using (auth.uid() = user_id);

create policy "saved_menus_insert_own" on public.saved_menus
  for insert with check (auth.uid() = user_id);

create policy "saved_menus_delete_own" on public.saved_menus
  for delete using (auth.uid() = user_id);

-- Optimizer results: user can read/insert own rows
create policy "optimizer_results_select_own" on public.optimizer_results
  for select using (auth.uid() = user_id);

create policy "optimizer_results_insert_own" on public.optimizer_results
  for insert with check (auth.uid() = user_id);