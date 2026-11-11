# FoodRank — Banco de avaliações e publicação automática

## O que já existe

- A busca por restaurantes usa a Edge Function `get-restaurants` e mantém sua estratégia atual de cache.
- O novo recurso de avaliações usa a tabela `public.reviews` (comentários, apelido, nota, restaurante e data).
- Apenas avaliações com `status = 'approved'` podem ser lidas pelos visitantes.
- Comentários enviados entram como `pending`; não são publicados automaticamente.
- Favoritos continuam armazenados **somente no navegador**, sem login e sem perfil compartilhado. Isso evita armazenar identificadores pessoais desnecessários.

## 1. Criar tabela no Supabase (obrigatório)

No painel do **mesmo projeto Supabase já utilizado pelo FoodRank**, abra **SQL Editor** e execute o arquivo:

`supabase/migrations/202611110001_create_reviews.sql`

A migração cria a tabela, índices e Row Level Security. **Visitantes não possuem permissão de INSERT, UPDATE nem DELETE**. A chave `service_role` jamais deve ser enviada ao Vite ou ao GitHub Pages.

Confira as políticas e permissões depois da aplicação.

## 2. Habilitar verificação anti-bot (obrigatório para receber comentários)

Crie um widget gratuito **Cloudflare Turnstile** para o domínio `isaaaakkj.github.io` (e um widget separado para `localhost` se desejar testes locais). Você receberá:

- **Site key (pública):** definir como variável do repositório do GitHub `VITE_TURNSTILE_SITE_KEY` em **Settings → Secrets and variables → Actions → Variables**.
- **Secret key (privada):** definir no Supabase como secret da Edge Function: `TURNSTILE_SECRET_KEY`.

A validação dos tokens ocorre **somente no servidor**. Para usar localhost, configure `TURNSTILE_HOSTNAME=localhost` em um projeto de teste; o ambiente de produção usa por padrão `isaaaakkj.github.io`.

## 3. Implantar a Edge Function

A nova função está no arquivo `supabase/functions/submit-review/index.ts`.

Com Supabase CLI vinculado ao projeto correto:

```bash
supabase login
supabase link --project-ref SEU_PROJECT_REF
supabase secrets set TURNSTILE_SECRET_KEY=SUA_CHAVE_PRIVADA
supabase functions deploy submit-review --no-verify-jwt
```

**Não adicione nenhuma chave privada ao código ou ao arquivo `.env` do frontend.** A Edge Function usa as credenciais server-side gerenciadas pelo Supabase. O endpoint permite apenas origens conhecidas, valida o token Turnstile com Cloudflare e grava comentários com status pendente.

O modo `--no-verify-jwt` permite o uso sem login. Ele não substitui a proteção: a verificação do Turnstile e a moderação são obrigatórias. Para um serviço público com mais tráfego, acrescente rate limiting no servidor e mecanismos antiabuso adicionais.

## 4. Configuração do GitHub Pages

Os secrets já usados para busca permanecem:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Adicione também a **repository variable** `VITE_TURNSTILE_SITE_KEY` (a chave pública do widget; não confundir com a chave privada).

O workflow `.github/workflows/deploy.yml` passa a publicar após cada **push/merge na main**, mantendo a opção de execução manual. Ele **não executa migrations** nem instala Edge Functions automaticamente, pois essas operações exigem credenciais administrativas, configuração específica do projeto e verificações adicionais.

## 5. Aprovar uma avaliação

Em **Supabase Dashboard → Table Editor → reviews**, encontre um comentário com `status = pending`, revise-o e altere para `approved`. Se inadequado, use `rejected`. Só registros aprovados aparecem na timeline e na página do restaurante.

O apelido fornecido pelo visitante **não representa identidade verificada**; não apresente os comentários como provas de visita. Moderação não equivale à verificação de identidade ou experiência.

## 6. Testes antes de publicar

1. Execute `npm run lint` e `npm run build`.
2. Faça uma busca por cidade/estado e confirme que o formulário lista os mesmos restaurantes.
3. Conclua o Turnstile e envie uma avaliação com nota, apelido e texto de pelo menos 10 caracteres.
4. Confira que o registro foi criado como `pending` e **não apareceu publicamente**.
5. Aprove o registro no Supabase e recarregue a timeline e os detalhes do restaurante.
6. Tente acessar um registro pendente usando a chave pública: ele não deve ser retornado.
7. Execute o merge na `main` e confira o workflow no GitHub Actions.

**Sem tabela, Edge Function implantada e Turnstile configurado, o envio de avaliações não estará funcional**, mesmo depois do deploy do frontend.

## Limitações atuais

- O envio e a consulta já estão preparados no código, mas a configuração real do Supabase/Turnstile deve ser realizada por quem administra esses serviços.
- A busca e o cache de restaurantes existentes não foram migrados; são responsabilidade da Edge Function `get-restaurants`.
- Favoritos são locais e não sincronizam entre dispositivos.
- Ainda não há painel próprio de moderação, votos ou respostas a comentários.
