-- Favoritos exclusivos da conta autenticada. Restaurantes antigos continuam preservados no navegador até a migração.
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  restaurant_key text not null check (char_length(restaurant_key) between 1 and 500),
  restaurant jsonb not null check (
    jsonb_typeof(restaurant) = 'object'
    and char_length(coalesce(restaurant->>'name', '')) between 1 and 160
    and char_length(restaurant::text) <= 10000
  ),
  created_at timestamptz not null default now(),
  primary key (user_id, restaurant_key)
);
create index if not exists favorites_owner_recent_idx on public.favorites (user_id, created_at desc);
alter table public.favorites enable row level security;
revoke all on public.favorites from anon, authenticated;
grant select, insert, delete on public.favorites to authenticated;

create policy "Favorites owner reads" on public.favorites
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Favorites owner inserts" on public.favorites
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Favorites owner deletes" on public.favorites
  for delete to authenticated using ((select auth.uid()) = user_id);
