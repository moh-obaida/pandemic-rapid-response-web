import type { DieFace } from '../../lib/constants/dice'
import { dieImagePath } from '../../lib/assetManifest'

interface DieProps {
  face: DieFace
  size?: number
  selected?: boolean
  locked?: boolean
  rolling?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const FACE_LABELS: Record<DieFace, string> = {
  plane: 'Plane',
  water: 'Water',
  food: 'Food',
  power: 'Power',
  vaccine: 'Vaccine',
  firstAid: 'First Aid',
}

export function Die({
  face,
  size = 52,
  selected = false,
  locked = false,
  rolling = false,
  onClick,
}: DieProps) {
  const src = dieImagePath(face)

  return (
    <button
      type="button"
      onClick={locked ? undefined : onClick}
      disabled={locked}
      aria-label={`${FACE_LABELS[face]} die${locked ? ', locked' : ''}`}
      className={[
        'game-die',
        selected ? 'game-die--selected' : '',
        locked ? 'game-die--locked' : '',
        rolling ? 'animate-dice-roll' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width: size, height: size }}
      data-die-face={face}
    >
      <img
        src={src}
        alt=""
        className="game-die__img"
        width={size}
        height={size}
        draggable={false}
      />
    </button>
  )
}
