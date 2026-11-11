import { Link } from 'react-router-dom'
import TimelineSection from '../components/TimelineSection'

export default function Timeline() {
  return (
    <main className="min-h-screen bg-[#f7f3eb] px-4">
      <div className="mx-auto max-w-[1000px] pt-8">
        <Link to="/" className="text-sm font-semibold text-[#604936] underline">
          Voltar para explorar
        </Link>
      </div>
      <TimelineSection showLink={false} />
    </main>
  )
}
