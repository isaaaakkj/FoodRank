# Manutenção do FoodRank — 13/11/2026

## Problemas identificados
- O frontend atribuía o município pesquisado a todos os restaurantes, sem confirmação geográfica.
- A busca não normalizava acentos e remontava a lista a cada filtro.
- Faltavam testes automatizados obrigatórios no deploy.
- O histórico contém `.env` com chave privada Supabase exposta; o arquivo atual está ignorado e fora do índice.

## Funcionalidades em manutenção
- Pesquisa por nome, categoria e localização combinada com cidade/estado.
- Confirmação municipal e isolamento do cache entre cidades.
- Integração da Edge Function e do cache Supabase de 24 horas.

## Status das correções
- Frontend: normalização, filtros combinados, deduplicação e validação municipal implementados e testados localmente.
- Backend: `get-restaurants` v16 publicada em produção com autorização, usando tabela e IDs existentes, sem migração.
- Validação local: 41 testes Vitest e lint aprovados; navegação móvel, build, verificação do artefato e análise Deno aprovados na preparação anterior. Permanece aviso de bundle acima de 500 kB.
- Produção: contrato municipal, CORS e reutilização do cache aprovados em Santo André (294 resultados) e São Bernardo do Campo (356), sem IDs compartilhados. Cache de 24 horas confirmado no banco. Resumo da busca corrigido localmente para não informar zero resultados em erro ou carregamento.
- Workflow: CI de pull request e testes obrigatórios; publicação na main por push ou acionamento manual exige backend compatível e cache verificado antes do build/upload.
- Segurança: auditoria e backup verificado concluídos; limpeza do histórico preparada e não executada.

## Pendências atuais
- Publicar o frontend no GitHub Pages em etapa autorizada; nenhuma publicação de Pages foi realizada nesta entrega.
- Manter o backup de reversão. O ambiente de teste separado não foi criado; a validação ocorreu diretamente em produção por decisão do usuário.
- Conferir cobertura municipal e quotas; dados geográficos incompletos podem reduzir resultados.
- Confirmar revogação/substituição da chave privada e aprovar separadamente a limpeza coordenada do histórico.
