import { cityImagePathById, crisisImagePath } from '../../../lib/assetManifest'
import { FLIGHTPATH_TAB_POSITIONS } from '../../../lib/boardHotspots'
import { dieImagePath } from '../../../lib/assetManifest'
import type { CrisisDefinitionId } from '../../../lib/constants/crises'

interface CityTabOverlayProps {
  cityId: number
  cityName: string
  faceUp?: boolean
  isCurrent?: boolean
  delivered?: boolean
  blockerId?: CrisisDefinitionId
  deliveryReady?: boolean
  onClick?: () => void
}

export function CityTabOverlay({
  cityId,
  cityName,
  faceUp,
  isCurrent,
  delivered,
  blockerId,
  deliveryReady,
  onClick,
}: CityTabOverlayProps) {
  const pos = FLIGHTPATH_TAB_POSITIONS[cityId]
  if (!pos) return null

  const deliveryLabel = deliveryReady ? ', delivery ready' : ''
  const blockerLabel = blockerId ? ', blocked' : ''
  const cityLabel = `${cityName}${isCurrent ? ', plane here' : ''}${delivered ? ', delivered' : ''}${deliveryLabel}${blockerLabel}`

  return (
    <div
      className={[
        'board-city-tab',
        faceUp ? 'board-city-tab--face-up' : '',
        isCurrent ? 'board-city-tab--current' : '',
        delivered ? 'board-city-tab--delivered' : '',
        blockerId ? 'board-city-tab--blocked' : '',
        deliveryReady ? 'board-city-tab--delivery-ready' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
      title={cityName}
      data-city-id={cityId}
    >
      {isCurrent && (
        <img
          src={dieImagePath('plane')}
          alt=""
          className="board-city-tab__plane"
          aria-hidden
        />
      )}
      <button
        type="button"
        className="board-city-tab__btn"
        onClick={onClick}
        disabled={!faceUp && !delivered}
        aria-label={cityLabel}
      >
        <img
          src={cityImagePathById(cityId)}
          alt=""
          className="board-city-tab__img"
          draggable={false}
        />
        {blockerId && (
          <img
            src={crisisImagePath(blockerId)}
            alt=""
            className="board-city-tab__blocker-img"
            draggable={false}
          />
        )}
      </button>
    </div>
  )
}
