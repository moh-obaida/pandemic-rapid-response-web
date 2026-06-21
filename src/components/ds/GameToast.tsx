import { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'

const AUTO_DISMISS_MS = 4500

export function GameToast() {
  const lastError = useGameStore((s) => s.lastError)
  const clearError = useGameStore((s) => s.clearError)

  useEffect(() => {
    if (!lastError) return
    const timer = window.setTimeout(() => clearError(), AUTO_DISMISS_MS)
    return () => window.clearTimeout(timer)
  }, [lastError, clearError])

  if (!lastError) return null

  return (
    <div className="game-toast" role="alert" aria-live="assertive">
      <AlertTriangle size={16} className="game-toast__icon" aria-hidden />
      <p className="game-toast__message">{lastError}</p>
      <button type="button" className="game-toast__dismiss" onClick={clearError}>
        <X size={14} />
        <span className="sr-only">Dismiss error</span>
      </button>
    </div>
  )
}
