import { Link } from 'react-router-dom'
import Icon from './Icon'

export default function SectionHeader({ icon, eyebrow, title, link, linkLabel = 'View all', id }) {
  return (
    <div className="section-header" id={id}>
      <div>
        {eyebrow && (
          <span className="eyebrow">
            {icon && <Icon name={icon} size={14} />} {eyebrow}
          </span>
        )}
        <h2>{title}</h2>
      </div>
      {link && (
        <Link to={link} className="section-link">
          {linkLabel} <Icon name="arrowRight" size={16} />
        </Link>
      )}
    </div>
  )
}
