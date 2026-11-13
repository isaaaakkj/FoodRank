# Município, provedores e cache

## Diagnóstico e contrato

O frontend anterior substituía `city` e `state` de cada resposta pela consulta do usuário. Assim, resultados de raio, cache contaminado ou geocodificação de outra cidade apareciam como pertencentes ao município selecionado. A busca textual ignorava normalização de acentos; remontar a lista a cada tecla também reiniciava a consulta e o carregamento.

A Edge Function e o schema em produção não estavam originalmente no repositório. Após conectar o Supabase em 13/11/2026, a inspeção somente leitura confirmou que `get-restaurants` v14 usa Photon sem conferir cidade/estado do primeiro resultado, busca uma caixa retangular no Geoapify e atribui o município solicitado a todos os pontos. O cache guarda esses resultados por 24 horas. A fonte remota e o schema foram preservados localmente em `artifacts/backend-backup-20261113/`; a proposta foi ajustada a eles, mas não aplicada em produção.

Antes de publicar o frontend, comparar o código e a tabela reais com a proposta, validar o contrato em ambiente de teste e obter autorização para aplicar a migração e a função. O frontend exige `city`, `state` e `municipalityVerification` (`boundary` ou `address`) por restaurante. Respostas antigas sem evidência geram uma mensagem de atualização pendente, sem rotular estabelecimentos desconhecidos como confirmados. `address` somente pode ser emitido por um backend que tenha validado município e estado explícitos do endereço; a implementação nova emite apenas `boundary`.

## Confirmação geográfica

A proposta resolve uma única cidade brasileira no Geoapify, comparando município e estado normalizados, inclusive UF e nomes sem acento. Resposta ambígua, de outro município ou estado interrompe a busca. Em seguida usa `filter=place:<place_id>` na API Places: o provedor aplica o limite do lugar. Coordenadas de centro e raio não definem pertencimento municipal. O ID do limite fica em `municipalityBoundaryId` e os resultados conservam a evidência de origem.

O endereço textual de um ponto pode ter cidade postal diferente da administrativa. A evidência do limite prevalece; não excluímos um ponto apenas por esse texto. A deduplicação usa ID OSM com tipo quando disponível, ID do provedor e nome/coordenadas equivalentes (cinco casas decimais); filiais em coordenadas distintas permanecem separadas. Os formatos de ID existentes (`osmType-osmId` e `geoapify-place_id`) são preservados para manter referências de favoritos, detalhes e avaliações.

Photon pode fornecer pontos e nomes úteis como candidatos, mas um ponto de geocodificação, `extent` ou caixa retangular não prova limite municipal. A proposta não usa Photon como fallback silencioso por raio. Sem limite municipal confirmado não há resultado confirmado. A disponibilidade e exatidão de limites e estabelecimentos dependem do Geoapify e de suas fontes, incluindo OpenStreetMap; áreas sem cobertura, registros incompletos, limites desatualizados e geocodificação ambígua podem reduzir resultados. Não se afirma cobertura completa nem verificação independente da geometria do provedor.

A paginação solicita até 500 registros por página, com prazo total de 55 segundos para o provedor e até 15 segundos por chamada. Uma resposta com 10.000 candidatos provoca erro em vez de guardar uma lista truncada. Limites de plano, quota, tempo das Edge Functions e disponibilidade podem interromper cidades grandes; erros não viram cache vazio. Uma resposta bem-sucedida sem pontos confirmados pode ser armazenada.

## Cache e compatibilidade

A proposta reutiliza a tabela real `restaurant_cache`, com RLS e acesso de backend já existentes. Não exige migração nem modifica políticas ou dados legados. O adaptador usa `fetched_at` e `expires_at`, mantendo exatamente 24 horas sem renovar em leituras. A chave v3 inclui município normalizado, UF e país, separada das chaves legadas; não mistura cidades homônimas de estados diferentes. A lista é novamente validada na leitura.

O cache do navegador continua com seis horas, isolado por chave v3 e sem reutilizar entradas v2 potencialmente contaminadas. Recarregar a página não renova artificialmente sua validade. A cache local pode manter dados por até seis horas após uma resposta do backend, inclusive se a entrada remota expirar nesse intervalo; a validade da entrada Supabase permanece 24 horas. Respostas simultâneas compartilham a mesma requisição no cliente. O cache do navegador é uma otimização local, não uma fronteira de segurança.

## Validação e operação pendente

Os testes de frontend, serviços, provedor e handler usam mocks. Não consultam nem escrevem no Supabase real. O wrapper passou em `deno check`; isso não substitui teste de integração com o banco. Antes de aprovar produção: conferir schema real, permissões, chave Geoapify exclusivamente no backend, limites administrativos de municípios vizinhos/homônimos e quotas. Não configurar `GEOAPIFY_API_KEY` nem `SUPABASE_SERVICE_ROLE_KEY` em variáveis `VITE_`. O wrapper Deno e o SQL precisam de validação de integração em Supabase de teste; lint JavaScript, Vitest e build Vite não substituem essa etapa.

Referências: [filtro por limite no Geoapify Places](https://apidocs.geoapify.com/docs/places), [segredos de Edge Functions](https://supabase.com/docs/guides/functions/secrets).

O procedimento de liberação está em [PRODUCTION_RELEASE.md](PRODUCTION_RELEASE.md). O envelope v3 informa município, versão e `expiresAt`, permitindo verificar o contrato e a reutilização do cache antes de publicar o frontend. Essa verificação não substitui conferir estabelecimentos de divisa e cobertura real do provedor.
