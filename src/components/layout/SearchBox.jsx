import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../ui/Icon'
import { getCategory } from '../../data/categories'
import { matchGames } from '../../utils/search'

export default function SearchBox({ onNavigate }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const results = useMemo(() => (query.trim() ? matchGames(query) : []), [query])

  // "/" or ⌘K / Ctrl+K focuses search (ignored while typing in another field).
  useEffect(() => {
    function onKey(e) {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function go(path) {
    setQuery('')
    setOpen(false)
    inputRef.current?.blur()
    navigate(path)
    onNavigate?.()
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[active]) go(`/play/${results[active].id}`)
      else if (query.trim()) go(`/explore?q=${encodeURIComponent(query.trim())}`)
    } else if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div className="search">
      <Icon name="search" size={17} className="search-icon" />
      <input
        ref={inputRef}
        type="search"
        placeholder="Search games…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setActive(0)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        aria-label="Search games"
        aria-expanded={open && Boolean(query.trim())}
        aria-controls="search-results"
        role="combobox"
      />
      <kbd className="search-kbd">/</kbd>
      {open && query.trim() && (
        <div className="search-results" id="search-results" role="listbox">
          {results.length === 0 && <div className="search-empty">No games match “{query}”.</div>}
          {results.map((g, i) => (
            <button
              key={g.id}
              role="option"
              aria-selected={i === active}
              className={`search-result ${i === active ? 'active' : ''}`}
              style={{ '--accent': g.color }}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(`/play/${g.id}`)}
            >
              <span className="search-result-icon">{g.icon}</span>
              <span className="search-result-text">
                <strong>{g.title}</strong>
                <small>{g.categories.map((c) => getCategory(c)?.short).join(' · ')} · {g.difficulty}</small>
              </span>
              <Icon name="arrowRight" size={16} />
            </button>
          ))}
          {query.trim() && (
            <button
              className="search-all"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => go(`/explore?q=${encodeURIComponent(query.trim())}`)}
            >
              See all results in Explore
            </button>
          )}
        </div>
      )}
    </div>
  )
}
