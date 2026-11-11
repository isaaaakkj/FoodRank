-- FoodRank: only moderated reviews are publicly visible.
create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  restaurant_id text not null check (length(trim(restaurant_id)) between 1 and 150),
  restaurant_name text not null check (length(trim(restaurant_name)) between 1 and 160),
  city text not null check (length(trim(city)) between 1 and 100),
  state text not null check (length(trim(state)) between 1 and 100),
  author_name text not null check (length(trim(author_name)) between 2 and 80),
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (length(trim(comment)) between 10 and 2000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);
create index if not exists reviews_public_recent_idx
  on public.reviews (created_at desc) where status = 'approved';
create index if not exists reviews_restaurant_idx
  on public.reviews (restaurant_id, city, state) where status = 'approved';

alter table public.reviews enable row level security;
revoke all on public.reviews from anon, authenticated;
grant select on public.reviews to anon, authenticated;
drop policy if exists "Public can read approved reviews" on public.reviews;
create policy "Public can read approved reviews"
  on public.reviews for select to anon, authenticated
  using (status = 'approved');

-- No INSERT/UPDATE/DELETE grants for public clients.
-- The submit-review Edge Function uses a server-side service role to create pending reviews.
-- Review/moderation may be performed by an administrator in the Supabase dashboard.
