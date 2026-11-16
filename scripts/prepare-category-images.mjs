import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { categoryPhotos } from './categoryPhotoSources.mjs'

const destination = join(process.cwd(), 'public', 'category-images')
await mkdir(destination, { recursive: true })

async function fileIsJpeg(path) {
  try {
    const file = await readFile(path)
    return file.length > 2500 && file[0] === 0xff && file[1] === 0xd8 && file[file.length - 2] === 0xff && file[file.length - 1] === 0xd9
  } catch {
    return false
  }
}

async function downloadCategory(name, id) {
  const file = join(destination, `${name}.jpg`)
  if (await fileIsJpeg(file)) return

  const url = `https://images.unsplash.com/${id}?fit=crop&crop=entropy&w=1000&h=650&q=76&fm=jpg`
  let lastError
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'FoodRank/1.0 (site educacional; imagens ilustrativas)' },
        signal: AbortSignal.timeout(30000),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      if (!response.headers.get('content-type')?.toLowerCase().startsWith('image/jpeg')) {
        throw new Error('O servidor não retornou uma imagem JPEG.')
      }
      const buffer = Buffer.from(await response.arrayBuffer())
      if (buffer.length < 2500 || buffer[0] !== 0xff || buffer[1] !== 0xd8 ||
          buffer[buffer.length - 2] !== 0xff || buffer[buffer.length - 1] !== 0xd9) {
        throw new Error('Fotografia incompleta ou inválida.')
      }
      await writeFile(file, buffer)
      console.log(`Imagem preparada: ${name}.jpg (${Math.round(buffer.length / 1024)} KB)`)
      return
    } catch (error) {
      lastError = error
    }
  }
  throw new Error(`Não foi possível preparar a foto da categoria "${name}": ${lastError.message}`)
}

// Limita conexões simultâneas ao servidor de imagens.
const entries = Object.entries(categoryPhotos)
const failures = []
for (let i = 0; i < entries.length; i += 3) {
  const batch = await Promise.allSettled(entries.slice(i, i + 3).map(([name, id]) => downloadCategory(name, id)))
  batch.forEach((result) => {
    if (result.status === 'rejected') failures.push(result.reason.message)
  })
}
if (failures.length) {
  failures.forEach(message => console.error(message))
  console.error('A compilação foi interrompida para evitar imagens ausentes. Confirme as fontes e tente novamente.')
  process.exitCode = 1
}
