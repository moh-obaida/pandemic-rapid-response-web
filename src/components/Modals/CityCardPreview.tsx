import { CITIES } from '../../lib/constants/cities'
import { getCratesInCargo } from '../../lib/engine/selectors'
import { hasCratesInCargo } from '../../lib/engine/crates'
import { useGameStore } from '../../store/gameStore'
import { cityImagePathById, crisisImagePath } from '../../lib/assetManifest'
import { crateImagePath } from '../../lib/assetManifest'
import type { SupplyType } from '../../types/board'

interface CityCardPreviewProps {
  cityId: number
  onClose: () => void
}

const SUPPLY_LABEL: Record<SupplyType, string> = {
  water: 'Water',
  food: 'Food',
  power: 'Power',
  vaccine: 'Vaccine',
  firstAid: 'First Aid',
}

export function CityCardPreview({ cityId, onClose }: CityCardPreviewProps) {
  const snapshot = useGameStore((s) => s.snapshot)
  const def = CITIES.find((c) => c.cityId === cityId)
  if (!def || !snapshot) return null

  const state = snapshot.cities.find((c) => c.cityIndex === cityId)
  const cargo = getCratesInCargo(snapshot)
  const cargoByType = cargo.reduce(
    (acc, c) => {
      acc[c.type] = (acc[c.type] ?? 0) + 1
      return acc
    },
    {} as Partial<Record<SupplyType, number>>
  )

  const ready = hasCratesInCargo(snapshot, def.crates)
  const delivered = state?.status === 'delivered'
  const blocked = (state?.blockers.length ?? 0) > 0

  return (
    <div className="card-preview-backdrop" onClick={onClose} role="presentation">
      <div
        className="card-preview card-preview--city"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`${def.name} city card`}
      >
        <button type="button" className="card-preview__close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <img
          src={cityImagePathById(cityId)}
          alt={def.name}
          className="card-preview__art"
          draggable={false}
        />
        <div className="card-preview__body">
          <h2 className="card-preview__title">{def.name}</h2>
          {state?.status === 'faceUpOnPath' && snapshot.planePosition === cityId && (
            <p className="card-preview__tag card-preview__tag--plane">Plane is here</p>
          )}
          {delivered && (
            <p className="card-preview__tag card-preview__tag--delivered">Delivered</p>
          )}
          {blocked && state?.blockers[0] && (
            <div className="card-preview__blocker">
              <img
                src={crisisImagePath(state.blockers[0].definitionId)}
                alt=""
                className="card-preview__blocker-img"
              />
              <span>Delivery blocked</span>
            </div>
          )}
          <section className="card-preview__section">
            <h3>Required</h3>
            <ul className="card-preview__checklist">
              {(Object.entries(def.crates) as [SupplyType, number][]).map(([type, need]) => (
                <li key={type}>
                  <img src={crateImagePath(type)} alt="" width={20} height={20} />
                  {SUPPLY_LABEL[type]} ×{need}
                </li>
              ))}
            </ul>
          </section>
          <section className="card-preview__section">
            <h3>Cargo</h3>
            <ul className="card-preview__checklist">
              {(Object.entries(def.crates) as [SupplyType, number][]).map(([type, need]) => {
                const have = cargoByType[type] ?? 0
                const ok = have >= need
                return (
                  <li key={type} className={ok ? 'card-preview__check--ok' : ''}>
                    <img src={crateImagePath(type)} alt="" width={20} height={20} />
                    {SUPPLY_LABEL[type]} ×{have} / {need}
                  </li>
                )
              })}
            </ul>
          </section>
          <p className={`card-preview__status${ready && !blocked ? ' card-preview__status--ready' : ''}`}>
            Status: {delivered ? 'Delivered' : blocked ? 'Blocked' : ready ? 'Ready to deliver' : 'Not ready'}
          </p>
        </div>
      </div>
    </div>
  )
}
