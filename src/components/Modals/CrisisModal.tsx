import { useGameStore } from '../../store/gameStore'
import { CRISIS_DEFINITIONS } from '../../lib/constants/crises'
import { crisisImagePath } from '../../lib/assetManifest'
import { Button } from '../ds/Button'
import { AlertTriangle, X } from 'lucide-react'

export function CrisisModal() {
  const crises = useGameStore((s) => s.snapshot?.activeTemporaryCrises ?? [])
  const open = useGameStore((s) => s.modals.crisis)
  const setModal = useGameStore((s) => s.setModal)

  const active = crises[0]
  if (!open || !active) return null

  const def = CRISIS_DEFINITIONS.find((d) => d.id === active.instance.definitionId)
  const imgSrc = crisisImagePath(active.instance.definitionId)

  const close = () => setModal('crisis', false)

  return (
    <div
      className="game-end-backdrop crisis-backdrop"
      role="alertdialog"
      aria-label={`Crisis: ${def?.name ?? active.instance.definitionId}`}
    >
      <div className="crisis-panel">
        <div className="crisis-panel__header">
          <div className="crisis-panel__title-row">
            <AlertTriangle size={22} className="crisis-panel__icon" aria-hidden />
            <h2 className="crisis-panel__title">Crisis!</h2>
            <button type="button" onClick={close} className="crisis-panel__close" aria-label="Close">
              <X size={18} />
            </button>
          </div>
          <h3 className="crisis-panel__name">{def?.name ?? active.instance.definitionId}</h3>
        </div>

        <div className="crisis-panel__body">
          {imgSrc && (
            <img
              src={imgSrc}
              alt=""
              className="crisis-panel__art"
              draggable={false}
            />
          )}
          <p className="crisis-panel__desc">{def?.description ?? 'Temporary crisis in effect'}</p>
        </div>

        <Button onClick={close} full>
          Acknowledge
        </Button>
      </div>
    </div>
  )
}
