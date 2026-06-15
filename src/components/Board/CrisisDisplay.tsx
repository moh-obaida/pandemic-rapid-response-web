import { AlertTriangle } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'

export function CrisisDisplay() {
  const crisis = useGameStore((s) => s.board.currentCrisis)

  if (!crisis) return null

  return (
    <button
      type="button"
      onClick={() => useGameStore.getState().setModal('crisis', true)}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-danger/20 border border-danger/50 hover:bg-danger/30 transition-colors"
      aria-label={`Active crisis: ${crisis.name}`}
    >
      <AlertTriangle size={16} className="text-danger" />
      <div className="text-left">
        <div className="text-xs text-danger font-display font-bold uppercase">
          Crisis
        </div>
        <div className="text-sm text-text font-body">{crisis.name}</div>
      </div>
    </button>
  )
}
