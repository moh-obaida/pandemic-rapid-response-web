import { useGameStore } from '../../store/gameStore'
import { getCratesInCargo } from '../../lib/engine/selectors'
import { CARGO_MAX } from '../../lib/constants/tokens'
import { crateImagePath } from '../../lib/assetManifest'

export function CargoStatusDisplay() {
  const snapshot = useGameStore((s) => s.snapshot)
  if (!snapshot) return null

  const crates = getCratesInCargo(snapshot)

  return (
    <div className="cargo-status" aria-label={`Cargo bay ${crates.length} of ${CARGO_MAX}`}>
      <div className="cargo-status__header">
        <span className="cargo-status__title">Cargo Bay</span>
        <span className="cargo-status__count">
          {crates.length} / {CARGO_MAX}
        </span>
      </div>
      <div className="cargo-status__crates">
        {crates.map((c) => (
          <img
            key={c.id}
            src={crateImagePath(c.type)}
            alt=""
            width={22}
            height={22}
            className="cargo-status__crate"
            draggable={false}
          />
        ))}
        {crates.length === 0 && (
          <span className="cargo-status__empty">Empty</span>
        )}
      </div>
    </div>
  )
}
