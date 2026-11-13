import { test, expect } from '@playwright/test'

test('busca no celular, filtros e detalhes sem serviços externos', async ({ page }) => {
  await page.route('**/src/services/reviews.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: `export async function getApprovedReviews() { return [] }
      export async function getRestaurantReviews() { return [] }
      export async function submitReview() { throw new Error('Envio não esperado neste teste') }`,
  }))
  // Mock the service module, including when no public Supabase key is configured.
  await page.route('**/src/services/restaurants.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: `export async function getRestaurants() { return [{ id: 'cafe', name: 'Café São João', category: 'Café', city: 'São Paulo', state: 'São Paulo', location: 'Sé' }] }`,
  }))
  await page.goto('./')
  await page.getByLabel('Estado', { exact: true }).selectOption('São Paulo')
  await page.getByLabel('Cidade', { exact: true }).fill('São Paulo')
  await page.getByRole('button', { name: 'Buscar', exact: true }).click()
  await page.getByRole('searchbox').fill('CAFE SAO')
  await expect(page.getByRole('heading', { name: 'Café São João' })).toBeVisible()
  await expect(page.getByLabel('Restaurante', { exact: true })).toBeEnabled()
  await expect(page.getByLabel('Restaurante', { exact: true }).getByRole('option', { name: 'Café São João' })).toHaveCount(1)
  await page.getByRole('button', { name: /Pizzaria/ }).click()
  await expect(page.getByText('Nenhum restaurante encontrado')).toBeVisible()
  await page.getByRole('button', { name: /Cafés/ }).click()
  await page.getByRole('button', { name: /Ver restaurante/ }).click()
  await expect(page).toHaveURL(/restaurant\/cafe/)
  await expect(page.getByRole('heading', { name: 'Café São João' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Café São João' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
