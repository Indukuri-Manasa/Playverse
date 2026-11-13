// Copies the Stockfish (lite, single-threaded WASM) engine into public/engine so the browser
// can load it as a Web Worker. Runs automatically before `npm run dev` / `npm run build`.
// The single-threaded build needs no SharedArrayBuffer / COOP+COEP headers.
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'node_modules', 'stockfish', 'src')
const out = join(root, 'public', 'engine')

const js = readdirSync(src).find((f) => /^stockfish-[\d.]+-lite-single-[0-9a-f]+\.js$/.test(f))
if (!js) {
  console.error('[copy-engine] lite-single Stockfish build not found in node_modules/stockfish/src')
  process.exit(1)
}
const wasm = js.replace(/\.js$/, '.wasm')
mkdirSync(out, { recursive: true })
copyFileSync(join(src, js), join(out, 'stockfish.js'))
copyFileSync(join(src, wasm), join(out, 'stockfish.wasm'))
// GPL-3: ship the licence and authors alongside the engine binary.
for (const f of ['Copying.txt', 'AUTHORS']) if (existsSync(join(root, 'node_modules', 'stockfish', f))) copyFileSync(join(root, 'node_modules', 'stockfish', f), join(out, f))
console.log(`[copy-engine] ${js} → public/engine/stockfish.js (+ .wasm, licence)`)
