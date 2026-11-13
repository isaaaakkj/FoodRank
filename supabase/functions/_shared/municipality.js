export function normalize(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase().replace(/\s+/g, ' ')
}

const states = 'AC:Acre|AL:Alagoas|AP:Amapá|AM:Amazonas|BA:Bahia|CE:Ceará|DF:Distrito Federal|ES:Espírito Santo|GO:Goiás|MA:Maranhão|MT:Mato Grosso|MS:Mato Grosso do Sul|MG:Minas Gerais|PA:Pará|PB:Paraíba|PR:Paraná|PE:Pernambuco|PI:Piauí|RJ:Rio de Janeiro|RN:Rio Grande do Norte|RS:Rio Grande do Sul|RO:Rondônia|RR:Roraima|SC:Santa Catarina|SP:São Paulo|SE:Sergipe|TO:Tocantins'.split('|').map(value => value.split(':'))

export function normalizeState(value) {
  const text = normalize(value).replace(/^br-/, '')
  return states.find(([uf, name]) => normalize(uf) === text || normalize(name) === text)?.[0] ?? text
}

export function municipalityKey(city, state) {
  return JSON.stringify(['municipality-v3', normalize(city), normalizeState(state), 'BR'])
}

export function confirmedRestaurants(items, city, state) {
  const seen = new Set()
  return items.filter(item => {
    if (!item || item.id == null || typeof item.name !== 'string' || !item.name.trim()) return false
    if (normalize(item.city) !== normalize(city) || normalizeState(item.state) !== normalizeState(state)) return false
    if (item.municipalityVerification !== 'boundary' && item.municipalityVerification !== 'address') return false
    const id = String(item.id)
    const position = Number.isFinite(item.latitude) && Number.isFinite(item.longitude)
      ? `${normalize(item.name)}:${item.latitude.toFixed(5)}:${item.longitude.toFixed(5)}` : `id:${id}`
    if (seen.has(id) || seen.has(position)) return false
    seen.add(id)
    seen.add(position)
    return true
  })
}
