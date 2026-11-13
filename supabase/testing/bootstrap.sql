-- SOMENTE EM UM PROJETO DE TESTE NOVO E SEPARADO.
-- Não executar em produção. Replica apenas o schema do cache, sem dados reais.
begin;
create table public.restaurant_cache (
  cache_key text primary key,
  city text not null,
  state text not null,
  restaurants jsonb not null default '[]'::jsonb,
  fetched_at timestamptz not null default now(),
  expires_at timestamptz not null
);
alter table public.restaurant_cache enable row level security;
revoke all on public.restaurant_cache from public, anon, authenticated;
grant select, insert, update on public.restaurant_cache to service_role;
commit;
