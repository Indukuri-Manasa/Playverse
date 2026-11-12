# Playverse

A neon arcade launcher of small browser games, built with React + Vite. Local project — not published anywhere.

## Run

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run lint
```

## Games

| Game | Route | Best score |
| --- | --- | --- |
| Tic-Tac-Toe (vs CPU / friend) | `/play/tic-tac-toe` | — |
| Memory Match | `/play/memory` | fewest moves |
| Snake | `/play/snake` | highest score |

Best scores are kept in localStorage (`playverse:best-scores`). Play history, sessions, CPU record,
daily-challenge progress and player name live in `playverse:activity`. Nothing leaves the browser.

## Pages

| Route | What it shows |
| --- | --- |
| `/` | Hero, featured games, game of the day, daily challenge, categories, trending, recently played, stats, achievements |
| `/explore` | Search + category filter + sort (`?q=`, `?category=`, `?sort=`) |
| `/categories` | Games grouped by category |
| `/leaderboard` | Personal top runs per game and CPU record |
| `/profile` | Name, level/XP, stats, achievements, reset |
| `/play/:gameId` | Game screen with banner, best score and how-to-play |

## Structure

```
src/
  games/        one component per game
  data/games.js game registry (add new games here)
  pages/        Home, GamePage, NotFound
  components/   layout/, ui/, games/ (shared UI)
  context/      ScoreProvider (best scores)
  hooks/        useScores, useLocalStorage
  services/     storage.js (localStorage wrapper)
  utils/        helpers (shuffle)
  components/art/  GameArt — per-game SVG artwork
  data/         games, categories, achievements, navigation
  styles/       app.css (theme tokens live in index.css)
```

## Adding a game

1. Create `src/games/MyGame.jsx` (default export a component).
2. Register it in `src/data/games.js` (id, title, tagline, icon, color/color2, categories, difficulty, howTo).
   Add artwork for it in `src/components/art/GameArt.jsx`.
3. Call `reportScore(id, score, { lowerIsBetter })` from `useScores()` to record bests.

## Chess Battle (in progress)

Lives in `src/games/chess/` and is code-split behind `/play/chess/*`.

- Rules: [chess.js](https://github.com/jhlywa/chess.js) — every move goes through `chess.move()`; illegal moves are rejected.
- `services/chessService.js` — status (check, mate, stalemate, repetition, fifty-move, insufficient material), captured pieces, snapshots.
- `hooks/useChessGame.js` — board state, selection, promotion, undo/reset/FEN load; `applyMove` for engine/network moves.
- `components/ChessBoard.jsx` — click-to-move, drag-and-drop (mouse + touch), legal-move dots, last-move/check highlights, flip.
- `/play/chess/analysis` — free analysis board with rule demo positions, FEN load, FEN/PGN copy.

Piece artwork is adapted from Colin M.L. Burnett's chess set (Wikimedia Commons; GPLv2+ / BSD / GFDL).
