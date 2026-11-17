-- Personalização da capa do perfil com paleta limitada e padrão verde FoodRank.
-- A atualização continua protegida pela política RLS existente (somente proprietário).
alter table public.profiles
  add column if not exists banner_color text not null default '#28351f';

alter table public.profiles
  drop constraint if exists profiles_banner_color_check;
alter table public.profiles
  add constraint profiles_banner_color_check
  check (banner_color in (
    '#28351f', '#42563d', '#566a63', '#5c4540', '#4a5365', '#7a6054'
  ));

grant update (banner_color) on public.profiles to authenticated;
