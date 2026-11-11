const categories = [
    { name: 'Todos', icon: '✦' },
    { name: 'Brasileira', icon: '🍽' },
    { name: 'Italiana', icon: '🍝' },
    { name: 'Japonesa', icon: '🍣' },
    { name: 'Hambúrguer', icon: '🍔' },
    { name: 'Cafés', icon: '☕' },
    { name: 'Pizzaria', icon: '🍕' },
    { name: 'Vegetariana', icon: '🥗' },
  ]
  
  export default function CategoryList({ selectedCategory, onCategoryChange }) {
    return (
      <section className="mx-auto max-w-[1440px] pt-10">
  
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a88b54]">
              Explore
            </p>
  
            <h2 className="mt-1 font-display text-2xl font-semibold text-[#28351f]">
              Encontre seu próximo sabor
            </h2>
          </div>
  
          <button onClick={() => onCategoryChange('Todos')} className="hidden text-sm font-semibold text-[#604936] transition hover:text-[#28351f] sm:block">
            Ver todas
          </button>
        </div>
  
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.name
  
            return (
              <button
                aria-pressed={isSelected}
                key={category.name}
                onClick={() => onCategoryChange(category.name)}
                className={`flex min-w-fit items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition ${
                  isSelected
                    ? 'border-[#28351f] bg-[#28351f] text-[#f7f3eb]'
                    : 'border-[#d8cbb7] bg-[#faf8f3] text-[#604936] hover:border-[#28351f] hover:text-[#28351f]'
                }`}
              >
                <span className="text-base">
                  {category.icon}
                </span>
  
                {category.name}
              </button>
            )
          })}
        </div>
  
      </section>
    )
  }