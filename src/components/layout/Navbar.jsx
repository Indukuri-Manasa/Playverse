import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Icon from '../ui/Icon'
import Logo from './Logo'
import SearchBox from './SearchBox'
import { useActivity } from '../../hooks/useActivity'
import { NAV_LINKS } from '../../data/navigation'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { activity } = useActivity()
  const close = () => setMenuOpen(false)
  const initial = activity.playerName.trim().charAt(0).toUpperCase() || 'P'

  return (
    <header className={`navbar ${menuOpen ? 'menu-open' : ''}`}>
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          <Logo />
          <span className="brand-name">
            Play<span>Verse</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="nav-link" onClick={close}>
              <Icon name={l.icon} size={17} />
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="nav-right">
          <SearchBox onNavigate={close} />
          <Link to="/profile" className="nav-avatar" title={activity.playerName} onClick={close}>
            {initial}
          </Link>
          <button
            className="nav-toggle"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>
    </header>
  )
}
