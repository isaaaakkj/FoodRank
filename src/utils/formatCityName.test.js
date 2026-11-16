import { describe, expect, it } from 'vitest'
import { formatCityName } from './formatCityName'

describe('formatCityName', () => {
  it('restaura o nome oficial de São Paulo mesmo sem acentos', () => {
    expect(formatCityName('sao paulo')).toBe('São Paulo')
    expect(formatCityName('SAO PAULO')).toBe('São Paulo')
    expect(formatCityName('São Paulo')).toBe('São Paulo')
  })

  it('corrige outros nomes conhecidos sem alterar a busca', () => {
    expect(formatCityName('ribeirao preto')).toBe('Ribeirão Preto')
    expect(formatCityName('campos do jordao')).toBe('Campos do Jordão')
    expect(formatCityName('joao pessoa')).toBe('João Pessoa')
  })

  it('formata maiúsculas para cidades não cadastradas sem inventar acentos', () => {
    expect(formatCityName('rio de janeiro')).toBe('Rio de Janeiro')
    expect(formatCityName('  nova   lima  ')).toBe('Nova Lima')
    expect(formatCityName('')).toBe('')
  })
})
