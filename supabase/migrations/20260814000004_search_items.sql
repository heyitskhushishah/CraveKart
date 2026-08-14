-- ============================================================
-- FoodRush migration 004: search_items RPC (SQLi target)
-- Replaces the plain search path with a dedicated RPC that builds
-- its SQL by string concatenation inside EXECUTE. Intentionally
-- vulnerable (A03) — do NOT call format() or use parameterized
-- queries here; that is the whole point.
-- ============================================================

create or replace function public.search_items(query text)
returns setof public.menu_items
language plpgsql
as $$
begin
  return query execute
    'select * from public.menu_items where name ilike ''%' || query || '%''';
end;
$$;

grant execute on function public.search_items(text) to anon, authenticated, service_role;
