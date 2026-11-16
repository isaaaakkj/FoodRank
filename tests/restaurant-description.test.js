import { describe, it, expect } from 'vitest'
import { getRestaurantDescription } from '../src/services/restaurantDescription'

describe('descrições dos restaurantes', () => {
  it('usa a descrição cadastrada quando ela existe', () => {
    expect(getRestaurantDescription({ description: '  Aberto desde 1990.  ' })).toBe('Aberto desde 1990.')
  })

  it('descreve a categoria e a unidade sem inventar pratos ou características', () => {
    const description = getRestaurantDescription({
      name: 'Café Exemplo',
      category: 'Café',
      city: 'São Paulo',
      state: 'SP',
      location: 'Rua Exemplo, 15',
    })
    expect(description).toContain('Cafeteria em Rua Exemplo, 15')
    expect(description).not.toMatch(/cardápio variado|melhor|excelente|desde 19/)
  })

  it('não confunde o nome da marca com a localização de uma filial', () => {
    const first = getRestaurantDescription({ name: 'Rede Exemplo', category: 'Fast Food', location: 'Centro' })
    const second = getRestaurantDescription({ name: 'Rede Exemplo', category: 'Fast Food', location: 'Pinheiros' })
    expect(first).toContain('Centro')
    expect(second).toContain('Pinheiros')
    expect(first).not.toEqual(second)
  })

  it('mantém texto informativo quando faltam dados', () => {
    expect(getRestaurantDescription({ name: 'Exemplo' })).toContain('Restaurante.')
  })
})
