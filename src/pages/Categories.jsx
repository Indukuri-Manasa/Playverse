import GameRow from '../components/games/GameRow'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import { categories } from '../data/categories'
import { games } from '../data/games'
import { useActivity } from '../hooks/useActivity'
import { plural } from '../utils/format'

export default function Categories() {
  const { activity } = useActivity()
  return (
    <div className="container page">
      <PageHeader icon="grid" eyebrow="Categories" title="Play by mood" subtitle="Every game, grouped by the kind of challenge it brings." />
      <div className="category-sections">
        {categories.map((c) => {
          const list = games.filter((g) => g.categories.includes(c.id))
          return (
            <section key={c.id} id={c.id} className="panel category-section" style={{ '--accent': c.color }}>
              <div className="category-section-head">
                <span className="category-icon"><Icon name={c.icon} size={26} /></span>
                <div>
                  <h2>{c.title}</h2>
                  <p>{c.description}</p>
                </div>
                <Button to={`/explore?category=${c.id}`} variant="ghost" size="sm">
                  Browse {list.length} <Icon name="arrowRight" size={14} />
                </Button>
              </div>
              <div className="row-list row-list-grid">
                {list.map((g) => (
                  <GameRow key={g.id} game={g} sub={`${g.difficulty} · ${g.duration}`} meta={plural(activity.sessions[g.id] ?? 0, 'play')} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
