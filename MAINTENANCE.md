# FoodRank — manutenção de 11/11/2026

Este relatório registra a validação inicial na branch `fix/foodrank-maintenance`. Após essa etapa, o proprietário solicitou a publicação no GitHub Pages: as alterações estão sendo integradas por pull request, com acionamento manual do deploy. Não houve alteração de API ou migração de banco. Identidade visual, busca por estado/cidade, categorias, cartões, detalhes, mapas e chamada à Edge Function `get-restaurants` foram preservados. Nenhuma dependência adicionada.

## Tela branca e GitHub Pages

O `index.html` fonte referencia `/src/main.jsx`, corretamente para desenvolvimento com Vite. Esse arquivo não deve ser servido diretamente pelo Pages. Um 404 de `main.jsx` é compatível com publicação do código fonte em vez do artefato compilado; não prova defeito no React.

O `vite.config.js` já tinha `base: '/FoodRank/'`, mas o `dist/index.html` encontrado antes das alterações referenciava `/assets/...` e `/favicon.svg`, mostrando que o artefato local estava desatualizado ou havia sido gerado com outra configuração. O novo build gera `/FoodRank/assets/...` e `/FoodRank/favicon.svg`, sem referência a JSX fonte. Todos os arquivos referenciados existem.

O workflow já enviava `dist`. Agora exige lint e validação do artefato e só permite publicação por `workflow_dispatch`, evitando deploy automático ao integrar código. As rotas usam hash: `/FoodRank/#/restaurant/ID?city=...&state=...`. Recarregar uma página de detalhes solicita ao servidor apenas `/FoodRank/`, sem depender de fallback de SPA do Pages. Links antigos sem hash precisam ser atualizados. A cópia de `index.html` para `404.html` foi removida porque não é necessária para essas rotas.

Na etapa inicial, a configuração administrativa não havia sido consultada. Durante a publicação autorizada, a API confirmou Pages no modo workflow, os dois secrets públicos existentes e o environment `github-pages` permitindo somente `main`. Nenhuma dessas configurações administrativas foi modificada. A publicação deve ocorrer por workflow após integração via pull request; não há push direto na `main`.

