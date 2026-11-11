import { readFileSync, existsSync } from 'node:fs'
import assert from 'node:assert/strict'
const html = readFileSync('dist/index.html', 'utf8')
assert(!html.includes('/src/main.jsx'), 'O artefato não pode carregar JSX fonte')
const paths = [...html.matchAll(/(?:src|href)="(\/[^"]+)"/g)].map(match => match[1])
assert(paths.some(path => path.endsWith('.js')), 'Bundle JS ausente')
for (const path of paths) {
  assert(path.startsWith('/FoodRank/'), 'Base incorreta no artefato')
  assert(existsSync('dist/' + path.slice('/FoodRank/'.length)), 'Asset inexistente')
}
console.log('Artefato válido: assets locais existem sob /FoodRank/.')
