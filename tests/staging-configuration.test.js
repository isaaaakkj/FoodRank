// @vitest-environment node
import { expect, it } from 'vitest'
import { stagingConfiguration } from '../scripts/verify-staging.mjs'

it('impede que a validação de homologação use produção ou configuração ausente', () => {
  expect(() => stagingConfiguration({})).toThrow('projeto de teste')
  expect(() => stagingConfiguration({
    FOODRANK_TEST_SUPABASE_URL: 'https://zebsdeoxhwtefoibyjyq.supabase.co', FOODRANK_TEST_PUBLIC_KEY: 'sb_publishable_test',
  })).toThrow('produção é bloqueada')
  expect(() => stagingConfiguration({ VITE_SUPABASE_URL: 'https://zebsdeoxhwtefoibyjyq.supabase.co', VITE_SUPABASE_ANON_KEY: 'public' })).toThrow()
})
it('aceita apenas configuração explícita de um projeto separado', () => {
  expect(stagingConfiguration({
    FOODRANK_TEST_SUPABASE_URL: 'https://abcdefghijklmnopqrst.supabase.co', FOODRANK_TEST_PUBLIC_KEY: 'sb_publishable_test',
  })).toMatchObject({ url: 'https://abcdefghijklmnopqrst.supabase.co', key: 'sb_publishable_test' })
})
