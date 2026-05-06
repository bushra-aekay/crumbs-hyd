-- Crumbs.hyd — schema
-- Run this in Supabase SQL editor. Tables are prefixed `crumbs_hyd_` to avoid
-- collisions with other projects already in this database.

-- ── CATEGORIES ────────────────────────────────────────────────────────────
create table if not exists crumbs_hyd_categories (
  id text primary key,
  label text not null,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

-- ── ITEMS ─────────────────────────────────────────────────────────────────
-- Variants and toppings live as JSONB so admins can add/remove rows freely.
create table if not exists crumbs_hyd_items (
  id text primary key,
  cat text references crumbs_hyd_categories(id) on delete cascade,
  name text not null,
  blurb text,
  more text,
  tag text,
  variants jsonb not null default '[]'::jsonb,
  -- shape: [{label, price}]
  toppings jsonb not null default '[]'::jsonb,
  -- shape: [{id, label, price}]
  sort_order int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── CONFIG (single row) ───────────────────────────────────────────────────
create table if not exists crumbs_hyd_config (
  id int primary key default 1 check (id = 1),
  admin_passcode text not null,
  brand_name text default 'Crumbs.hyd',
  brand_handle text default '@crumbs.hyd',
  brand_location text default 'Mehdipatnam, Hyderabad',
  brand_tagline text default 'small ways of being loved',
  rating numeric default 4.9,
  reviews int default 312,
  notes text -- e.g. allergy notice
);

-- Seed the config row (idempotent)
insert into crumbs_hyd_config (id, admin_passcode)
values (1, 'mehdipatnam-crumbs-2025')
on conflict (id) do nothing;

-- ── ROW-LEVEL SECURITY ────────────────────────────────────────────────────
alter table crumbs_hyd_categories enable row level security;
alter table crumbs_hyd_items      enable row level security;
alter table crumbs_hyd_config     enable row level security;

-- Anyone can READ menu data (anon key)
create policy "menu_read_all" on crumbs_hyd_categories for select using (true);
create policy "menu_read_all" on crumbs_hyd_items      for select using (true);
create policy "menu_read_all" on crumbs_hyd_config     for select using (true);

-- Anon clients can WRITE only when they prove they know the passcode.
-- The client sends the passcode via the postgres setting `request.crumbs.passcode`.
-- Set in JS before each write: supabase.rpc('set_crumbs_passcode', { p: '...' })
create or replace function set_crumbs_passcode(p text)
returns void language sql security definer as $$
  select set_config('request.crumbs.passcode', p, true);
$$;

create policy "menu_write_admin" on crumbs_hyd_categories for all
  using (current_setting('request.crumbs.passcode', true) =
         (select admin_passcode from crumbs_hyd_config where id = 1))
  with check (current_setting('request.crumbs.passcode', true) =
         (select admin_passcode from crumbs_hyd_config where id = 1));

create policy "menu_write_admin" on crumbs_hyd_items for all
  using (current_setting('request.crumbs.passcode', true) =
         (select admin_passcode from crumbs_hyd_config where id = 1))
  with check (current_setting('request.crumbs.passcode', true) =
         (select admin_passcode from crumbs_hyd_config where id = 1));

create policy "config_write_admin" on crumbs_hyd_config for update
  using (current_setting('request.crumbs.passcode', true) =
         (select admin_passcode from crumbs_hyd_config where id = 1))
  with check (current_setting('request.crumbs.passcode', true) =
         (select admin_passcode from crumbs_hyd_config where id = 1));
