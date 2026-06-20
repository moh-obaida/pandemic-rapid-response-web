import { useGameStore } from '../../store/gameStore'
import { CRISIS_DEFINITIONS } from '../../lib/constants/crises'
import { crisisImagePath } from '../../lib/assetManifest'

export function CrisisDisplay() {
  const crises = useGameStore((s) => s.snapshot?.activeTemporaryCrises ?? [])
  const turbulence = useGameStore((s) => s.snapshot?.turbulenceActive)
  const winds = useGameStore((s) => s.snapshot?.extremeWindsActive)
  const crisisEnabled = useGameStore((s) => s.settings.crisisEnabled)

  if (!crisisEnabled) {
    return <span className="crisis-instrument--clear">Crisis mode off</span>
  }

  if (crises.length === 0 && !turbulence && !winds) {
    return <span className="crisis-instrument--clear">Clear skies</span>
  }

  const active = crises[0]
  const def = active
    ? CRISIS_DEFINITIONS.find((d) => d.id === active.instance.definitionId)
    : turbulence
      ? CRISIS_DEFINITIONS.find((d) => d.id === 'turbulence')
      : CRISIS_DEFINITIONS.find((d) => d.id === 'extreme-winds')

  const crisisId = active?.instance.definitionId ?? (turbulence ? 'turbulence' : 'extreme-winds')
  const imgSrc = crisisImagePath(crisisId)

  return (
    <button
      type="button"
      onClick={() => useGameStore.getState().setModal('crisis', true)}
      className="crisis-instrument"
      aria-label={`Active crisis: ${def?.name ?? crisisId}`}
    >
      <img src={imgSrc} alt="" className="crisis-instrument__img" draggable={false} />
      <div className="min-w-0 text-left">
        <div className="crisis-instrument__label">Active crisis</div>
        <div className="crisis-instrument__name">{def?.name ?? crisisId}</div>
      </div>
    </button>
  )
}
