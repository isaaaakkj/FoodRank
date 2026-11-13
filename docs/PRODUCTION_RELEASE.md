# Preparação da publicação do FoodRank

Estado em 13/11/2026: `get-restaurants` v16 publicada e validada em produção após autorização explícita do usuário, que decidiu não criar um ambiente de teste separado. Branch inicial `fix/foodrank-maintenance`; branch do PR `fix/municipality-search-tests`, criada da main atual. Não houve push direto na main, merge, publicação de Pages, migração ou reescrita do histórico. As instruções abaixo permanecem como referência operacional para próximas liberações.

## Execução autorizada concluída

- CLI autenticada pelo próprio usuário; projeto FoodRank conferido antes da aplicação.
- Backup operacional da função anterior em `artifacts/production-release-20261113/before/`, ignorado pelo Git.
- Configurados somente `FOODRANK_PUBLIC_API_KEY` e `FOODRANK_ALLOWED_ORIGINS`; origens: `https://isaaaakkj.github.io`, `http://localhost:5173` e `http://127.0.0.1:5173`. Segredos privados existentes preservados.
- Publicada somente `get-restaurants`, sem DDL ou alteração de políticas. A atualização de segredos do projeto também reiniciou as funções existentes; o código de `submit-review` foi preservado.
- Validação real: Santo André/SP com 294 resultados e São Bernardo do Campo/SP com 356; contrato v3, CORS e segunda consulta em cache aprovados. Não há IDs compartilhados entre as listas, e o banco confirmou 24 horas de validade.
- A CLI 3.1.0 falhou por falta de memória virtual no Windows. O deploy foi concluído executando diretamente a CLI oficial 2.54.11 instalada, com `--project-ref zebsdeoxhwtefoibyjyq --use-api`, evitando o processo npm adicional.
- Frontend no Pages continua aguardando publicação separada. A cobertura completa e a geometria do provedor não foram verificadas independentemente.

## O que está preparado

- Edge Function com contrato municipal v3, filtro por limite no Geoapify, timeout total de 55 segundos para o provedor, cache de 24 horas e compartilhamento de buscas simultâneas dentro do mesmo worker.
- Camada HTTP testada, limite de corpo de 8 KiB, chave pública do projeto, CORS por origem e erros sem detalhes internos. Nenhuma conta ou login de visitante.
- Reutilização da tabela `restaurant_cache`, com chaves v3 e validade de 24 horas; nenhum DDL ou alteração de políticas necessários para esta correção.
- CI para pull requests sem segredos; deploy limitado à `main`, por push ou acionamento manual, com testes e validação do backend antes do build/upload. Os gatilhos já existentes na main foram preservados.
- Verificação de contrato, origem e cache em municípios distintos antes de publicar o frontend. A verificação pode preencher cache remoto e consumir quota; executar somente no ambiente autorizado.

## Acesso e inspeção pendentes

A conexão MCP Supabase foi inicialmente usada em modo leitura em 13/11/2026. Foram inspecionados função anterior v14, schema, políticas, privilégios, cache, histórico de migrações, branches e diagnósticos. Fonte e schema foram preservados em `artifacts/backend-backup-20261113/`, pasta ignorada pelo Git. Nenhuma chave privada estava embutida na fonte obtida. Depois, o usuário autenticou a CLI para a publicação autorizada descrita acima; as ferramentas MCP continuaram restritas à inspeção.

A função atual usa a caixa do Photon (ou margem de coordenadas) para buscar no Geoapify e atribui cidade/estado da consulta a todos os pontos. O cache observado tem entradas de 24 horas sem evidência municipal, inclusive uma consulta por Copacabana, bairro que não é município. A proposta usa limites municipais do Geoapify, sem ler essas chaves legadas. Mantém os IDs `osmType-osmId` e `geoapify-place_id`, os campos e imagens existentes, evitando quebrar referências de favoritos, detalhes e avaliações.

A tabela atual já tem RLS e nega SELECT/INSERT/UPDATE para anon e authenticated; service_role tem os três privilégios. O aviso informativo de RLS sem políticas é coerente com esse cache privado, não exige abrir acesso público. Não foram retornados avisos de saúde. Não há branches de desenvolvimento nem migrações registradas na consulta realizada; falta definir um ambiente de homologação e validar a cobertura real do provedor antes da liberação.

