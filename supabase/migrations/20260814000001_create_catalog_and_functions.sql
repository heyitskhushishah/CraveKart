-- ============================================================
-- FoodRush migration 002: catalog tables + vulnerable functions
-- Depends on migration 001 (public.users).
-- ============================================================

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cuisine text not null,
  rating numeric(2,1) not null default 4.5,
  eta_min text not null default '25-35',
  image_url text
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  name text not null,
  description text,
  price numeric(6,2) not null,
  category text,
  image_url text
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount numeric(5,2) not null,
  uses int not null default 0,
  max_uses int not null default 100
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  restaurant_name text not null,
  items jsonb not null,
  total numeric(8,2) not null,
  status text not null default 'pending',
  cc_number text,
  created_at timestamptz default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.menu_items(id) on delete cascade,
  user_id uuid references public.users(id),
  author text not null,
  content text not null,
  rating int not null default 5,
  created_at timestamptz default now()
);

-- RLS intentionally OFF everywhere (A01).
alter table public.restaurants disable row level security;
alter table public.menu_items disable row level security;
alter table public.coupons disable row level security;
alter table public.orders disable row level security;
alter table public.reviews disable row level security;

grant all on table public.restaurants to anon, authenticated, service_role;
grant all on table public.menu_items to anon, authenticated, service_role;
grant all on table public.coupons to anon, authenticated, service_role;
grant all on table public.orders to anon, authenticated, service_role;
grant all on table public.reviews to anon, authenticated, service_role;

-- ------------------------------------------------------------
-- VULNERABLE RPC FUNCTIONS (A03 — SQL injection)
-- ------------------------------------------------------------

create or replace function public.search_menu(search_term text)
returns setof public.menu_items
language plpgsql
as $$
begin
  return query execute
    'select * from public.menu_items where name ilike ''%' || search_term || '%''';
end;
$$;

create or replace function public.redeem_coupon(code text)
returns numeric
language plpgsql
as $$
declare v_discount numeric;
begin
  execute 'select discount from public.coupons where code = ''' || code || ''''
    into v_discount;
  return coalesce(v_discount, 0);
end;
$$;

grant execute on function public.search_menu(text) to anon, authenticated, service_role;
grant execute on function public.redeem_coupon(text) to anon, authenticated, service_role;
