import TicTacToe from '../games/TicTacToe'
import MemoryMatch from '../games/MemoryMatch'
import Snake from '../games/Snake'
import { readChessSummary } from '../games/chess/services/chessStatsService'

// Add a new game: create it in src/games/, then register it here.
// `color` / `color2` drive each game's neon identity across the UI.
export const games = [
  {
    id: 'tic-tac-toe',
    title: 'Tic-Tac-Toe',
    tagline: 'Three in a row. Take on the CPU or a friend on the same screen.',
    icon: '✕◯',
    color: '#b26bff',
    color2: '#ff4fb8',
    categories: ['strategy', 'quick'],
    difficulty: 'Easy',
    duration: '1–2 min',
    players: '1–2 players',
    component: TicTacToe,
    score: null,
    footnote: '2 players or vs CPU',
    howTo: [
      'Pick vs CPU or vs Friend.',
      'X always moves first — click an empty cell.',
      'Line up three marks in a row, column or diagonal.',
      'Block the CPU before it lines up its own three.',
    ],
  },
  {
    id: 'memory',
    title: 'Memory Match',
    tagline: 'Flip cards, find all eight pairs in as few moves as you can.',
    icon: '🃏',
    color: '#2ee6ff',
    color2: '#4d7cff',
    onAccent: '#031321',
    categories: ['puzzle', 'quick'],
    difficulty: 'Medium',
    duration: '2–3 min',
    players: '1 player',
    component: MemoryMatch,
    score: { label: 'Fewest moves', lowerIsBetter: true },
    howTo: [
      'Flip two cards per move.',
      'Matching pairs stay face up.',
      'Mismatches flip back — remember where they were.',
      'Clear all 8 pairs in as few moves as possible.',
    ],
  },
  {
    id: 'snake',
    title: 'Snake',
    tagline: 'Eat, grow, and don’t bite your own tail. Speeds up as you go.',
    icon: '🐍',
    color: '#5dff9d',
    color2: '#c6ff3d',
    onAccent: '#04150b',
    categories: ['arcade', 'quick'],
    difficulty: 'Hard',
    duration: '1–5 min',
    players: '1 player',
    component: Snake,
    score: { label: 'High score' },
    howTo: [
      'Arrow keys or WASD to steer (D-pad on touch screens).',
      'Space pauses and resumes.',
      'Each bite scores a point and grows your tail.',
      'Walls and your own body end the run — it gets faster!',
    ],
  },
  {
    // Chess Battle has its own route tree (src/games/chess) instead of a single component.
    id: 'chess',
    title: 'Chess Battle',
    tagline: 'Think Ahead. Make Your Move. Claim Victory.',
    icon: '♞',
    color: '#8b5cff',
    color2: '#2ee6ff',
    categories: ['strategy', 'puzzle'],
    difficulty: 'Hard',
    duration: '5–30 min',
    players: '1–2 players',
    component: null,
    hasOwnRoutes: true,
    score: null,
    bestStat: () => ({ label: 'Chess wins', value: readChessSummary().wins || null }),
  },
]

export const getGame = (id) => games.find((g) => g.id === id)

// CSS custom properties that give any element a game's neon identity.
export const accentVars = (game) => ({
  '--accent': game.color,
  '--accent-2': game.color2,
  '--on-accent': game.onAccent ?? '#ffffff',
})