Referências: [publicação Vite no Pages](https://vite.dev/guide/static-deploy.html#github-pages), [configuração da origem no GitHub](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Segurança

- `.env` estava versionado, mesmo constando no `.gitignore`. Foi removido apenas do índice Git; o arquivo local permanece disponível e ignorado. Há um `.env.example` sem valores reais.
- A análise dos commits alcançáveis encontrou chave privada Supabase em versões históricas de `.env`. **Revogue a chave exposta e gere outra no Supabase.** Atualize os consumidores de backend que realmente precisem dela. Não basta remover o arquivo do último commit. A limpeza coordenada do histórico é uma ação separada e não substitui a rotação; não foi executada.
- A cópia local atual e os bundles finais não apresentaram o marcador de chave privada encontrado. A análise é estática e não comprova que a chave histórica continua ativa.
- A configuração do Vite impede build quando detecta chave `sb_secret_`, JWT `service_role` ou bloco de chave privada em variáveis `VITE_`, sem imprimir valores. O cliente aceita somente chave pública publishable ou JWT com papel `anon`. Configuração ausente não derruba a renderização da página.
- Chaves públicas de frontend aparecem no bundle por definição; nunca usar chave privada em `VITE_`. A segurança efetiva do backend depende de permissões, RLS e validações do servidor, que não foram modificadas nem auditadas remotamente.
- O popup Leaflet usa um elemento DOM com `textContent`, eliminando interpolação de HTML externo. Coordenadas zero são aceitas; coordenadas inválidas mostram mensagem em vez de inicializar o mapa.
- Ícones Leaflet são importados como assets do Vite. Imagens externas aceitam HTTPS, sem referer, com imagem local de fallback. Textos externos permanecem renderizados pelo React.

Referência: [chaves e rotação no Supabase](https://supabase.com/docs/guides/getting-started/api-keys).

## Proposta de avaliações reais — NÃO implementada; requer aprovação

Hoje o formulário só mantém campos em memória. Não existe inserção, leitura de avaliações, vínculo com os restaurantes encontrados, contrato de API ou código de backend correspondente neste workspace. A lista de restaurantes do formulário e a timeline são demonstrativas. O formulário agora informa isso antes de qualquer preenchimento; a tentativa de envio informa que nada foi salvo e preserva o rascunho em memória.

Proponho, após aprovação e inspeção do schema real:

1. Uma tabela de avaliações com ID gerado, chave estável do restaurante/provedor, cidade, estado, nota inteira de 1 a 5, comentário limitado a 2.000 caracteres, apelido opcional de até 80 caracteres, data gerada no servidor e estado de moderação. Não coletar email, telefone ou conta de usuário.
2. RLS sem escrita direta pelo cliente anônimo. Leitura pública somente de avaliações aprovadas. Escrita por endpoint específico, sem alterar `get-restaurants`, com chave privada exclusivamente no ambiente do servidor.
3. Endpoint validando restaurante, limites e tipos, controle de abuso e duplicidade, origem permitida e moderação. Uma chave pública não distingue visitantes; evitar uma política que libere inserts anônimos irrestritos. Definir estratégia de limitação de requisições e retenção antes de implementá-la.
4. O formulário deve receber o restaurante real selecionado por ID, apresentar erros acessíveis e indicar sucesso somente após confirmação de persistência. Não tratar nomes livres como identidade de restaurante. A timeline passa a consultar apenas registros aprovados, com paginação; notas agregadas devem indicar sua origem.

Essa proposta exige aprovação da tabela, políticas e endpoint antes de qualquer implementação ou execução de SQL. Nenhum desses recursos foi criado.

## Favoritos e experiência

Favoritos guardam apenas dados básicos dos restaurantes, sem dados de visitantes, em `localStorage`, com limite de 200 itens. Funcionam nos cartões e detalhes, sobrevivem à recarga e sincronizam mudanças entre abas. Falhas de armazenamento são informadas e não anunciam sucesso. A lista pode ser removida pelos corações; limpar dados do navegador também remove favoritos.

Antes da busca há orientação explícita. Editar cidade ou estado invalida os resultados apresentados, cancelando a aplicação de respostas antigas. Existem estados separados de carregamento, erro com tentativa novamente e ausência de resultados. A paginação é reiniciada com os filtros.

Os campos receberam nomes acessíveis e rótulos associados; a busca funciona por Enter, categorias e favoritos informam seleção, foco é visível, existe atalho para conteúdo e preferência por movimento reduzido é respeitada. Busca textual e navegação aparecem também no celular. Botões de categorias e timeline têm ações; perfil, notificações, respostas e curtidas demonstrativas estão explicitamente indisponíveis, sem inventar contas ou persistência.

## Verificações executadas

- `npm.cmd ci`: concluído com o lockfile existente. O sufixo `.cmd` evita a restrição de execução de scripts PowerShell; não foi alterada a política do sistema.
- `npm.cmd run lint`: aprovado, inclusive correção dos dois erros de efeitos existentes antes da manutenção.
- `npm.cmd run build`: aprovado. Permanece aviso não bloqueante de bundle acima de 500 kB; não é erro de publicação.
- `node scripts/verify-dist.mjs`: aprovado; verifica base, presença dos assets e ausência de referência a `/src/main.jsx`.
- Build com marcador privado fictício: bloqueado como esperado, sem imprimir o valor.
- `node scripts/smoke-browser.mjs`: aprovado no Chrome headless local com dados controlados em cache: orientação inicial, busca, envio por Enter, nenhum resultado, invalidação ao editar cidade, favoritos persistentes, detalhes após recarga, popup com tentativa de HTML malicioso e coordenadas zero, formulário sem falso sucesso, página inexistente e larguras de 375/768/1440 pixels sem overflow horizontal. Nenhuma exceção JavaScript da aplicação.
- Capturas locais inspecionadas em `artifacts/`, pasta ignorada. O script usa Chrome no caminho padrão Windows ou `BROWSER_PATH`, Node com WebSocket nativo e portas locais 4173/9223; não instala bibliotecas de teste.
- `git diff --check`: aprovado.

O teste de navegador usa o cache existente para evitar consumo de APIs de produção; não valida disponibilidade real, CORS ou permissões da Edge Function. Não houve gravação em Supabase. O código da Edge Function e o schema não estão no repositório e permanecem fora da validação local.

## Arquivos alterados ou adicionados

| Arquivo | Mudança |
| --- | --- |
| `.env` | Removido do rastreamento, preservado localmente. |
| `.gitignore` | Ignora variantes de `.env` e capturas; permite exemplo seguro. |
| `.env.example` | Modelo sem credenciais reais. |
| `index.html` | Português, título, descrição e favicon com base do Vite. |
| `vite.config.js` | Mantém `/FoodRank/`; bloqueia chaves privadas no build. |
| `.github/workflows/deploy.yml` | Publicação manual, lint e verificação de `dist`; remove fallback desnecessário. |
| `src/routes/AppRoutes.jsx` | HashRouter, favoritos, timeline e rota inexistente. |
| `src/pages/Home.jsx` | Invalidação da busca ao editar local, reinício de paginação e alvo de acessibilidade. |
| `src/pages/Restaurant.jsx` | Favoritos reais locais, imagens seguras e remoção de logs de erro externos. |
| `src/pages/Favorites.jsx` | Lista local e orientação sobre persistência. |
| `src/pages/Timeline.jsx` | Página acessível por navegação, com aviso demonstrativo. |
| `src/pages/NotFound.jsx` | Página inexistente com retorno para explorar. |
| `src/components/Header.jsx` | Links funcionais, navegação e filtro no celular, nomes acessíveis e controles indisponíveis identificados. |
| `src/components/Hero.jsx` | Formulário com Enter, rótulos, limites e invalidação ao editar localização. |
| `src/components/CategoryList.jsx` | “Ver todas” limpa categoria e seleção usa `aria-pressed`. |
| `src/components/FeaturedRestaurants.jsx` | Orientação inicial, estados acessíveis, tentativa novamente e ausência de cartões antigos. |
| `src/components/RestaurantCard.jsx` | Favoritos, URL com ID codificado e tratamento de imagens. |
| `src/components/RestaurantMap.jsx` | Popup seguro, ref exclusiva, validação de coordenadas e assets dos marcadores. |
| `src/components/FavoriteButton.jsx` | Controle acessível com mensagens de falha. |
| `src/components/ReviewForm.jsx` | Sem falso sucesso, aviso demonstrativo, rótulos e limites de entrada. |
| `src/components/ReviewCard.jsx` | Ações simuladas identificadas como indisponíveis. |
| `src/components/TimelineSection.jsx` | Conteúdo fictício identificado e links para timeline. |
| `src/hooks/useRestaurants.js` | Resultado vinculado à consulta, proteção contra respostas atrasadas e nova tentativa. |
| `src/hooks/useFavorites.js` | Persistência limitada e sincronização entre componentes/abas. |
| `src/services/supabase.js` | Validação de chave pública e configuração sem queda da página; sem sessão de login. |
| `src/services/restaurants.js` | Preserva Edge Function, valida cache/lista, inclui localização e reduz exposição de erros internos. |
| `src/services/images.js` | Restrição HTTPS e fallback local. |
| `src/styles/global.css` | Foco visível, skip link, movimento reduzido e textos sem overflow. |
| `scripts/verify-dist.mjs` | Verificação reproduzível do artefato publicado. |
| `scripts/smoke-browser.mjs` | Testes locais reproduzíveis sem nova dependência. |
| `README.md` | Instruções do projeto e referência para este relatório. |
| `MAINTENANCE.md` | Diagnóstico, validação, pendências e proposta para aprovação. |

Os demais arquivos foram inspecionados e mantidos. Arquivos vazios de perfil e componentes não utilizados não foram removidos. `dist` foi regenerado para validação e continua ignorado, conforme a configuração original.
