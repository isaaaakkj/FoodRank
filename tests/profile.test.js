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
import { BANNER_COLORS, DEFAULT_BANNER_COLOR } from '../src/data/bannerColors'

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

  it('respeita o limite de 15 caracteres para o @usuário', async () => {
    await expect(saveMyProfile('a', { username: 'abcdefghijklmnop', display_name: 'João', bio: '' }))
      .rejects.toThrow(/15 caracteres/)
    await expect(saveMyProfile('a', { username: 'abc', display_name: 'João', bio: '' }))
      .resolves.toBeTruthy()
  })

  it('salva a cor selecionada da capa junto com os demais campos públicos', async () => {
    const color = BANNER_COLORS[2].value
    await saveMyProfile('a', { username: 'joao', display_name: 'João', bio: '', banner_color: color })
    expect(update).toHaveBeenCalledWith({
      username: 'joao', display_name: 'João', bio: '', banner_color: color,
    })
  })

  it('rejeita cores arbitrárias sem enviar ao banco', async () => {
    await expect(saveMyProfile('a', {
      username: 'joao', display_name: 'João', bio: '', banner_color: '#ffffff',
    })).rejects.toThrow(/cores disponíveis/)
    expect(from).not.toHaveBeenCalled()
    expect(BANNER_COLORS[0].value).toBe(DEFAULT_BANNER_COLOR)
  })

  it('informa conflito para usernames repetidos', async () => {
    single.mockResolvedValueOnce({ data: null, error: { code: '23505' } })
    await expect(saveMyProfile('a', { username: 'joao', display_name: 'João', bio: '' }))
      .rejects.toThrow(/já está em uso/)
  })
})
