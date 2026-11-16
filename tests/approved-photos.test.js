import { describe, it, expect } from 'vitest'
import { resolveApprovedRestaurantPhoto } from '../src/services/images'

const restaurant = {
  id: 'n-123',
  name: 'Restaurante Exemplo',
  city: 'São Paulo',
  state: 'SP',
  latitude: -23.55,
  longitude: -46.63,
}
const commonsPhoto = {
  id: 'n-123', city: 'Sao Paulo', state: 'SP',
  latitude: -23.55, longitude: -46.63,
  source: 'commons',
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/example.jpg',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Example.jpg',
  license: 'CC BY-SA 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  author: 'Fotógrafo Exemplo',
}

describe('curadoria de fotografias por filial', () => {
  it('aceita uma foto Commons revisada para o restaurante correto', () => {
    expect(resolveApprovedRestaurantPhoto(restaurant, [commonsPhoto])?.source)
      .toBe('commons')
  })
  it('não transfere a mesma foto para outra filial ou cidade', () => {
    expect(resolveApprovedRestaurantPhoto({ ...restaurant, id: 'n-456' }, [commonsPhoto])).toBeNull()
    expect(resolveApprovedRestaurantPhoto({ ...restaurant, city: 'Guarulhos' }, [commonsPhoto])).toBeNull()
    expect(resolveApprovedRestaurantPhoto({ ...restaurant, latitude: -23.60 }, [commonsPhoto])).toBeNull()
  })
  it('não usa imagem Commons sem autor, licença ou origem verificável', () => {
    expect(resolveApprovedRestaurantPhoto(restaurant, [{ ...commonsPhoto, author: '' }])).toBeNull()
    expect(resolveApprovedRestaurantPhoto(restaurant, [{ ...commonsPhoto, licenseUrl: '' }])).toBeNull()
    expect(resolveApprovedRestaurantPhoto(restaurant, [{ ...commonsPhoto, sourceUrl: 'https://example.com/' }])).toBeNull()
  })
  it('aceita fotos próprias com registro de autorização', () => {
    const authorized = {
      ...commonsPhoto, source: 'authorized',
      sourceUrl: 'https://example.org/restaurant-photos',
      imageUrl: 'https://example.org/restaurant.jpg',
      license: 'Autorizada pelo titular',
      licenseUrl: null,
      permissionReference: 'arquivo-de-consentimento-001',
    }
    expect(resolveApprovedRestaurantPhoto(restaurant, [authorized])?.imageUrl)
      .toBe(authorized.imageUrl)
    expect(resolveApprovedRestaurantPhoto(restaurant, [{ ...authorized, permissionReference: '' }])).toBeNull()
  })
})