1. Confirmar projeto de produção e projeto de homologação, chave privada revogada/substituída e quota Geoapify adequada.
2. Atualizar a inspeção somente leitura imediatamente antes da publicação se o ambiente tiver mudado. O adaptador local `cache.js` já usa `restaurant_cache(cache_key, city, state, restaurants, fetched_at, expires_at)`; a migração para uma tabela nova foi retirada por ser desnecessária.
3. Preservar o snapshot local da função/schema e a configuração atual (`verify_jwt=false`, CORS aberto). Não se trata de backup integral do banco: nenhum conteúdo de avaliações foi exportado. Os backups Git não substituem backup remoto do banco quando ele for necessário.

A CLI 3.1.0 e seus comandos foram consultados, sem autenticação nem execução remota. Alternativa manual de backup da função, depois de autenticar a CLI, em pasta privada fora do repositório:

```powershell
npx.cmd --yes supabase@3.1.0 login
$foodrankProject = Read-Host 'Project ref confirmado no painel'
if ($foodrankProject -notmatch '^[a-z]{20}$') { throw 'Confira o project ref' }
$foodrankBackendBackup = Join-Path $env:LOCALAPPDATA ('FoodRank-backend-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $foodrankBackendBackup | Out-Null
# Confira as permissões da pasta; o código remoto pode conter segredos antigos.
npx.cmd --yes supabase@3.1.0 --workdir $foodrankBackendBackup functions download get-restaurants "--remote=$foodrankProject" --use-api
if ($LASTEXITCODE -ne 0) { throw 'Backup da função falhou' }
```

Inspecionar o backup localmente, sem imprimir credenciais. Registrar a configuração de verificação JWT anterior e o artefato/commit conhecido do frontend. Criar backup do banco no painel ou mecanismo já utilizado pelo projeto antes de qualquer migração.

## Configuração proposta

| Local | Nome | Conteúdo |
| --- | --- | --- |
| Supabase Edge secrets | `GEOAPIFY_API_KEY` | Chave do provedor, somente backend |
| Supabase Edge secrets | `FOODRANK_PUBLIC_API_KEY` | Mesma chave pública utilizada pelo frontend |
| Supabase Edge secrets | `FOODRANK_ALLOWED_ORIGINS` | `https://isaaaakkj.github.io`; separar por vírgula se necessário |
| Supabase Edge secrets | `FOODRANK_BACKEND_KEY` | Opcional: chave privada rotacionada; ausente/vazia usa `SUPABASE_SERVICE_ROLE_KEY` do runtime |
| GitHub Actions secrets | `VITE_SUPABASE_URL` | URL pública do projeto correto |
| GitHub Actions secrets | `VITE_SUPABASE_ANON_KEY` | Chave pública anon/publishable |
| GitHub Actions variable | `FOODRANK_SMOKE_CITIES_JSON` | Dois municípios distintos, com cobertura conhecida e pelo menos um resultado confirmado em cada |

O modelo sem valores reais está em `supabase/functions/.env.example`. Nunca colocar segredos privados em `VITE_`, nos comandos do histórico do terminal ou em arquivos versionados. Se uma chave publishable for usada, configurar `FOODRANK_PUBLIC_API_KEY`; a chave anon padrão do runtime também é aceita.

`supabase/config.toml` desativa a verificação JWT legada apenas para esta função porque o próprio handler compara o header `apikey` com as chaves públicas configuradas. Isso permite chamada anônima da aplicação, sem contas. Uma chave pública e CORS não impedem scraping ou abuso por clientes fora do navegador: conferir quotas e controles operacionais do projeto/provedor antes da liberação.

Exemplo de variável pública para smoke test, a confirmar pela cobertura real:

```json
[{"city":"Santo André","state":"SP"},{"city":"São Bernardo do Campo","state":"SP"}]
```

## Homologação e ordem de aplicação — com autorização do ambiente

O usuário informou que precisa criar o projeto de teste. A conexão MCP atual é somente leitura e a CLI retornou `AccessTokenRequiredError`. A validação real permanece pendente. Criar um projeto separado no painel, conectar a ele com acesso de configuração/publicação e usar o schema mínimo `supabase/testing/bootstrap.sql` somente nesse ambiente. Não copiar avaliações nem entradas de cache de produção.

