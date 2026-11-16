import { describe, expect, it, vi } from 'vitest'
import { favoriteKey, normalizeFavorite, readLegacyFavorites } from '../src/services/favorites'

vi.mock('../src/services/supabase', () => ({ supabase: null }))

describe('identidade e migração dos favoritos', () => {
  it('usa restaurante, município e estado para identificar uma filial', () => {
    expect(favoriteKey({ id: 15, city: 'São Paulo', state: 'SP' }))
      .toBe(favoriteKey({ id: '15', city: 'São Paulo', state: 'SP' }))
    expect(favoriteKey({ id: 15, city: 'Campinas', state: 'SP' }))
      .not.toBe(favoriteKey({ id: 15, city: 'São Paulo', state: 'SP' }))
  })

  it('descarta entradas inválidas e propriedades não permitidas', () => {
    expect(normalizeFavorite({ name: 'Sem ID' })).toBeNull()
    expect(normalizeFavorite({ id: '1', name: '' })).toBeNull()
    const saved = normalizeFavorite({ id: '1', name: 'Café', city: 'São Paulo', user_id: 'outro', secret: 'x' })
    expect(saved).toEqual({ id: '1', name: 'Café', city: 'São Paulo' })
  })

  it('lê os favoritos antigos, remove duplicatas e não modifica o armazenamento ao consultar', () => {
    const storage = { getItem: vi.fn(() => JSON.stringify([
      { id: 1, name: 'Padaria', city: 'Campinas', state: 'SP' },
      { id: 1, name: 'Padaria', city: 'Campinas', state: 'SP' },
      { id: 2, name: 'Café', city: 'Santos', state: 'SP' },
      { bad: 'entry' },
    ])) }
    expect(readLegacyFavorites(storage).map(item => item.name)).toEqual(['Padaria', 'Café'])
    expect(storage.getItem).toHaveBeenCalledWith('foodrank-favorites-v1')
  })
})
