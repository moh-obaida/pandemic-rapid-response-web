import { useGameStore } from '../../store/gameStore'
import { CRISIS_DEFINITIONS } from '../../lib/constants/crises'
import { crisisImagePath } from '../../lib/assetManifest'
import { X } from 'lucide-react'

export function CrisisModal() {
  const crises = useGameStore((s) => s.snapshot?.activeTemporaryCrises ?? [])
  const open = useGameStore((s) => s.modals.crisis)
  const setModal = useGameStore((s) => s.setModal)

  const active = crises[0]
  if (!open || !active) return null

  const def = CRISIS_DEFINITIONS.find((d) => d.id === active.instance.definitionId)
  const imgSrc = crisisImagePath(active.instance.definitionId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div
        className="w-full max-w-md rounded-xl bg-surface border-2 border-danger/50 p-6 shadow-2xl animate-fade-in"
        role="alertdialog"
        aria-label={`Crisis: ${def?.name ?? active.instance.definitionId}`}
      >
        <div className="flex items-start gap-4 mb-4">
          {imgSrc && (
            <img
              src={imgSrc}
              alt=""
              className="crisis-card-art__img flex-shrink-0"
              style={{ width: '5.5rem' }}
              draggable={false}
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-xl text-danger">Crisis!</h2>
              <button
                type="button"
                onClick={() => setModal('crisis', false)}
                className="ml-auto"
                aria-label="Close"
              >
                <X size={20} className="text-muted" />
              </button>
            </div>
            <h3 className="font-display font-bold text-lg text-text mt-2">
              {def?.name ?? active.instance.definitionId}
            </h3>
          </div>
        </div>

        <p className="text-sm text-muted font-body mb-6">
          {def?.description ?? 'Temporary crisis in effect'}
        </p>

        <button
          type="button"
          onClick={() => setModal('crisis', false)}
          className="w-full px-4 py-2 rounded-lg text-sm font-body bg-danger text-white hover:bg-danger/80"
        >
          Acknowledge
        </button>
      </div>
    </div>
  )
}
