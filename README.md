# FoodRank

MVP escolar de descoberta de restaurantes com React, Vite, Tailwind CSS e Supabase, publicado no GitHub Pages.

## Desenvolvimento local

1. Use Node.js 22.12+ e npm.
2. Copie `.env.example` para `.env` e configure somente a URL e a chave PUBLICA do Supabase. Nunca use chave privada em variaveis `VITE_`.
3. Execute `npm ci` e `npm run dev`.
4. Abra o endereco informado pelo Vite com o caminho `/FoodRank/`.

## Validacao

```sh
npm ci
npm test
npm run test:e2e
npm run lint
npm run build
node scripts/verify-dist.mjs
npm run preview
```

No PowerShell com scripts bloqueados, use `npm.cmd` no lugar de `npm`.

O teste opcional `node scripts/smoke-browser.mjs` usa Chrome local no Windows (ou `BROWSER_PATH`), portas 4173/9223, dados controlados e gera capturas ignoradas em `artifacts/`. Requer Node com WebSocket nativo.

## Publicacao

Base: `/FoodRank/`. As rotas usam hash. O workflow existente publica em pushes na main ou por acionamento manual, sempre apos os testes e verificacoes obrigatorios. No GitHub Pages, a origem deve ser **GitHub Actions**, com as variaveis publicas configuradas nos secrets do workflow. O artefato publicado e `dist`, nunca o HTML fonte. Abrir este PR nao integra codigo nem publica o site.

Favoritos ficam neste navegador. As avaliacoes e a timeline reais da main foram preservadas, incluindo a verificacao anti-bot; os testes de busca simulam os servicos de avaliacoes para nao enviar dados reais.

Consulte [MAINTENANCE.md](MAINTENANCE.md) para status e pendencias, [dados geograficos](docs/GEOGRAPHIC_DATA.md) para contrato e cobertura e [limpeza do historico](docs/GIT_HISTORY_CLEANUP.md) para o procedimento que depende de aprovacao.

Os testes usam Vitest, React Testing Library e Playwright com servicos externos simulados. Antes da primeira navegacao automatizada, execute `npx playwright install chromium` (no CI Linux, `npx playwright install --with-deps chromium`). O workflow exige testes, lint, build e verificacao do artefato, sem ignorar falhas. A funcao `get-restaurants` v16 foi aplicada e validada em producao com autorizacao em 13/11/2026; a publicacao do frontend no Pages ainda e uma etapa separada.

A preparacao para producao, configuracao do Supabase/GitHub, verificacao real `npm run verify:backend` e reversao estao em [PRODUCTION_RELEASE.md](docs/PRODUCTION_RELEASE.md). O deploy manual exige a variavel publica `FOODRANK_SMOKE_CITIES_JSON` com dois municipios distintos e cobertos; essa verificacao consulta o backend e pode preencher seu cache. Nao execute contra producao sem autorizar essa etapa.
