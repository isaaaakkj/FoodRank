import { it, expect, vi, beforeEach, afterEach } from 'vitest'
const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }))
vi.mock('../src/services/supabase', () => ({ supabase: { functions: { invoke } } }))
let getRestaurants
beforeEach(async () => {
  vi.resetModules()
  vi.useFakeTimers()
  invoke.mockReset()
  ;({ getRestaurants } = await import('../src/services/restaurants'))
})
afterEach(() => vi.useRealTimers())
const cafe = { id: '1', name: 'Café', city: 'São Paulo', state: 'SP', municipalityVerification: 'boundary' }
it('reutiliza cache normalizado, deduplica e não reatribui cidades vizinhas', async () => {
  invoke.mockResolvedValue({ data: { restaurants: [cafe, cafe, { ...cafe, id: '2', city: 'Guarulhos' }] } })
  expect(await getRestaurants('São Paulo', 'SP')).toEqual([cafe])
  expect(await getRestaurants('sao paulo', 'São Paulo')).toEqual([cafe])
  expect(invoke).toHaveBeenCalledTimes(1)
  await getRestaurants('Guarulhos', 'SP')
  expect(invoke).toHaveBeenCalledTimes(2)
})
it('expira cache local em 6h e ignora o cache antigo v2', async () => {
  localStorage.setItem('foodrank-restaurants-v2-são paulo-sp', JSON.stringify({ data: [cafe] }))
  invoke.mockResolvedValue({ data: { restaurants: [cafe] } })
  await getRestaurants('São Paulo', 'SP')
  vi.advanceTimersByTime(6 * 60 * 60 * 1000 + 1)
  await getRestaurants('São Paulo', 'SP')
  expect(invoke).toHaveBeenCalledTimes(2)
})
it('não persiste erro e permite nova tentativa', async () => {
  invoke.mockResolvedValueOnce({ error: new Error('offline') }).mockResolvedValueOnce({ data: { restaurants: [cafe] } })
  await expect(getRestaurants('São Paulo', 'SP')).rejects.toThrow()
  expect(await getRestaurants('São Paulo', 'SP')).toEqual([cafe])
})
it('informa contrato antigo sem atribuir município ao resultado desconhecido', async () => {
  invoke.mockResolvedValue({ data: { restaurants: [{ id: 'old', name: 'Sem município' }] } })
  await expect(getRestaurants('São Paulo', 'SP')).rejects.toThrow('backend está pendente')
})
it('cache persistido mantém vencimento original ao recarregar o módulo', async () => {
  invoke.mockResolvedValue({ data: { restaurants: [cafe] } })
  await getRestaurants('São Paulo', 'SP')
  vi.advanceTimersByTime(5 * 60 * 60 * 1000)
  vi.resetModules()
  ;({ getRestaurants } = await import('../src/services/restaurants'))
  await getRestaurants('São Paulo', 'SP')
  expect(invoke).toHaveBeenCalledTimes(1)
  vi.advanceTimersByTime(60 * 60 * 1000)
  await getRestaurants('São Paulo', 'SP')
  expect(invoke).toHaveBeenCalledTimes(2)
})
