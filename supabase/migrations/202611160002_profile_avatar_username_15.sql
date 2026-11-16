-- Limita o identificador público e habilita avatars com acesso restrito por pasta do usuário.
update public.profiles set username = 'u_' || left(replace(id::text, '-', ''), 13) where char_length(username) > 15;
alter table public.profiles drop constraint if exists profiles_username_check;
alter table public.profiles add constraint profiles_username_check check (username ~ '^[a-z0-9_]{3,15}$');
create or replace function public.initialize_foodrank_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id, 'u_' || left(replace(new.id::text, '-', ''), 13),
    case when char_length(trim(coalesce(new.raw_user_meta_data->>'full_name', ''))) >= 2
      then left(trim(new.raw_user_meta_data->>'full_name'), 80) else 'Visitante' end,
    case when left(coalesce(new.raw_user_meta_data->>'avatar_url', ''), 8) = 'https://'
      then left(new.raw_user_meta_data->>'avatar_url', 1000) else null end
  ) on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.initialize_foodrank_profile() from public, anon, authenticated;
grant update (avatar_url) on public.profiles to authenticated;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-avatars','profile-avatars',true,2097152,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=excluded.public, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "FoodRank avatar upload" on storage.objects;
create policy "FoodRank avatar upload" on storage.objects for insert to authenticated
with check (bucket_id='profile-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists "FoodRank avatar delete" on storage.objects;
create policy "FoodRank avatar delete" on storage.objects for delete to authenticated
using (bucket_id='profile-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
