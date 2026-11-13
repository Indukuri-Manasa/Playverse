// Runs the game server and the Vite dev server together, shared on your local network.
//   npm run dev:online  → http://localhost:5173 and http://<your-mac-ip>:5173 for other devices on the same Wi-Fi
import { spawn } from 'node:child_process'

const procs = [
  spawn(process.execPath, ['server/index.js'], { stdio: 'inherit' }),
  spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['vite', '--host'], { stdio: 'inherit' }),
]
const stop = () => procs.forEach((p) => p.kill())
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
procs.forEach((p) => p.on('exit', (code) => { if (code) { console.error('[dev-online] a process exited — stopping'); stop(); process.exit(code) } }))
