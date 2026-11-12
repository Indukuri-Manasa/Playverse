import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { games } from '../data/games'

// Returns a function that jumps to a random game (avoiding `excludeId` when possible).
export function useRandomGame() {
  const navigate = useNavigate()
  return useCallback(
    (excludeId) => {
      const pool = games.length > 1 ? games.filter((g) => g.id !== excludeId) : games
      navigate(`/play/${pool[Math.floor(Math.random() * pool.length)].id}`)
    },
    [navigate],
  )
}
