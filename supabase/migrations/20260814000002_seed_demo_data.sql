-- ============================================================
-- FoodRush migration 003: seed data
-- Idempotent (on conflict do nothing). The demo auth-user block
-- is exception-safe: on plain Postgres (no auth schema) it warns
-- and continues, so the rest of the seed still applies.
-- ============================================================

-- ------------------------------------------------------------
-- DEMO AUTH USERS  (Supabase Auth schema)
-- ------------------------------------------------------------
do $$
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) values
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-4000-8000-000000000001',
    'authenticated', 'authenticated',
    'admin@foodrush.app',
    crypt('admin123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Ava Admin"}'::jsonb,
    now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-4000-8000-000000000002',
    'authenticated', 'authenticated',
    'priya@foodrush.app',
    crypt('priya123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Priya Sharma"}'::jsonb,
    now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-4000-8000-000000000003',
    'authenticated', 'authenticated',
    'alex@foodrush.app',
    crypt('alex123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Alex Rivera"}'::jsonb,
    now(), now()
  )
  on conflict (id) do nothing;

  insert into auth.identities (
    id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) values
  (
    gen_random_uuid(),
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000001',
    jsonb_build_object('sub', '00000000-0000-4000-8000-000000000001', 'email', 'admin@foodrush.app', 'email_verified', true),
    'email', now(), now(), now()
  ),
  (
    gen_random_uuid(),
    '00000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000002',
    jsonb_build_object('sub', '00000000-0000-4000-8000-000000000002', 'email', 'priya@foodrush.app', 'email_verified', true),
    'email', now(), now(), now()
  ),
  (
    gen_random_uuid(),
    '00000000-0000-4000-8000-000000000003',
    '00000000-0000-4000-8000-000000000003',
    jsonb_build_object('sub', '00000000-0000-4000-8000-000000000003', 'email', 'alex@foodrush.app', 'email_verified', true),
    'email', now(), now(), now()
  )
  on conflict (id) do nothing;

  raise notice 'Demo auth users seeded OK';
exception when others then
  raise notice 'Demo auth users NOT seeded: % (non-Supabase DB? core tables are fine)', sqlerrm;
end $$;

-- ------------------------------------------------------------
-- DEMO PROFILES  (public.users)
-- ------------------------------------------------------------
do $$
begin
  insert into public.users (id, email, name, role, password_md5) values
  ('00000000-0000-4000-8000-000000000001', 'admin@foodrush.app', 'Ava Admin', 'admin',    md5('admin123')),
  ('00000000-0000-4000-8000-000000000002', 'priya@foodrush.app', 'Priya Sharma', 'customer', md5('priya123')),
  ('00000000-0000-4000-8000-000000000003', 'alex@foodrush.app', 'Alex Rivera', 'customer', md5('alex123'))
  on conflict (id) do nothing;
  raise notice 'Demo profiles seeded OK';
exception when others then
  raise notice 'Demo profiles NOT seeded: %', sqlerrm;
end $$;

-- ------------------------------------------------------------
-- RESTAURANTS + MENU
-- ------------------------------------------------------------
insert into public.restaurants (id, name, cuisine, rating, eta_min, image_url) values
('00000000-0000-4000-9000-000000000001', 'Pizza Palace',  'Italian',   4.8, '25-35', '🍕'),
('00000000-0000-4000-9000-000000000002', 'Burger Barn',   'American',  4.6, '20-30', '🍔'),
('00000000-0000-4000-9000-000000000003', 'Spice Route',   'Indian',    4.9, '30-40', '🍛')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_id, name, description, price, category, image_url) values
('00000000-0000-4000-a000-000000000001', '00000000-0000-4000-9000-000000000001', 'Margherita Pizza',   'Fresh basil, mozzarella, rich tomato sauce.',  9.99,  'Pizza', '🍕'),
('00000000-0000-4000-a000-000000000002', '00000000-0000-4000-9000-000000000001', 'Pepperoni Feast',    'Double pepperoni with extra cheese.',           12.49, 'Pizza', '🍕'),
('00000000-0000-4000-a000-000000000003', '00000000-0000-4000-9000-000000000001', 'Garlic Breadsticks', 'Buttery garlic bread with marinara dip.',        5.99,  'Sides', '🥖'),
('00000000-0000-4000-a000-000000000004', '00000000-0000-4000-9000-000000000001', 'Tiramisu',           'Classic Italian coffee-soaked dessert.',        6.49,  'Dessert', '🍰'),
('00000000-0000-4000-a000-000000000005', '00000000-0000-4000-9000-000000000002', 'Classic Cheeseburger','Smash patty, cheddar, pickles, secret sauce.',  8.99,  'Burgers', '🍔'),
('00000000-0000-4000-a000-000000000006', '00000000-0000-4000-9000-000000000002', 'Bacon BBQ Burger',   'Crispy bacon, onion rings, smoky BBQ.',         10.99, 'Burgers', '🍔'),
('00000000-0000-4000-a000-000000000007', '00000000-0000-4000-9000-000000000002', 'Crispy Fries',       'Golden fries with a chipotle dip.',             3.99,  'Sides', '🍟'),
('00000000-0000-4000-a000-000000000008', '00000000-0000-4000-9000-000000000002', 'Chocolate Shake',    'Thick and creamy, topped with whipped cream.',  5.49,  'Drinks', '🥤'),
('00000000-0000-4000-a000-000000000009', '00000000-0000-4000-9000-000000000003', 'Butter Chicken',     'Creamy tomato gravy with tandoori chicken.',    11.99, 'Curries', '🍛'),
('00000000-0000-4000-a000-000000000010', '00000000-0000-4000-9000-000000000003', 'Paneer Tikka',       'Smoky grilled paneer with mint chutney.',       9.49,  'Starters', '🧆'),
('00000000-0000-4000-a000-000000000011', '00000000-0000-4000-9000-000000000003', 'Garlic Naan',        'Soft, pillowy naan brushed with garlic butter.', 2.99,  'Breads', '🫓'),
('00000000-0000-4000-a000-000000000012', '00000000-0000-4000-9000-000000000003', 'Gulab Jamun',        'Warm milk dumplings in rose syrup.',            4.49,  'Dessert', '🍮')
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- COUPONS
-- ------------------------------------------------------------
insert into public.coupons (code, discount, uses, max_uses) values
('FRESH10',   10,  0, 100),
('WELCOME20', 20,  0, 100),
('HACKME99',  99,  0, 5)
on conflict (code) do nothing;

-- ------------------------------------------------------------
-- SAMPLE ORDERS
-- ------------------------------------------------------------
insert into public.orders (id, user_id, restaurant_name, items, total, status, cc_number) values
('00000000-0000-4000-b000-000000000001', '00000000-0000-4000-8000-000000000002', 'Pizza Palace',
 '[{"name":"Margherita Pizza","price":9.99,"qty":2},{"name":"Garlic Breadsticks","price":5.99,"qty":1}]',
 25.97, 'delivered', '4111111111111111'),
('00000000-0000-4000-b000-000000000002', '00000000-0000-4000-8000-000000000002', 'Burger Barn',
 '[{"name":"Bacon BBQ Burger","price":10.99,"qty":1}]',
 10.99, 'on_the_way', '5500000000000004'),
('00000000-0000-4000-b000-000000000003', '00000000-0000-4000-8000-000000000003', 'Spice Route',
 '[{"name":"Butter Chicken","price":11.99,"qty":1},{"name":"Garlic Naan","price":2.99,"qty":2}]',
 17.97, 'pending', '4111111111111111')
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- SAMPLE REVIEWS  (one already contains stored XSS — A03)
-- ------------------------------------------------------------
insert into public.reviews (product_id, user_id, author, content, rating) values
('00000000-0000-4000-a000-000000000001', '00000000-0000-4000-8000-000000000002', 'Priya', 'Absolutely divine! The cheese pull is unreal. 😍', 5),
('00000000-0000-4000-a000-000000000005', '00000000-0000-4000-8000-000000000003', 'Alex', '<img src=x onerror="alert(document.cookie)"> Best burger in town, hands down.', 5),
('00000000-0000-4000-a000-000000000009', '00000000-0000-4000-8000-000000000002', 'Priya', 'Rich, buttery, perfect with naan.', 5)
on conflict (id) do nothing;
