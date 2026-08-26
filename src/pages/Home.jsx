import Header from '../components/Header'
import Hero from '../components/Hero'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f3eb]">

      <Header />

      <main className="px-4 pb-16 lg:px-6">

        <Hero />

        {/* Próximas seções serão adicionadas aqui */}
        <section className="mx-auto max-w-[1440px] py-16">
          <div className="rounded-2xl border border-dashed border-[#cfc2ae] p-10 text-center">
            <p className="font-display text-2xl text-[#28351f]">
              Restaurantes em destaque
            </p>

            <p className="mt-2 text-sm text-[#6d6a61]">
              Os cards de restaurantes serão adicionados na próxima etapa.
            </p>
          </div>
        </section>

      </main>

    </div>
  )
}