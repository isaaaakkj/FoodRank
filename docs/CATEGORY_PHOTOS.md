# Fotografias ilustrativas por categoria — FoodRank

O FoodRank apresenta **a mesma foto para todos os estabelecimentos de uma categoria** (hamburgueria, pizzaria, cafeteria etc.). A foto é **ilustrativa**, não representa a filial. O rótulo “Imagem ilustrativa” aparece nos cartões e no detalhe.

## Fonte e licença

As fotografias selecionadas são provenientes do **Unsplash**: https://unsplash.com/license. A licença permite uso gratuito em sites e apps, incluindo cópia e modificação, com as restrições descritas na página da licença. Evite associar fotos a restaurantes, marcas ou pessoas específicas; não sugira endosso.

Os IDs das fotos selecionadas estão em `scripts/categoryPhotoSources.mjs`. Você pode localizar a imagem de origem em `https://images.unsplash.com/<ID>`. Antes de trocar a fonte, verifique que a fotografia está no catálogo gratuito e que o uso é compatível com sua licença.

## Onde ficam os arquivos

- `npm run images:prepare` **baixa** as fotos para `public/category-images/*.jpg` no projeto local.
- `npm run dev` e `npm run build` executam a preparação **automaticamente**, caso as fotos ainda não estejam presentes.
- `npm run build` inclui as fotografias no diretório `dist/category-images/`; o GitHub Pages serve as imagens diretamente junto com o site. **O navegador dos visitantes não depende da hospedagem externa de fotos**.
- As imagens JPEG geradas são ignoradas pelo Git para não versionar arquivos binários pesados. O catálogo e o script ficam no repositório e podem recriar os arquivos quando há acesso à internet.
- A primeira preparação ou um build limpo **precisa acessar o Unsplash**. Se a fonte não responder, o script informa qual categoria falhou e impede a publicação de uma página com imagens incompletas.

## Categorias

| Identificador | Categoria |
| --- | --- |
| restaurant | Restaurante (padrão) |
| burger | Hamburgueria |
| pizza | Pizzaria |
| cafe | Cafeteria |
| japanese | Japonesa |
| brazilian | Brasileira |
| vegetarian | Vegetariana / Vegana |
| barbecue | Churrascaria / Carnes |
| bakery | Padaria |
| seafood | Frutos do mar |
| fastfood | Fast Food |
| mexican | Mexicana |
| chinese | Chinesa |
| french | Francesa |
| italian | Italiana |

A identificação está em `src/services/categoryImages.js`. Se uma categoria não tiver mapeamento, é usada a foto de `restaurant`. As descrições, favoritos, filtros e sistema de avaliações permanecem independentes das fotos.

## Como substituir uma imagem

1. Confirme a licença e selecione uma foto apropriada à categoria.
2. Atualize somente o ID da imagem em `scripts/categoryPhotoSources.mjs`.
3. Apague o arquivo correspondente em `public/category-images/` ou faça uma preparação limpa, para baixar o novo arquivo.
4. Execute `npm run images:prepare`, `npm test`, `npm run lint`, `npm run build`.

Não adicione fotos obtidas de uma busca de imagens do Google sem antes verificar os direitos de utilização na **fonte original**.
