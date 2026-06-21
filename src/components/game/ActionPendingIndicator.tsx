import { useGameStore } from '../../store/gameStore'

export function ActionPendingIndicator() {
  const pending = useGameStore((s) => s.isActionPending)
  if (!pending) return null

  return (
    <div className="action-pending" role="status" aria-live="polite" aria-label="Sending action">
      <span className="action-pending__spinner" aria-hidden />
      <span className="action-pending__label">Syncing…</span>
    </div>
  )
}
