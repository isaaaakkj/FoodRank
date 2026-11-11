# Publicar o FoodRank no GitHub Pages

Este projeto usa **Vite + React** e é publicado por **GitHub Actions**. O endereço esperado é:

https://isaaaakkj.github.io/FoodRank/

## 1. Habilitar Pages

No GitHub, acesse **Settings → Pages → Build and deployment → Source** e selecione **GitHub Actions** (não `Deploy from a branch`). O workflow já está em `.github/workflows/deploy.yml`.

## 2. Configurar variáveis do Supabase

Acesse **Settings → Secrets and variables → Actions → New repository secret** e crie estes dois *repository secrets*:

- `VITE_SUPABASE_URL`: URL pública do projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: chave pública/anon do Supabase usada pelo frontend

Use os valores do seu arquivo `.env` local. **Não envie o arquivo `.env` ao GitHub e nunca utilize a chave `service_role` no frontend.**

**Nota:** variáveis com prefixo `VITE_` são incorporadas ao JavaScript distribuído no navegador. A chave anon/publicável é destinada a esse uso; configure corretamente as políticas de segurança do Supabase (RLS). Não coloque segredos privados em variáveis `VITE_`.

## 3. Publicar

O workflow é iniciado automaticamente quando há um push ou merge na `main`. Também pode ser executado manualmente em **Actions → Deploy FoodRank → Run workflow → main**.

Acompanhe os jobs `build` e `deploy`. Após a conclusão, abra:

https://isaaaakkj.github.io/FoodRank/

## 4. Se ocorrer erro

- **Falta de variáveis:** configure os dois secrets com os nomes exatos acima.
- **Falha em `npm ci` ou `npm run build`:** abra o log do job `build` no Actions.
- **Falha na etapa de Pages:** confirme que **Settings → Pages → Source** está em **GitHub Actions**.
- **Página em branco:** abra o console do navegador e confira as requisições e a configuração do Supabase.
- **Erro ao atualizar uma rota interna:** o workflow publica uma cópia de `index.html` como `404.html` para permitir carregar o aplicativo React em URLs internas. O endereço pode continuar exibindo o status HTTP 404 mesmo que o app carregue.

## 5. Conferir o aplicativo

Teste a página inicial, pesquisa de cidade/estado, cards dos restaurantes e navegação para os detalhes. O GitHub Pages hospeda apenas o frontend; a Edge Function `get-restaurants` precisa continuar publicada e acessível no Supabase.
