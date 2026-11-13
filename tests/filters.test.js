import { describe, it, expect } from 'vitest'
import { filterRestaurants } from '../src/services/filters'
import { confirmedRestaurants, municipalityKey } from '../supabase/functions/_shared/municipality'

const cafe = { id: '1', name: 'Café São João', category: 'Café', city: 'São Paulo', state: 'SP', location: 'Sé', municipalityVerification: 'boundary' }
const pizza = { ...cafe, id: '2', name: 'Cantina', category: 'italian;pizza' }
const otherCity = { ...cafe, id: '3', city: 'Guarulhos' }
const otherState = { ...cafe, id: '4', state: 'RJ' }
describe('filtros combinados', () => {
  it.each(['cafe sao', 'CAFÉ SÃO', 'São João', 'joa'])('busca parcial %s', search => {
    expect(filterRestaurants([cafe, pizza], { search })).toEqual([cafe])
  })
  it('pesquisa categoria e endereço com acentos', () => {
    expect(filterRestaurants([cafe, pizza], { search: 'cafe se' })).toEqual([cafe])
    expect(filterRestaurants([cafe, pizza], { search: 'italiana' })).toEqual([pizza])
  })
  it('combina nome, categoria, cidade e UF', () => {
    expect(filterRestaurants([cafe, pizza, otherCity, otherState], {
      search: 'sao', category: 'Cafés', location: { city: 'sao paulo', state: 'São Paulo' },
    })).toEqual([cafe])
    expect(filterRestaurants([cafe, pizza], { category: 'Pizzaria' })).toEqual([pizza])
  })
  it('não confirma município desconhecido nem mistura vizinhos ou duplicados', () => {
    expect(confirmedRestaurants([cafe, cafe, otherCity, otherState, { ...cafe, id: '5', municipalityVerification: undefined }], 'sao paulo', 'São Paulo')).toEqual([cafe])
  })
  it('normaliza chaves sem colisão de cidade/estado', () => {
    expect(municipalityKey('São Paulo', 'SP')).toBe(municipalityKey('sao paulo', 'São Paulo'))
    expect(municipalityKey('São Paulo', 'SP')).not.toBe(municipalityKey('São Paulo', 'RJ'))
  })
})
