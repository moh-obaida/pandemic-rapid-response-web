import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'
import { initAnalytics } from './lib/analytics'

initAnalytics()

async function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return
  try {
    const Sentry = await import('@sentry/react')
    Sentry.init({ dsn, environment: import.meta.env.MODE })
  } catch {
    // Sentry optional
  }
}

initSentry()

if (import.meta.env.DEV) {
  void import('./lib/qaBridge.dev').then(({ installQaBridge }) => installQaBridge())
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
