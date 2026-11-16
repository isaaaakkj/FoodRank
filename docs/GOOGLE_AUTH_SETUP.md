# Login Google + perfis — ativação segura

## O que foi implementado

- Google OAuth via Supabase Auth, com PKCE e sessão persistente.
- Menu de perfil na barra superior, com foto Google e rota `/#/profile`.
- Nome público, @usuário único, bio (300 caracteres) e histórico de avaliações da conta.
- RLS: perfil editável somente pelo proprietário. E-mail não é publicado.
- A Edge Function `submit-review` valida o access token por `supabase.auth.getUser` e obtém o `user_id` e `author_name` do servidor. Não confia em valores de identidade enviados pelo navegador.
- Comentários antigos sem `user_id` permanecem anônimos. **Não associe retroativamente pelo nome**, pois nomes não provam identidade.
- A imagem do perfil é a foto pública fornecida pela conta Google na criação do perfil; upload personalizado ainda não implementado.

## Configurar — obrigatório antes de publicar

1. No **Supabase SQL Editor**, execute a migração `supabase/migrations/202611160001_google_profiles_review_history.sql`. Confira que existem `public.profiles`, `public.reviews.user_id` e policies de RLS. Faça backup antes de aplicar em produção.
2. No **Google Auth Platform / Google Cloud Console**, configure tela de consentimento, usuários de teste (quando aplicável) e crie um OAuth Client ID tipo **Web application**.
   - Authorized JavaScript origins: `https://isaaaakkj.github.io` e, para desenvolvimento, `http://localhost:5173`.
   - Authorized redirect URI: `https://<SEU-PROJECT-REF>.supabase.co/auth/v1/callback`. Este URI é do **Supabase**, não do GitHub Pages.
3. No **Supabase → Authentication → Providers → Google**, habilite Google e configure **Client ID** e **Client Secret**. Mantenha a credencial secreta somente no Google/Supabase; jamais a coloque no GitHub, Vite ou código frontend.
4. No **Supabase → Authentication → URL Configuration**:
   - Site URL: `https://isaaaakkj.github.io/FoodRank/`
   - Additional Redirect URLs: `https://isaaaakkj.github.io/FoodRank/`, `http://localhost:5173/FoodRank/`.
   - O FoodRank usa HashRouter, mas o retorno OAuth PKCE é feito na raiz `/FoodRank/?code=...`, onde o cliente troca automaticamente o código pela sessão.
5. Atualize a Edge Function no projeto Supabase: `supabase functions deploy submit-review` após autenticar seu CLI no projeto, ou publique o conteúdo de `supabase/functions/submit-review/index.ts` pelo Dashboard. A função precisa dos secrets `TURNSTILE_SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` existentes.
6. Mantenha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (publishable ou anon) nas configurações do GitHub Actions. **Nunca use uma service role como chave VITE_**.
7. Após verificar os passos 1–6, faça merge do PR. O GitHub Pages executa o deploy automático.

## Testes manuais indispensáveis

- Na barra superior, clique no ícone do perfil e inicie Google OAuth.
- Confirme que volta para o FoodRank e que recarregar a página mantém a sessão.
- Altere o @usuário e salve. Entre com segunda conta e confirme que não pode usar o mesmo @usuário.
- Verifique que uma conta não consegue ler ou alterar `profiles` de outra, e que a API não aceita `user_id` enviado no body.
- Publique avaliação autenticada e confira sua presença no histórico e na timeline. Saia da conta e confira que não há acesso ao histórico pessoal.
- Verifique o formulário de comentários sem login: é possível buscar unidades, mas não enviar.
- Confirme que as avaliações anônimas anteriores continuam na timeline pública, mas **não entram no histórico de ninguém**.

## Privacidade

O uso de contas Google introduz tratamento de identificadores pessoais. Atualize os termos e a política de privacidade do FoodRank antes da ativação, informando finalidade, dados públicos (nome, @, avatar, bio e comentários), retenção, remoção de conta/dados e contato para solicitações. O histórico no MVP é privado ao titular da conta (exceto comentários já públicos na timeline).
Documentação oficial: https://supabase.com/docs/guides/auth/social-login/auth-google e https://supabase.com/docs/guides/auth/redirect-urls
