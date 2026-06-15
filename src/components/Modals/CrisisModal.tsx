import { useGameStore } from '../../store/gameStore'
import { applyCrisisEffect } from '../../lib/rules'
import { AlertTriangle, X } from 'lucide-react'

export function CrisisModal() {
  const crisis = useGameStore((s) => s.board.currentCrisis)
  const open = useGameStore((s) => s.modals.crisis)
  const setModal = useGameStore((s) => s.setModal)

  if (!open || !crisis) return null

  const handleApply = () => {
    const state = useGameStore.getState()
    const { gameState, players } = applyCrisisEffect(
      crisis,
      state.gameState,
      state.players
    )
    useGameStore.setState({
      gameState,
      players,
      board: { ...state.board, currentCrisis: null },
    })
    setModal('crisis', false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div
        className="w-[440px] rounded-xl bg-surface border-2 border-danger/50 p-6 shadow-2xl"
        role="alertdialog"
        aria-label={`Crisis: ${crisis.name}`}
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="text-danger" size={24} />
          <h2 className="font-display font-bold text-xl text-danger">
            Crisis!
          </h2>
          <button
            type="button"
            onClick={() => setModal('crisis', false)}
            className="ml-auto"
            aria-label="Close"
          >
            <X size={20} className="text-muted" />
          </button>
        </div>

        <h3 className="font-display font-bold text-lg text-text mb-2">
          {crisis.name}
        </h3>
        <p className="text-sm text-muted font-body mb-6">{crisis.description}</p>

        <button
          type="button"
          onClick={handleApply}
          className="w-full px-4 py-2 rounded-lg text-sm font-body bg-danger text-white hover:bg-danger/80"
        >
          Apply Effect
        </button>
      </div>
    </div>
  )
}
