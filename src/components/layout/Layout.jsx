import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import AmbientBackground from './AmbientBackground'
import Navbar from './Navbar'
import { NAV_LINKS } from '../../data/navigation'
import Logo from './Logo'

export default function Layout() {
  const { pathname, hash } = useLocation()

  // Start each page at the top (unless jumping to an anchor).
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <>
      <AmbientBackground />
      <Navbar />
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container footer-inner">
          <Link to="/" className="brand brand-sm">
            <Logo size={26} />
            <span className="brand-name">Play<span>Verse</span></span>
          </Link>
          <nav className="footer-links" aria-label="Footer">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to}>{l.label}</Link>
            ))}
          </nav>
          <p className="footer-note">Progress and scores are saved on this device only.</p>
        </div>
      </footer>
    </>
  )
}
