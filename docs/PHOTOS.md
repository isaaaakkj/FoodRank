# Fotografias verificadas — FoodRank

O FoodRank não utiliza fotos genéricas ou imagens de restaurantes com nome parecido. Cada foto deve ser associada a **uma unidade exata** (ID, cidade, UF e coordenadas). Esta curadoria funciona sem serviços de fotografias pagos, sem login e sem alterar tabelas ou Edge Functions.

## Estado atual

A infraestrutura de curadoria está implementada, mas o catálogo `src/data/approvedRestaurantPhotos.js` começa vazio. **Nenhuma imagem da Wikimedia Commons foi automaticamente associada a restaurantes.** Até fotos serem revisadas e cadastradas, aparece “Foto não disponível”.

## Fotografias do Wikimedia Commons

1. Encontre o restaurante no FoodRank e confirme o ID do OSM/Geoapify e sua latitude/longitude, cidade e UF.
2. Execute `node scripts/find-commons-photos.mjs -23.55 -46.63 "Nome do restaurante"` com **as coordenadas reais** desse estabelecimento. O script consulta a API pública do Commons e lista fotos candidatas próximas em até 100 m.
3. Abra as páginas de cada arquivo candidato. Verifique **visualmente** o estabelecimento, fachada, rua, endereço e se realmente é **a mesma filial**. Proximidade geográfica **não prova identidade**. Se não houver evidência suficiente, não use.
4. Confirme os termos na página do arquivo: nome do autor/criador, licença, exigência de atribuição e eventuais restrições, inclusive direitos de personalidade e marca. Para CC BY e CC BY-SA, exiba autoria, fonte e licença; se houve adaptação, indique alterações. O sistema já exibe créditos/fonte/licença da entrada aprovada.
5. Depois de verificar, adicione uma entrada ao `approvedRestaurantPhotos` com campos `id, city, state, latitude, longitude, source: 'commons', imageUrl, sourceUrl, author, license, licenseUrl`. `imageUrl` deve ser URL HTTPS de Wikimedia Commons (tipicamente `upload.wikimedia.org`); `sourceUrl` deve apontar à página **da própria fotografia** em `commons.wikimedia.org`.
6. **Não cole HTML da API** no campo `author`: os metadados do Commons podem conter marcação HTML. Use o texto limpo de autoria e confirme manualmente a informação.

## Fotos autorizadas pelo restaurante ou fotógrafo

Solicite autorização documentada ao titular dos direitos para exibir a fotografia no FoodRank. Guarde prova do consentimento **fora do repositório público**, com identificação da filial, imagens autorizadas, uso previsto e prazo/condições.

Publique a imagem em uma hospedagem HTTPS de sua titularidade (por exemplo, bucket público de imagens no Supabase Storage, se disponível no projeto). Não armazene segredos ou documentos de autorização dentro do GitHub.

Crie uma entrada com `id, city, state, latitude, longitude, source: 'authorized', imageUrl, sourceUrl, author, license: 'Uso autorizado', permissionReference`. `sourceUrl` deve apontar para uma página pública de origem/atribuição legítima; `permissionReference` é somente um identificador interno, nunca uma URL com credenciais.

## Limites e manutenção

- O catálogo funciona por unidade: IDs repetidos sem coordenadas compatíveis não recebem fotos.
- São aceitas imagens HTTPS com origem e direitos identificados. `sourceUrl` e `licenseUrl` devem ser URLs HTTPS válidas.
- Fotos podem deixar de ser exibidas quando o link original não estiver mais disponível. Neste caso, é mostrado um placeholder.
- Se o estabelecimento mudar de endereço ou o ID da fonte mudar, a curadoria deve ser revalidada.
- A API do Commons retorna **candidatas**, não fotos confirmadas. Não faça ligação automática baseada apenas no nome, coordenadas ou similaridade visual.
- O sistema mantém os serviços atuais de localização e cache do Supabase. Adicionar fotos ao catálogo exige apenas novo build do frontend, sem migração de banco.
- Testes: `npm test`, `npm run lint`, `npm run build`; os testes verificam licença e separação das filiais.

Referências oficiais:
- https://commons.wikimedia.org/wiki/Commons:Search_by_location
- https://www.mediawiki.org/wiki/API:Imageinfo
- https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia
