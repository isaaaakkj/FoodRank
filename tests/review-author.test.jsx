import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import ReviewCard from '../src/components/ReviewCard'

const review = {
  author_name: 'Ana Silva',
  author_username: 'ana_food',
  author_avatar_url: 'https://example.com/avatar.jpg',
  created_at: '2026-11-16T12:00:00Z',
  restaurant_name: 'Café Central',
  city: 'São Paulo',
  state: 'SP',
  comment: 'Gostei bastante do atendimento.',
  rating: 5,
}

describe('identificação pública nas avaliações', () => {
  it('mostra imagem, nome público e @usuário na avaliação publicada', () => {
    const { container } = render(<ReviewCard review={review} />)
    expect(screen.getByText('Ana Silva')).toBeInTheDocument()
    expect(screen.getByText('@ana_food')).toBeInTheDocument()
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('mantém avaliações antigas sem usuário ou avatar', () => {
    const { container } = render(<ReviewCard review={{ ...review, author_username: null, author_avatar_url: null }} />)
    expect(screen.queryByText('@ana_food')).not.toBeInTheDocument()
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText('Ana Silva')).toBeInTheDocument()
  })
})
