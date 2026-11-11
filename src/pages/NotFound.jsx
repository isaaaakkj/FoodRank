import { Link } from 'react-router-dom'
export default function NotFound() {
  return <main className="mx-auto max-w-xl px-6 py-16"><h1 className="font-display text-3xl">Página não encontrada</h1><Link className="mt-6 inline-block underline" to="/">Voltar para explorar</Link></main>
}
