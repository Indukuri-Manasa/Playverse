import { Route, Routes } from 'react-router-dom'
import ChessLanding from './pages/ChessLanding'
import AnalysisBoard from './pages/AnalysisBoard'
import LocalChess from './modes/LocalChess'
import NotFound from '../../pages/NotFound'
import './styles/chess.css'

// Chess Battle route tree, mounted at /play/chess/*.
// Mode routes (local / computer / online) and Learn are added in later phases.
// /analysis — free board for both sides (Phase 2).
export default function ChessRoutes() {
  return (
    <Routes>
      <Route index element={<ChessLanding />} />
      <Route path="analysis" element={<AnalysisBoard />} />
      <Route path="local" element={<LocalChess />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
