import { test, expect } from '@playwright/test'

test('busca no celular, filtros, escolha de filial e detalhes sem serviços externos', async ({ page }) => {
  await page.route('**/src/services/reviews.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: `export async function getApprovedReviews() { return [] }
      export async function getRestaurantReviews() { return [] }
      export async function submitReview() { throw new Error('Envio não esperado neste teste') }`,
  }))
  // Mock dos serviços para testar a interface sem depender do Supabase.
  await page.route('**/src/services/restaurants.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: `export async function getRestaurants() { return [
      { id: 'cafe', name: 'Café São João', category: 'Café', city: 'São Paulo', state: 'São Paulo', location: 'Sé', latitude: -23.5505, longitude: -46.6333 },
      { id: 'cafe-outra-filial', name: 'Café São João', category: 'Café', city: 'São Paulo', state: 'São Paulo', location: 'Pinheiros', latitude: -23.565, longitude: -46.692 }
    ] }`,
  }))
  await page.goto('./')
  await page.getByLabel('Estado', { exact: true }).selectOption('São Paulo')
  await page.getByLabel('Cidade', { exact: true }).fill('São Paulo')
  await page.getByRole('button', { name: 'Buscar', exact: true }).click()

  await page.getByRole('searchbox', { name: /Filtrar restaurantes/i }).fill('CAFE SAO')
  await expect(page.getByRole('heading', { name: 'Café São João' }).first()).toBeVisible()

  const restaurantSearch = page.getByRole('combobox', { name: 'Restaurante e unidade' })
  await expect(restaurantSearch).toBeEnabled()
  await restaurantSearch.fill('cafe sao')
  const options = page.getByRole('listbox', { name: 'Filiais encontradas' })
  await expect(options.getByRole('option')).toHaveCount(2)
  await expect(options.getByRole('option').filter({ hasText: 'Sé' })).toBeVisible()
  await expect(options.getByRole('option').filter({ hasText: 'Pinheiros' })).toBeVisible()
  await options.getByRole('option').filter({ hasText: 'Pinheiros' }).getByRole('button').click()
  await expect(page.getByText('Unidade selecionada: Café São João')).toBeVisible()
  await expect(page.getByText(/Pinheiros · São Paulo, São Paulo/)).toBeVisible()

  await page.getByRole('button', { name: /Pizzaria/ }).click()
  await expect(page.getByText('Nenhum restaurante encontrado')).toBeVisible()
  await page.getByRole('button', { name: /Cafés/ }).click()
  await page.getByRole('button', { name: /Ver restaurante/ }).first().click()
  await expect(page).toHaveURL(/restaurant\/cafe/)
  await expect(page.getByRole('heading', { name: 'Café São João' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Café São João' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
