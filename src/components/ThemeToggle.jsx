import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const STORAGE_KEY = 'foodrank:theme'

export default function ThemeToggle({ floating = false }) {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
  const isDark = theme === 'dark'

  function toggleTheme() {
    const nextTheme = isDark ? 'light' : 'dark'
    document.documentElement.dataset.theme = nextTheme
    document.documentElement.style.colorScheme = nextTheme
    setTheme(nextTheme)
    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme)
    } catch {
      // A escolha continua ativa mesmo que o navegador bloqueie o armazenamento.
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      aria-pressed={isDark}
      title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      className={`theme-toggle inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${floating ? 'fixed bottom-5 right-5 z-[1000] shadow-lg' : ''}`}
    >
      {isDark ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
    </button>
  )
}
