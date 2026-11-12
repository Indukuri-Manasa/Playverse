import { Link } from 'react-router-dom'
import Icon from '../ui/Icon'
import { games } from '../../data/games'

export default function CategoryCard({ category }) {
  const list = games.filter((g) => g.categories.includes(category.id))
  return (
    <Link to={`/explore?category=${category.id}`} className="category-card" style={{ '--accent': category.color }}>
      <span className="category-icon"><Icon name={category.icon} size={26} /></span>
      <h3>{category.title}</h3>
      <p>{category.description}</p>
      <div className="category-foot">
        <span className="category-games">
          {list.map((g) => (
            <span key={g.id} style={{ '--c': g.color }} title={g.title}>{g.icon}</span>
          ))}
        </span>
        <span className="category-count">
          {list.length} game{list.length === 1 ? '' : 's'} <Icon name="arrowRight" size={14} />
        </span>
      </div>
    </Link>
  )
}
