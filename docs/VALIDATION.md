# Entrega local — 13/11/2026

Branch utilizada: `fix/foodrank-maintenance`, separada de `main`. Commits locais solicitados pelo usuário. A função Supabase foi publicada com autorização explícita; nenhum push, merge, deploy de Pages ou reescrita do histórico foi realizado.

## Resultados

| Verificação | Resultado |
| --- | --- |
| Instalação das dependências de teste e `npm ci` | Aprovados; bloqueio inicial de módulo no Windows resolvido encerrando somente o servidor de teste iniciado nesta tarefa |
| `npm test` | 41 testes aprovados em oito arquivos |
| `npm run verify:staging` | Não executou requisições: projeto de teste ainda não configurado. Relatório local registra `not_run` |
| `node scripts/verify-backend.mjs` em produção | Aprovado após a publicação autorizada da função v16; contrato, CORS e cache em dois municípios |
| `npm run test:e2e` | Um teste Chromium móvel aprovado, incluindo navegação e recarga dos detalhes |
| `npm run lint` | Aprovado |
| `npm run build` | Aprovado; aviso não bloqueante de bundle acima de 500 kB |
| `node scripts/verify-dist.mjs` | Aprovado |
| `node scripts/smoke-browser.mjs` | Aprovado; cache, favoritos, detalhes, segurança do mapa e larguras de 375/768/1440 pixels |
| `deno check supabase/functions/get-restaurants/index.ts` | Aprovado |
| `git diff --check` | Aprovado |
| Workflow | CI de PR sem segredos; testes, análise Deno e verificação do contrato remoto antes do build/upload; deploy na main com `needs: build`, sem ignorar falhas; acionamento manual preservado |

Os testes unitários simulam serviços externos. Cobrem nome, acentos, categorias, localização, cidade/UF, exclusão de municípios vizinhos, filtros combinados, carregamento, erro, nova tentativa, navegação, cache e compatibilidade com o schema e IDs reais. A validação real autorizada em produção aprovou o contrato do provedor, CORS e reutilização do cache, mas não prova independentemente a geometria de todos os limites nem cobertura completa. Santo André retornou 294 resultados e São Bernardo do Campo 356, sem IDs compartilhados. O banco confirmou validade de um dia para as duas entradas v3.

## Arquivos alterados ou adicionados

- Frontend: `src/components/FeaturedRestaurants.jsx`, `src/pages/Home.jsx`, `src/hooks/useRestaurants.js`, `src/services/restaurants.js`, `src/services/filters.js`.
- Backend local proposto: `supabase/functions/_shared/municipality.js`, `supabase/functions/get-restaurants/handler.js`, `supabase/functions/get-restaurants/http.js`, `supabase/functions/get-restaurants/cache.js`, `supabase/functions/get-restaurants/categories.js`, `supabase/functions/get-restaurants/index.ts`, `supabase/functions/.env.example`, `supabase/config.toml`, `supabase/inspection.sql`. A migração antes proposta foi retirada após a inspeção confirmar que a tabela existente atende à correção.
- Testes: `tests/setup.js`, `tests/filters.test.js`, `tests/edge.test.js`, `tests/service.test.js`, `tests/components.test.jsx`, `tests/http.test.js`, `tests/backend-verification.test.js`, `tests/supabase-cache.test.js`, `tests/e2e/search.spec.js`, `vitest.config.js`, `playwright.config.js`.
- Dependências e automação: `package.json`, `package-lock.json`, `.github/workflows/deploy.yml`, `.github/workflows/ci.yml`, `.gitignore`, `scripts/verify-backend.mjs`, `scripts/smoke-browser.mjs` (fixtures atualizadas para o cache v3).
- Documentação: `MAINTENANCE.md`, `README.md`, `docs/GEOGRAPHIC_DATA.md`, `docs/GIT_HISTORY_CLEANUP.md`, `docs/PRODUCTION_RELEASE.md`, `docs/VALIDATION.md`.

`Header.jsx` já propagava o texto digitado e exibia a pesquisa no celular; foi inspecionado e preservado. O problema estava na filtragem e na remontagem da lista. Nenhuma mudança estética ou login foi introduzido.

A chave privada histórica precisa de confirmação de revogação/substituição. O backup local foi verificado; os comandos de limpeza, impactos em colaboradores/clones/PRs e publicação por ref com autorização estão no documento de segurança.

A verificação remota foi executada contra produção após autorização expressa. A fonte anterior e o schema foram preservados em `artifacts/backend-backup-20261113/`; o backup operacional da função anterior está em `artifacts/production-release-20261113/before/`. Ambos ficam ignorados pelo Git; não são backup integral do banco. Nenhuma evidência de homologação é inferida dos testes locais.

A inspeção confirmou acesso SELECT/INSERT/UPDATE ao cache somente para service_role, negado para anon/authenticated, e RLS ativo. O diagnóstico inicial retornou apenas aviso informativo de RLS sem políticas no cache privado ([referência](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)); nenhum aviso de saúde. Não foram alterados schema, políticas, avaliações ou segredos privados. A publicação configurou somente a chave pública do frontend e origens permitidas; as consultas geraram as entradas v3 de cache.

Preparação da homologação: `supabase/testing/bootstrap.sql` replica apenas a estrutura do cache, sem dados de produção; `supabase/testing/.env.example` contém exclusivamente nomes de variáveis públicas; `scripts/verify-staging.mjs` rejeita o projeto de produção e não usa `.env`/`VITE_*` como fallback. `tests/staging-configuration.test.js` valida essa proteção. Nenhum desses testes locais substitui a publicação e execução reais no Supabase de teste.

Na última rodada local, a execução paralela de testes/CLI encontrou falta de memória virtual no Windows. A suíte passou com `--maxWorkers=1`; a análise Deno passou em execução separada. A CLI 3.1.0 não conseguiu publicar por erro de paginação 1455. A execução direta da CLI oficial 2.54.11 instalada, sem processo npm adicional, concluiu o deploy. Esse contorno operacional não alterou as dependências da aplicação.
