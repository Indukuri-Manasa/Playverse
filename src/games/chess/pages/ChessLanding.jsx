import { useEffect, useRef } from 'react'
import GameArt from '../../../components/art/GameArt'
import Button from '../../../components/ui/Button'
import Icon from '../../../components/ui/Icon'
import SectionHeader from '../../../components/ui/SectionHeader'
import { StatTile } from '../../../components/home/StatsPanel'
import { DifficultyMeter } from '../../../components/games/GameCard'
import { accentVars, getGame } from '../../../data/games'
import { getCategory } from '../../../data/categories'
import { useActivity } from '../../../hooks/useActivity'
import { timeAgo } from '../../../utils/format'
import ModeCard from '../components/ModeCard'
import { ComputerArt, FriendArt, OnlineArt } from '../art/ChessArt'
import { useChessStats } from '../hooks/useChessStats'
import { AI_LEVELS, MODES, REASON_LABEL } from '../services/chessStatsService'

// `to` is set once a mode is playable; until then the card shows which phase delivers it.
const MODE_CARDS = [
  {
    id: 'local', title: 'Friend vs Friend', tag: 'Local · 2 players', icon: 'users', art: FriendArt,
    color: '#b26bff', color2: '#ff4fb8', to: '/play/chess/local',
    description: 'Two players, one screen. Pass the device and battle it out move by move.',
    features: ['Shared board with auto turn switching', 'Optional chess clock', 'Undo, resign and instant rematch'],
  },
  {
    id: 'computer', title: 'Computer vs You', tag: 'Stockfish engine', icon: 'cpu', art: ComputerArt,
    color: '#2ee6ff', color2: '#4d7cff', onAccent: '#031321', to: '/play/chess/computer',
    description: 'Challenge a real chess engine across five levels, from Beginner to Expert.',
    features: ['5 difficulty levels', 'Play as White or Black', 'Move hints and practice undo'],
  },
  {
    id: 'online', title: 'Online Match', tag: 'Real-time · Room codes', icon: 'globe', art: OnlineArt,
    color: '#ff4fb8', color2: '#ff9f43', to: '/play/chess/online',
    description: 'Create a room, share the 6-character code, and play a friend on any device.',
    features: ['Live move sync via Socket.IO', 'Server-validated moves', 'Reconnect and rematch support'],
  },
]

const LEARN = [
  { icon: 'book', title: 'Learn Chess', text: 'How every piece moves, captures, special moves, checkmate and draws — with interactive lessons.' },
  { icon: 'chess', title: 'Chess Strategies', text: 'Control the center, develop pieces, castle, spot forks, pins and skewers, and win endgames.' },
  { icon: 'scroll', title: 'Game Rules', text: 'Castling, en passant, promotion, repetition, the fifty-move rule and insufficient material.' },
]

const RESULT_LABEL = { win: 'Win', loss: 'Loss', draw: 'Draw', white: 'White won', black: 'Black won' }

export default function ChessLanding() {
  const game = getGame('chess')
  const { summary } = useChessStats()
  const { recordSession } = useActivity()

  const counted = useRef(false)
  useEffect(() => {
    if (counted.current) return
    counted.current = true
    recordSession('chess')
  }, [recordSession])

  return (
    <div className="container page chess-page" style={accentVars(game)}>
      <div className="game-topbar">
        <Button to="/" variant="ghost" size="sm"><Icon name="arrowLeft" size={16} /> All games</Button>
      </div>

      <header className="chess-hero">
        <div className="chess-hero-copy">
          <div className="chips">
            {game.categories.map((c) => (
              <span key={c} className="chip chip-glass"><Icon name={getCategory(c).icon} size={13} /> {getCategory(c).short}</span>
            ))}
            <DifficultyMeter difficulty={game.difficulty} />
          </div>
          <h1 className="chess-title">Chess <span>Battle</span></h1>
          <p className="chess-tagline">Think Ahead. Make Your Move. <strong>Claim Victory.</strong></p>
          <dl className="chess-quick">
            <div><dt>Games</dt><dd>{summary.total}</dd></div>
            <div><dt>Win rate</dt><dd>{summary.winPct}%</dd></div>
            <div><dt>Best streak</dt><dd>{summary.bestStreak}</dd></div>
          </dl>
        </div>
        <div className="chess-hero-art"><GameArt id="chess" /></div>
      </header>

      <section>
        <SectionHeader icon="sparkle" eyebrow="Pick a mode" title="Choose your battle" link="/play/chess/analysis" linkLabel="Open analysis board" />
        <div className="mode-grid">
          {MODE_CARDS.map((m) => <ModeCard key={m.id} mode={m} />)}
        </div>
      </section>

      <section>
        <SectionHeader icon="book" eyebrow="Get better" title="Learn & improve" />
        <div className="learn-grid">
          {LEARN.map((l) => (
            <div key={l.title} className="learn-tile is-upcoming">
              <span className="learn-icon"><Icon name={l.icon} size={22} /></span>
              <div>
                <h3>{l.title}</h3>
                <p>{l.text}</p>
              </div>
              <span className="soon-badge"><Icon name="clock" size={13} /> Phase 6</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <SectionHeader icon="chart" eyebrow="Across all modes" title="Personal Statistics" />
        <div className="chess-insights">
          <div>
            <div className="stat-grid chess-stats">
              <StatTile icon="gamepad" label="Games played" value={summary.total} color="#2ee6ff" />
              <StatTile icon="trophy" label="Wins" value={summary.wins} color="#5dff9d" />
              <StatTile icon="close" label="Losses" value={summary.losses} color="#ff4fb8" />
              <StatTile icon="refresh" label="Draws" value={summary.draws} color="#ffc94d" />
              <StatTile icon="flame" label="Best streak" value={summary.bestStreak} color="#ff7a45" />
              <StatTile icon="star" label="Favorite mode" value={summary.favoriteMode ? MODES[summary.favoriteMode].short : '—'} color="#b26bff" />
            </div>
            <p className="muted small-note">Wins, losses and streaks count Computer and Online games; Friend games count toward total played.</p>
          </div>
          <div>
            <h4 className="ai-title"><Icon name="cpu" size={15} /> AI difficulty records</h4>
            <div className="ai-table" role="table" aria-label="Results by AI difficulty">
              <div role="row" className="ai-row ai-head"><span>Level</span><span>W</span><span>D</span><span>L</span></div>
              {AI_LEVELS.map((lvl) => {
                const r = summary.ai[lvl.id]
                return (
                  <div role="row" key={lvl.id} className="ai-row">
                    <span>{lvl.label}</span><span className="c-win">{r.win}</span><span className="c-draw">{r.draw}</span><span className="c-loss">{r.loss}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <SectionHeader icon="history" eyebrow="Your games" title="Recent Matches" />
        {summary.recent.length ? (
          <ul className="match-list">
            {summary.recent.map((m) => (
              <li key={m.id} className={`match match-${m.result}`}>
                <span className="match-result">{RESULT_LABEL[m.result] ?? '—'}</span>
                <span className="match-text">
                  <strong>{MODES[m.mode]?.label}{m.difficulty ? ` · ${m.difficulty}` : ''}</strong>
                  <small>{m.players ? `${m.players.w} vs ${m.players.b} · ` : ''}{REASON_LABEL[m.reason] ?? m.reason} · {m.moves} moves · {timeAgo(m.at)}</small>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty">
            <Icon name="chess" size={30} />
            <p>No chess matches yet. Finished games from every mode will be listed here.</p>
          </div>
        )}
      </section>
    </div>
  )
}
