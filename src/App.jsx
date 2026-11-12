import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Categories from './pages/Categories'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import GamePage from './pages/GamePage'
import NotFound from './pages/NotFound'

// Chess Battle is code-split: its engine/socket code never loads unless you open it.
const ChessRoutes = lazy(() => import('./games/chess/ChessRoutes'))

const loading = (
  <div className="container page">
    <div className="route-loading"><span className="spinner" /> Loading…</div>
  </div>
)

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="categories" element={<Categories />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="profile" element={<Profile />} />
        <Route
          path="play/chess/*"
          element={<Suspense fallback={loading}><ChessRoutes /></Suspense>}
        />
        <Route path="play/:gameId" element={<GamePage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
