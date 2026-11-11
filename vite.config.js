import { defineConfig, loadEnv } from 'vite'
import { Buffer } from 'node:buffer'
import process from 'node:process'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  for (const value of Object.values(env)) {
    let privateKey = value.includes('sb_secret_') || value.includes('PRIVATE KEY')
    if (value.startsWith('eyJ')) {
      try {
        privateKey ||= JSON.parse(Buffer.from(value.split('.')[1], 'base64url').toString()).role === 'service_role'
      } catch { /* Other public values are validated by their consumer. */ }
    }
    if (privateKey) throw new Error('Chave privada detectada nas variáveis VITE_. Remova-a e faça a rotação antes de gerar o build.')
  }
  return {
  plugins: [
    react(),
    tailwindcss(),

  ],
  base: '/FoodRank/',
  }
})
