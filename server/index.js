// PlayVerse game server: Socket.IO for Online Chess (+ serves the built app with --serve).
//   npm run server            → API only on :3001 (Vite dev server proxies /socket.io here)
//   npm run start             → builds nothing; serves dist/ + API on :3001 (run `npm run build` first)
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, extname, join, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Server } from 'socket.io'
import { SWEEP_INTERVAL_MS } from './chess/config.js'
import { lanAddresses, registerChessSocket } from './chess/chessSocket.js'
import { RoomManager } from './chess/roomManager.js'

const PORT = Number(process.env.PORT) || 3001
const SERVE = process.argv.includes('--serve')
// API-only mode sits behind the Vite proxy, so it stays on localhost. With --serve it is the
// whole app and listens on the local network so other devices can open it.
const HOST = process.env.HOST || (SERVE ? '0.0.0.0' : '127.0.0.1')
const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.txt': 'text/plain',
}

const rooms = new RoomManager()

function serveStatic(req, res) {
  const url = new URL(req.url, 'http://x')
  const rel = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '')
  let file = join(DIST, rel)
  if (!file.startsWith(DIST + sep) && file !== DIST) return send(res, 403, 'Forbidden')
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html') // SPA routes
  if (!existsSync(file)) return send(res, 503, 'Run `npm run build` first')
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' })
  createReadStream(file).pipe(res)
}

function send(res, status, body, type = 'text/plain') {
  res.writeHead(status, { 'Content-Type': type })
  res.end(body)
}

const http = createServer((req, res) => {
  if (req.url === '/health') return send(res, 200, JSON.stringify({ ok: true, rooms: rooms.rooms.size }), 'application/json')
  if (SERVE) return serveStatic(req, res)
  send(res, 404, 'PlayVerse game server — open the app via Vite (npm run dev:online) or start with --serve')
})

const io = new Server(http, {
  maxHttpBufferSize: 10_000, // chess messages are tiny; refuse anything large
  pingInterval: 10_000,
  pingTimeout: 8_000,
})
registerChessSocket(io, rooms)
setInterval(() => rooms.sweep(), SWEEP_INTERVAL_MS).unref()

http.listen(PORT, HOST, () => {
  console.log(`[playverse] game server on http://localhost:${PORT}${SERVE ? ' (serving dist/)' : ''}`)
  if (SERVE) for (const ip of lanAddresses()) console.log(`[playverse] on your network: http://${ip}:${PORT}`)
})
