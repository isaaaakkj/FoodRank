-- Perfis da comunidade: permitir apenas leitura dos dados intencionalmente públicos.
-- Nunca expor campos futuros da tabela automaticamente.
alter table public.profiles enable row level security;

revoke select on public.profiles from anon, authenticated;
grant select (username, display_name, avatar_url, bio, banner_color)
  on public.profiles to anon, authenticated;

drop policy if exists "Community reads public profiles" on public.profiles;
create policy "Community reads public profiles" on public.profiles
  for select to anon, authenticated using (true);

-- Não altera políticas de atualização; somente o proprietário edita.
-- Avaliações já contam com RLS própria, que permite leitura pública apenas das aprovadas.
create index if not exists reviews_author_username_public_idx
  on public.reviews (author_username, created_at desc)
  where status = 'approved' and author_username is not null;
