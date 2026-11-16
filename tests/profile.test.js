import { beforeEach, describe, expect, it, vi } from 'vitest'

const updateResult = { id: 'a', username: 'joao', display_name: 'João', bio: 'Gosto de café' }
const { single, update, from } = vi.hoisted(() => {
  const single = vi.fn()
  const update = vi.fn(() => ({ eq: () => ({ select: () => ({ single }) }) }))
  const from = vi.fn(() => ({ update }))
  return { single, update, from }
})
vi.mock('../src/services/supabase', () => ({ supabase: { from } }))
import { saveMyProfile } from '../src/services/profiles'

describe('edição de perfil', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    single.mockResolvedValue({ data: updateResult, error: null })
  })

  it('não aceita username inválido nem nomes curtos', async () => {
    await expect(saveMyProfile('a', { username: 'Nome com espaços', display_name: 'João', bio: '' }))
      .rejects.toThrow(/usuário/)
    await expect(saveMyProfile('a', { username: 'joao', display_name: 'J', bio: '' }))
      .rejects.toThrow(/nome/)
    expect(from).not.toHaveBeenCalled()
  })

  it('salva somente campos públicos permitidos e normaliza o username', async () => {
    const result = await saveMyProfile('a', { username: 'JOAO', display_name: 'João', bio: 'Gosto de café', id: 'outra-conta' })
    expect(result).toEqual(updateResult)
    expect(update).toHaveBeenCalledWith({ username: 'joao', display_name: 'João', bio: 'Gosto de café' })
  })

  it('informa conflito para usernames repetidos', async () => {
    single.mockResolvedValueOnce({ data: null, error: { code: '23505' } })
    await expect(saveMyProfile('a', { username: 'joao', display_name: 'João', bio: '' }))
      .rejects.toThrow(/já está em uso/)
  })
})
