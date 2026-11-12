import { useSearchParams } from 'react-router-dom'
import GameCard from '../components/games/GameCard'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import { matchGames } from '../utils/search'
import { categories } from '../data/categories'
import { games } from '../data/games'
import { useScores } from '../hooks/useScores'
import { useActivity } from '../hooks/useActivity'
import { personalBest } from '../utils/stats'

const SORTS = {
  featured: { label: 'Featured', fn: () => 0 },
  played: { label: 'Most played', fn: (a, b, s) => (s[b.id] ?? 0) - (s[a.id] ?? 0) },
  az: { label: 'A–Z', fn: (a, b) => a.title.localeCompare(b.title) },
  difficulty: {
    label: 'Difficulty',
    fn: (a, b) => ['Easy', 'Medium', 'Hard'].indexOf(a.difficulty) - ['Easy', 'Medium', 'Hard'].indexOf(b.difficulty),
  },
}

export default function Explore() {
  const [params, setParams] = useSearchParams()
  const { scores } = useScores()
  const { activity } = useActivity()
  const q = params.get('q') ?? ''
  const category = params.get('category') ?? 'all'
  const sort = SORTS[params.get('sort')] ? params.get('sort') : 'featured'

  function update(key, value, fallback) {
    const next = new URLSearchParams(params)
    if (!value || value === fallback) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const results = matchGames(q)
    .filter((g) => category === 'all' || g.categories.includes(category))
    .sort((a, b) => SORTS[sort].fn(a, b, activity.sessions))

  return (
    <div className="container page">
      <PageHeader icon="compass" eyebrow="Explore" title="Find your next game" subtitle={`${games.length} games across ${categories.length} categories.`} />

      <div className="toolbar panel">
        <label className="field search-field">
          <Icon name="search" size={17} />
          <input
            type="search"
            value={q}
            placeholder="Search by name, category or difficulty"
            onChange={(e) => update('q', e.target.value, '')}
            aria-label="Search games"
          />
        </label>
        <div className="chips" role="group" aria-label="Category">
          <button className={`chip-btn ${category === 'all' ? 'active' : ''}`} onClick={() => update('category', 'all', 'all')}>
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`chip-btn ${category === c.id ? 'active' : ''}`}
              style={{ '--accent': c.color }}
              onClick={() => update('category', c.id, 'all')}
            >
              <Icon name={c.icon} size={14} /> {c.short}
            </button>
          ))}
        </div>
        <label className="field select-field">
          <span>Sort</span>
          <select value={sort} onChange={(e) => update('sort', e.target.value, 'featured')}>
            {Object.entries(SORTS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
          </select>
        </label>
      </div>

      {results.length ? (
        <div className="game-grid">
          {results.map((g) => (
            <GameCard key={g.id} game={g} best={personalBest(g, scores, activity)} />
          ))}
        </div>
      ) : (
        <div className="panel empty empty-lg">
          <Icon name="search" size={34} />
          <h3>No games found</h3>
          <p>Try a different search or category.</p>
          <Button variant="secondary" onClick={() => setParams({}, { replace: true })}>Clear filters</Button>
        </div>
      )}
    </div>
  )
}
