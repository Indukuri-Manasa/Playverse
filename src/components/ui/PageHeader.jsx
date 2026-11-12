import Icon from './Icon'

export default function PageHeader({ icon, eyebrow, title, subtitle, children }) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <span className="eyebrow">{icon && <Icon name={icon} size={14} />} {eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </header>
  )
}
