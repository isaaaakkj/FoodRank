-- Publicar apenas os dados de autoria permitidos nas avaliações, sem abrir leitura de profiles.
alter table public.reviews
  add column if not exists author_username text
    check (author_username is null or author_username ~ '^[a-z0-9_]{3,40}$'),
  add column if not exists author_avatar_url text
    check (author_avatar_url is null or (char_length(author_avatar_url) <= 1000 and author_avatar_url ~ '^https://'));

-- Atualiza avaliações já vinculadas à conta (sem atribuir comentários anônimos).
update public.reviews as r
set author_name = p.display_name,
    author_username = p.username,
    author_avatar_url = p.avatar_url
from public.profiles as p
where r.user_id = p.id;

-- Quando o perfil público mudar, os dados mostrados nas avaliações acompanham a alteração.
-- A função só pode ser executada pelo trigger; as tabelas continuam protegidas por RLS.
create or replace function public.sync_foodrank_review_author()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.reviews
  set author_name = new.display_name,
      author_username = new.username,
      author_avatar_url = new.avatar_url
  where user_id = new.id;
  return new;
end;
$$;
revoke all on function public.sync_foodrank_review_author() from public, anon, authenticated;
drop trigger if exists foodrank_profile_review_author on public.profiles;
create trigger foodrank_profile_review_author
after update of display_name, username, avatar_url on public.profiles
for each row
when (
  old.display_name is distinct from new.display_name or
  old.username is distinct from new.username or
  old.avatar_url is distinct from new.avatar_url
)
execute function public.sync_foodrank_review_author();
