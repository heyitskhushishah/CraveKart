-- ============================================================
-- FoodRush migration 001: users table
-- Migrations are ordered and idempotent, so they can be re-run
-- on cloud Supabase, a self-hosted instance, or any Postgres.
-- ============================================================

create extension if not exists pgcrypto;

-- The table that stores app profiles. Role is deliberately stored
-- and trusted from the client (A01 / privilege escalation demo).
create table if not exists public.users (
  id uuid primary key,
  email text not null unique,
  name text not null,
  role text not null default 'customer',
  password_md5 text,
  created_at timestamptz default now()
);

-- RLS is intentionally OFF (vulnerable design — anyone can read/write).
alter table public.users disable row level security;

-- Explicit grants so the migration also works on a fresh/self-hosted DB.
grant usage on schema public to anon, authenticated;
grant all on table public.users to anon, authenticated, service_role;
