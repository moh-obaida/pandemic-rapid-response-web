import { cityImagePathById, assetManifest } from '../../lib/assetManifest'

interface CityCardProps {
  city: string
  cityId: number
  current?: boolean
  delivered?: boolean
  faceDown?: boolean
  compact?: boolean
  onClick?: () => void
}

export function CityCard({
  city,
  cityId,
  current = false,
  delivered = false,
  faceDown = false,
  compact = false,
  onClick,
}: CityCardProps) {
  const artSrc = faceDown
    ? assetManifest.board.cityCardBack
    : cityImagePathById(cityId)

  const className = [
    'city-card-art',
    compact ? 'city-card-art--compact' : '',
    onClick && !delivered ? 'city-card-art--interactive' : '',
    current ? 'city-card-art--current' : '',
    delivered ? 'city-card-art--delivered' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const img = (
    <img src={artSrc} alt={city} className="city-card-art__img" draggable={false} />
  )

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={delivered}
        title={city}
        aria-label={`${city}${delivered ? ', delivered' : ''}`}
        className={className}
        style={{ width: '100%' }}
        data-city-id={cityId}
      >
        {img}
      </button>
    )
  }

  return (
    <div className={className} style={{ width: '4.5rem' }} data-city-id={cityId}>
      {img}
    </div>
  )
}
