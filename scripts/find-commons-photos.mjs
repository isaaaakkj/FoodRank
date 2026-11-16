// Pesquisa SOMENTE candidatos do Wikimedia Commons. Nenhuma foto é aprovada automaticamente.
// Usage: node scripts/find-commons-photos.mjs -23.55 -46.63 "Nome do restaurante"
const [latitudeInput, longitudeInput, ...nameParts] = process.argv.slice(2)
const latitude = Number(latitudeInput)
const longitude = Number(longitudeInput)
const name = nameParts.join(' ').trim()

if (!latitudeInput || !longitudeInput || !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 || Math.abs(longitude) > 180 || !name) {
  console.error('Uso: node scripts/find-commons-photos.mjs LATITUDE LONGITUDE "Nome do restaurante"')
  process.exitCode = 1
} else {
  const url = new URL('https://commons.wikimedia.org/w/api.php')
  url.search = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'geosearch',
    ggsprimary: 'all',
    ggsnamespace: '6',
    ggsradius: '100',
    ggslimit: '20',
    ggscoord: `${latitude}|${longitude}`,
    prop: 'imageinfo',
    iiprop: 'url|mime|extmetadata',
    iiurlwidth: '800',
  }).toString()

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'FoodRankSchoolProject/1.0 (curadoria de fotos Wikimedia Commons)' },
      signal: AbortSignal.timeout(12000),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    const results = Object.values(data.query?.pages ?? {}).map(page => {
      const image = page.imageinfo?.[0]
      const meta = image?.extmetadata ?? {}
      return {
        candidateFor: name,
        title: page.title,
        filePage: image?.descriptionurl,
        imageUrl: image?.thumburl || image?.url,
        mime: image?.mime,
        authorMetadata: meta.Artist?.value ?? null,
        license: meta.LicenseShortName?.value ?? null,
        licenseUrl: meta.LicenseUrl?.value ?? null,
        usageTerms: meta.UsageTerms?.value ?? null,
      }
    }).filter(item => item.imageUrl && item.mime?.startsWith('image/'))

    console.log(JSON.stringify({
      searchedRestaurant: name,
      latitude,
      longitude,
      warning: 'FOTOS CANDIDATAS, NÃO VERIFICADAS. Coordenadas próximas não provam que a foto pertence ao restaurante. Confira imagem, nome, endereço, autoria e licença manualmente.',
      results,
    }, null, 2))
  } catch (error) {
    console.error('Falha ao consultar Wikimedia Commons:', error.message)
    process.exitCode = 1
  }
}
