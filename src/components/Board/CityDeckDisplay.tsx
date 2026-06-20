import { useGameStore } from '../../store/gameStore'
import { assetManifest } from '../../lib/assetManifest'

export function CityDeckDisplay() {
  const count = useGameStore((s) => s.snapshot?.cityDeck.length ?? 0)

  return (
    <div className="city-deck-display" aria-label={`${count} cities remaining in deck`}>
      <img
        src={assetManifest.board.cityCardBack}
        alt=""
        className="city-deck-display__back"
        draggable={false}
      />
      <span className="city-deck-display__count">{count}</span>
      <span className="city-deck-display__label">City deck</span>
    </div>
  )
}
