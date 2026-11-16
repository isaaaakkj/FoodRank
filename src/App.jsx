import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './auth/AuthContext'
import { FavoritesProvider } from './favorites/FavoritesProvider'

function App() {
  return <AuthProvider><FavoritesProvider><AppRoutes /></FavoritesProvider></AuthProvider>
}
export default App
