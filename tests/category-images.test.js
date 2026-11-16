import { describe, expect, it } from 'vitest'
import { getCategoryImage, getCategoryImageKey } from '../src/services/categoryImages'
import { categoryPhotos } from '../scripts/categoryPhotoSources.mjs'

describe('fotos ilustrativas por categoria', () => {
  it.each([
    ['Hambúrguer', 'burger'],
    ['hamburgueria', 'burger'],
    ['Pizzaria', 'pizza'],
    ['Café', 'cafe'],
    ['Japonesa', 'japanese'],
    ['Brasileira', 'brazilian'],
    ['Vegetariana', 'vegetarian'],
    ['Churrascaria', 'barbecue'],
    ['Carnes', 'barbecue'],
    ['Padaria', 'bakery'],
    ['Frutos do mar', 'seafood'],
    ['Fast Food', 'fastfood'],
    ['Mexicana', 'mexican'],
    ['Chinesa', 'chinese'],
    ['Francesa', 'french'],
    ['Italiana', 'italian'],
    ['Restaurante', 'restaurant'],
    [null, 'restaurant'],
    ['categoria desconhecida', 'restaurant'],
  ])('escolhe %s para %s', (category, expected) => {
    expect(getCategoryImageKey(category)).toBe(expected)
    expect(categoryPhotos[expected]).toMatch(/^photo-[a-zA-Z0-9-]+$/)
  })

  it('mantém caminho servido pelo GitHub Pages e descrição ilustrativa', () => {
    const image = getCategoryImage('Café')
    expect(image.url).toContain('/category-images/cafe.jpg')
    expect(image.fallbackUrl).toContain('/category-images/restaurant.jpg')
    expect(image.alt).toContain('Imagem ilustrativa')
  })

  it('usa a mesma foto para todas as filiais da mesma categoria', () => {
    expect(getCategoryImage('Hambúrguer').url).toBe(getCategoryImage('Hamburgueria').url)
  })
})
