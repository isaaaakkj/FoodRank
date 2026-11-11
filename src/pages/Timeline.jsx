import { Link } from 'react-router-dom'
import TimelineSection from '../components/TimelineSection'
export default function Timeline() {
  return <main className="px-4"><Link to="/" className="my-6 inline-block underline">Voltar para explorar</Link><p>Conteúdo ilustrativo do MVP. Estas avaliações não foram enviadas por visitantes.</p><TimelineSection /></main>
}
