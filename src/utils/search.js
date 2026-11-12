import { games } from '../data/games'
import { getCategory } from '../data/categories'

export function matchGames(query) {
  const q = query.trim().toLowerCase()
  if (!q) return games
  return games.filter((g) =>
    [g.title, g.tagline, g.difficulty, ...g.categories.map((c) => getCategory(c)?.title ?? c)]
      .join(' ')
      .toLowerCase()
      .includes(q),
  )
}
