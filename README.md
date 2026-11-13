# Playverse

A neon arcade launcher of small browser games, built with React + Vite. Local project — not published anywhere.

## Run

```sh
npm install
npm run dev          # app only → http://localhost:5173 (everything except Online Match)
npm run dev:online   # app + game server, shared on your Wi-Fi → http://<your-mac-ip>:5173
npm run build        # production build into dist/
npm run start        # serve dist/ + game server on one port → http://<your-mac-ip>:3001
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
- `/play/chess/local` — Friend vs Friend (same device): names, Bullet/Blitz/Rapid/Unlimited clocks, undo, resign, rematch.
- `/play/chess/computer` — Computer vs You against Stockfish 17.1 (5 levels, hints, practice undo).

### Stockfish engine
- Package: [`stockfish`](https://github.com/nmrugg/stockfish.js) 17.1 — **lite single-threaded WASM** build (~7 MB),
  which needs no SharedArrayBuffer / COOP+COEP headers.
- `scripts/copy-engine.mjs` copies it to `public/engine/` (runs automatically via `predev` / `prebuild`; the folder is git-ignored).
- Runs in a **Web Worker** (`services/stockfishService.js`), talking UCI. The engine gets the full move list,
  so it sees repetitions and the fifty-move count.
- Difficulty settings live in `services/engineLevels.js` (Skill Level + depth + time cap).
- Stockfish is **GPL-3**; its licence and authors file are shipped next to the engine in `public/engine/`.

Piece artwork is adapted from Colin M.L. Burnett's chess set (Wikimedia Commons; GPLv2+ / BSD / GFDL).

### Online Match (Socket.IO)

```
server/
  index.js              HTTP + Socket.IO (namespace /chess); `--serve` also serves dist/
  chess/config.js       grace period, room TTLs, clock scale (env-overridable)
  chess/gameManager.js  authoritative chess.js game + server-side clocks
  chess/roomManager.js  6-char room codes, seats, tokens, cleanup
  chess/chessSocket.js  event handlers + validation
```

- **Server-authoritative:** clients send only `{ from, to, promotion, ply }`. The server checks seat, turn,
  ply (no stale/duplicate moves) and legality with chess.js (the same `chessService.js` the browser uses),
  then broadcasts the position. Client-sent positions are never trusted.
- **Rooms:** codes use `A–Z` / `2–9` without look-alikes (no 0/O, 1/I/L). A third player gets `ROOM_FULL`.
- **Identity:** each device has a stable `playerId` (localStorage) for stats; each seat gets a secret token
  (kept per browser tab in sessionStorage) that is required to reconnect. Results are saved with the server's
  `matchId`, ready to attach to user accounts later.
- **Reconnects:** a reload/network blip rejoins the same seat. Mid-game, a disconnected player has
  60 s (`CHESS_GRACE_MS`) to return before the opponent wins.
- **Clocks:** run on the server (it ends games on time even if nobody moves); clients interpolate between updates.
- **Cleanup:** rooms with nobody connected for 2 min, or finished and idle for 15 min, are removed.

**Playing on other devices (same Wi-Fi):** run `npm run dev:online` (or `npm run build && npm run start`) and
open the invite link the app shows — it uses this Mac's local IP. macOS may ask to allow incoming connections for `node`.

**Hosting it publicly (not done — this project stays local):** you would need a Node 18+ host that supports
long-lived WebSocket connections (a VPS or a container platform, not static hosting), HTTPS/WSS in front
(a reverse proxy such as Caddy/Nginx, with WebSocket upgrade headers for `/socket.io`), `npm run build`
then `npm run start` with `PORT` set, and a single instance — room state is in memory, so scaling to several
instances would need a shared store (e.g. Redis + the Socket.IO Redis adapter) and sticky sessions.
