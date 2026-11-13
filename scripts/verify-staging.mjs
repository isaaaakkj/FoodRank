import process from 'node:process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { verifyBackend } from './verify-backend.mjs'

const PRODUCTION_HOST = 'zebsdeoxhwtefoibyjyq.supabase.co'

export function stagingConfiguration(env) {
  if (!env.FOODRANK_TEST_SUPABASE_URL || !env.FOODRANK_TEST_PUBLIC_KEY) {
    throw new Error('Configure a URL e a chave pública do projeto de teste em .env.test.local')
  }
  const target = new URL(env.FOODRANK_TEST_SUPABASE_URL)
  if (target.hostname === PRODUCTION_HOST || !/^[a-z]{20}\.supabase\.co$/.test(target.hostname) || target.protocol !== 'https:') {
    throw new Error('O teste exige um projeto Supabase separado; produção é bloqueada')
  }
  return {
    url: target.origin,
    key: env.FOODRANK_TEST_PUBLIC_KEY,
    origin: env.FOODRANK_APP_ORIGIN ?? 'https://isaaaakkj.github.io',
    cities: JSON.parse(env.FOODRANK_SMOKE_CITIES_JSON ?? '[]'),
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = { checkedAt: new Date().toISOString(), environment: 'staging', status: 'not_run' }
  try {
    // Never load the production .env or fall back to VITE_* values.
    if (existsSync('.env.test.local')) process.loadEnvFile('.env.test.local')
    const config = stagingConfiguration(process.env)
    report.status = 'running'
    await verifyBackend(config)
    report.status = 'passed'
    report.checks = ['municipality_contract', 'distinct_cities', 'cors', 'cache_reuse']
    console.log('Integração em Supabase de teste aprovada. Produção não foi consultada.')
  } catch {
    const notRun = report.status === 'not_run'
    report.status = notRun ? 'not_run' : 'failed'
    console.error(notRun
      ? 'Validação não executada: confira a configuração do projeto de teste separado.'
      : 'Validação de teste falhou. A publicação permanece pendente; confira configuração, logs e cobertura do provedor.')
    process.exitCode = 1
  } finally {
    mkdirSync('artifacts', { recursive: true })
    writeFileSync('artifacts/staging-validation.json', JSON.stringify(report, null, 2))
  }
}
