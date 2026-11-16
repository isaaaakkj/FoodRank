-- Executar ANTES de publicar o frontend de contas.
-- Handles são únicos e não expõem e-mails. Dados privados só ficam acessíveis ao proprietário.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique
    check (username ~ '^[a-z0-9_]{3,40}$'),
  display_name text not null check (char_length(trim(display_name)) between 2 and 80),
  avatar_url text check (avatar_url is null or (char_length(avatar_url) <= 1000 and avatar_url ~ '^https://')),
  bio text not null default '' check (char_length(bio) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select, update (username, display_name, bio) on public.profiles to authenticated;

drop policy if exists "Owner reads profile" on public.profiles;
create policy "Owner reads profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "Owner edits profile" on public.profiles;
create policy "Owner edits profile" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.initialize_foodrank_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    'user_' || replace(new.id::text, '-', ''),
    case when char_length(trim(coalesce(new.raw_user_meta_data->>'full_name', ''))) >= 2
      then left(trim(new.raw_user_meta_data->>'full_name'), 80) else 'Visitante' end,
    case
      when left(coalesce(new.raw_user_meta_data->>'avatar_url', ''), 8) = 'https://'
      then left(new.raw_user_meta_data->>'avatar_url', 1000)
      else null
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger interno: não disponibilizar a função SECURITY DEFINER pela API.
revoke all on function public.initialize_foodrank_profile() from public, anon, authenticated;

drop trigger if exists foodrank_user_created on auth.users;
create trigger foodrank_user_created after insert on auth.users
for each row execute function public.initialize_foodrank_profile();

-- Perfis de usuários que já existem no Auth antes desta migração.
insert into public.profiles (id, username, display_name, avatar_url)
select
  u.id,
  'user_' || replace(u.id::text, '-', ''),
  case when char_length(trim(coalesce(u.raw_user_meta_data->>'full_name', ''))) >= 2
    then left(trim(u.raw_user_meta_data->>'full_name'), 80) else 'Visitante' end,
  case when left(coalesce(u.raw_user_meta_data->>'avatar_url', ''), 8) = 'https://'
    then left(u.raw_user_meta_data->>'avatar_url', 1000) else null end
from auth.users u
on conflict (id) do nothing;

-- O autor de uma avaliação será definido exclusivamente pela Edge Function validando JWT.
alter table public.reviews add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists reviews_user_history_idx
  on public.reviews (user_id, created_at desc) where user_id is not null;
drop policy if exists "Owner reads own reviews" on public.reviews;
create policy "Owner reads own reviews" on public.reviews
  for select to authenticated using ((select auth.uid()) = user_id);

-- Mantém escrita de reviews exclusivamente na Edge Function (service_role).
revoke insert, update, delete on public.reviews from anon, authenticated;
