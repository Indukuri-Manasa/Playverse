import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// /socket.io is proxied to the PlayVerse game server (server/index.js, port 3001),
// so the app and the realtime API share one origin — also when opened from another device.
const gameServer = { '/socket.io': { target: 'http://localhost:3001', ws: true } }

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { proxy: gameServer },
  preview: { proxy: gameServer },
})
