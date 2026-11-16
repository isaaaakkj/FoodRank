import { describe, it, expect } from 'vitest'
import { safeImageUrl } from '../src/services/images'

describe('imagens de restaurantes', () => {
  it('aceita URL HTTPS associada ao estabelecimento', () => {
    expect(safeImageUrl('https://example.org/restaurante.jpg')).toBe('https://example.org/restaurante.jpg')
  })

  it('não representa uma foto genérica como se fosse do restaurante', () => {
    expect(safeImageUrl('https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop')).toBeNull()
  })

  it('trata imagem ausente, insegura ou inválida como indisponível', () => {
    expect(safeImageUrl(null)).toBeNull()
    expect(safeImageUrl('')).toBeNull()
    expect(safeImageUrl('javascript:alert(1)')).toBeNull()
    expect(safeImageUrl('http://example.com/image.jpg')).toBeNull()
    expect(safeImageUrl('/src/assets/images/hero.png')).toBeNull()
  })
})
