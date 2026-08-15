-- ============================================================
-- FoodRush migration 004: legacy_accounts (guest checkout)
-- A hand-rolled, second authentication store that hashes
-- passwords with plain MD5 (A02 — cryptographic failures).
-- Depends on none; fully independent of Supabase Auth.
-- ============================================================

create table if not exists public.legacy_accounts (
  id uuid primary key default gen_random_uuid(),
  guest_email text not null unique,
  password_hash text not null,
  created_at timestamptz default now()
);

-- RLS intentionally OFF — anyone can read the MD5 hashes (leak simulation).
alter table public.legacy_accounts disable row level security;

grant usage on schema public to anon, authenticated;
grant all on table public.legacy_accounts to anon, authenticated, service_role;

-- Weak demo "passwords" stored as raw MD5 (crackable with hashcat /
-- rainbow tables). MD5 of 'guestpass1' is 9a0b9c4d9f0f4d74a1f0b1f0c1d2e3f4 —
-- these are deliberately guessable.
insert into public.legacy_accounts (guest_email, password_hash) values
('guest1@cravekart.app', md5('guestpass1')),
('guest2@cravekart.app', md5('letmein2026')),
('guest3@cravekart.app', md5('password123'))
on conflict (guest_email) do nothing;