Para executar a verificação com proteção explícita contra produção, copiar `supabase/testing/.env.example` para `.env.test.local`, preencher apenas URL/chave pública do projeto de teste e executar `npm run verify:staging`. O script não publica a função nem configura segredos: essas etapas precisam estar concluídas no ambiente autorizado. O relatório sem credenciais fica em `artifacts/staging-validation.json`, com estados `not_run`, `failed` ou `passed`. No momento está `not_run`.

1. Comparar a proposta com o backend real e registrar o diff a aprovar.
2. Disponibilizar em homologação o schema equivalente à tabela existente `restaurant_cache`, com os mesmos privilégios e RLS. Não há migração de produção nesta entrega; não fazer reset ou repair automático.
3. Configurar os segredos no ambiente autorizado pelo painel, sem expor os valores.
4. Publicar somente `get-restaurants`. Exemplo da CLI validada, apontando explicitamente para o ambiente aprovado:

```powershell
# EXECUTAR SOMENTE DEPOIS DA APROVAÇÃO DO AMBIENTE/DIFF.
npx.cmd --yes supabase@3.1.0 functions deploy get-restaurants "--remote=$foodrankProject" --use-api
if ($LASTEXITCODE -ne 0) { throw 'Deploy da função falhou' }
```

Não usar `--prune`, não publicar todas as funções e não confirmar alterações de projeto diferente do aprovado. A CLI pede confirmação; não acrescentar `--yes` automaticamente.

5. Com variáveis públicas apontando para homologação, executar a verificação abaixo. O script não carrega segredos de backend. Variáveis de ambiente já definidas prevalecem sobre `.env` local.

```powershell
$env:VITE_SUPABASE_URL = Read-Host 'URL pública do ambiente autorizado'
$env:VITE_SUPABASE_ANON_KEY = Read-Host 'Chave pública anon/publishable'
$env:FOODRANK_APP_ORIGIN = 'https://isaaaakkj.github.io'
$env:FOODRANK_SMOKE_CITIES_JSON = '[{"city":"Santo André","state":"SP"},{"city":"São Bernardo do Campo","state":"SP"}]'
npm.cmd run verify:backend
if ($LASTEXITCODE -ne 0) { throw 'Não publicar o frontend' }
```

6. Conferir manualmente estabelecimentos conhecidos nos dois lados de uma divisa, homônimos em estados distintos e exemplos com endereço postal diferente do município administrativo. O teste de contrato não prova a geometria do provedor. Confirmar que anon/authenticated não podem ler ou escrever a tabela de cache diretamente e que service_role pode usá-la.
7. Registrar evidências de homologação e aprovar separadamente produção. Atualizar backup/inspeção, configurar os segredos necessários, publicar somente a função e executar smoke test no projeto de produção aprovado. Não aplicar SQL de criação de tabela ou modificar políticas.
8. Somente depois do backend aprovado, autorizar a integração na `main`. O workflow existente é acionado por push na main ou manualmente e repete testes e smoke test antes de permitir Pages. Falha em qualquer verificação interrompe upload/deploy. Abrir o PR não integra código nem publica o site; o CI de PR não consulta produção.

## Reversão

Se o backend falhar antes de publicar Pages, manter o frontend publicado atual e restaurar a função e sua configuração JWT/CORS do backup pelo processo aprovado. Se ambos já tiverem sido publicados, restaurar o artefato/commit validado do frontend e a função/configuração compatíveis como um par. Não voltar para uma versão com chave privada no bundle. O workflow novo continuará bloqueando backend legado; restauração do artefato conhecido é uma operação separada e aprovada, sem relaxar os testes da nova versão.

Preservar a tabela e todas as entradas de cache durante a reversão; não executar `DROP`, reset de banco, exclusão de branches ou limpeza de dados. A função antiga continuará usando suas chaves anteriores; as chaves v3 ficam isoladas. Não restaurar credenciais revogadas. Registrar motivo, versão anterior e resultado da verificação após reversão.

Referências: [CLI Supabase](https://supabase.com/docs/reference/cli), [publicação de Edge Functions](https://supabase.com/docs/guides/functions/deploy), [chaves de API](https://supabase.com/docs/guides/getting-started/api-keys).
