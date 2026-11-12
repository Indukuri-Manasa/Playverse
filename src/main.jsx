import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/inter'
import '@fontsource-variable/space-grotesk'
import { ActivityProvider } from './context/ActivityProvider'
import { ScoreProvider } from './context/ScoreProvider'
import App from './App.jsx'
import './index.css'
import './styles/app.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ActivityProvider>
        <ScoreProvider>
          <App />
        </ScoreProvider>
      </ActivityProvider>
    </BrowserRouter>
  </StrictMode>,
)
