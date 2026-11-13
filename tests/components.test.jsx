import { it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Home from '../src/pages/Home'
import { getRestaurants } from '../src/services/restaurants'

vi.mock('../src/services/restaurants', () => ({ getRestaurants: vi.fn() }))
const cafe = { id: 'cafe', name: 'Café São João', category: 'Café', city: 'São Paulo', state: 'São Paulo', location: 'Sé' }
function renderHome() {
  return render(<MemoryRouter><Routes><Route path="/" element={<Home />} /><Route path="/restaurant/:id" element={<p>Detalhes abertos</p>} /></Routes></MemoryRouter>)
}
async function selectCity(user) {
  await user.selectOptions(screen.getByLabelText('Estado'), 'São Paulo')
  await user.type(screen.getByLabelText('Cidade'), 'São Paulo')
  await user.click(screen.getByRole('button', { name: 'Buscar', exact: true }))
}
it('atualiza resultados ao digitar, combina categorias e navega para detalhes', async () => {
  getRestaurants.mockResolvedValue([cafe, { ...cafe, id: 'pizza', name: 'Cantina', category: 'Pizza' }])
  const user = userEvent.setup()
  renderHome()
  await selectCity(user)
  await screen.findByRole('heading', { name: cafe.name })
  const search = screen.getByRole('searchbox')
  await user.type(search, 'CAFE SAO')
  expect(screen.queryByRole('heading', { name: 'Cantina' })).not.toBeInTheDocument()
  expect(screen.getByRole('heading', { name: cafe.name })).toBeVisible()
  await user.click(screen.getByRole('button', { name: /Pizzaria/ }))
  expect(screen.getByText('Nenhum restaurante encontrado')).toBeVisible()
  await user.click(screen.getByRole('button', { name: /Cafés/ }))
  await user.click(screen.getByRole('button', { name: /Ver restaurante/ }))
  expect(screen.getByText('Detalhes abertos')).toBeVisible()
  expect(getRestaurants).toHaveBeenCalledTimes(1)
})
it('apresenta carregamento, erro e nova tentativa', async () => {
  let reject
  getRestaurants.mockImplementationOnce(() => new Promise((_, fail) => { reject = fail }))
  const user = userEvent.setup()
  renderHome()
  await user.type(screen.getByRole('searchbox'), 'cafe')
  await selectCity(user)
  expect(screen.getByText('Procurando restaurantes...')).toBeVisible()
  expect(screen.queryByText(/Encontramos 0 restaurantes/)).not.toBeInTheDocument()
  reject(new Error('offline'))
  await screen.findByRole('alert')
  expect(screen.queryByText(/Encontramos 0 restaurantes/)).not.toBeInTheDocument()
  getRestaurants.mockResolvedValueOnce([cafe])
  await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
  await screen.findByRole('heading', { name: cafe.name })
})
it('oculta resultados de consulta antiga ao editar município', async () => {
  getRestaurants.mockResolvedValue([cafe])
  const user = userEvent.setup()
  renderHome()
  await selectCity(user)
  await screen.findByRole('heading', { name: cafe.name })
  await user.type(screen.getByLabelText('Cidade'), 'x')
  await waitFor(() => expect(screen.queryByRole('heading', { name: cafe.name })).not.toBeInTheDocument())
})
it('explica a atualização pendente quando o backend não confirma municípios', async () => {
  getRestaurants.mockRejectedValueOnce(Object.assign(new Error('legacy'), { code: 'MUNICIPALITY_VERIFICATION_REQUIRED' }))
  const user = userEvent.setup()
  renderHome()
  await selectCity(user)
  expect(await screen.findByText(/Não exibimos restaurantes sem confirmação de município/)).toBeVisible()
  expect(screen.queryByRole('button', { name: /Ver restaurante/ })).not.toBeInTheDocument()
})
