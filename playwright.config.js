import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://127.0.0.1:4174/FoodRank/', viewport: { width: 375, height: 812 } },
  webServer: { command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4174 --strictPort', url: 'http://127.0.0.1:4174/FoodRank/', reuseExistingServer: false },
})
