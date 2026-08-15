-- ============================================================
-- Profiles: phone + delivery address (CSRF target)
--
-- The /profile page edits name, phone and delivery address via
-- POST /api/profile/update. That route authenticates ONLY with
-- the Supabase session cookie and performs no CSRF protection
-- (no token, no Origin/Referer check). These columns exist so
-- the change is something an attacker can silently perform.
-- ============================================================

alter table public.users add column if not exists phone text;
alter table public.users add column if not exists delivery_address text;

-- Give the demo users realistic values so the edit form prefills.
update public.users set
  phone = case email
    when 'admin@cravekart.app' then '+91 90000 00001'
    when 'priya@cravekart.app' then '+91 90000 00002'
    when 'alex@cravekart.app' then '+91 90000 00003'
    else phone
  end,
  delivery_address = case email
    when 'admin@cravekart.app' then '1 Admin House, Bandra, Mumbai 400050'
    when 'priya@cravekart.app' then '221B Baker Street, Apt 4, Mumbai 400001'
    when 'alex@cravekart.app' then 'C-42, Green Park, Delhi 110016'
    else delivery_address
  end
where email in ('admin@cravekart.app', 'priya@cravekart.app', 'alex@cravekart.app');
