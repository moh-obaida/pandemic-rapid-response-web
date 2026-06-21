import type { DieFace } from '../../lib/constants/dice'
import type { SupplyType } from '../../types/board'
import {
  assetManifest,
  cityImagePathById,
  crisisImagePath,
  crateImagePath,
  dieImagePath,
} from '../../lib/assetManifest'
import { BoardTableFrame } from './BoardTableFrame'

interface MissionPreviewProps {
  variant?: 'hero' | 'compact'
}

const PREVIEW_DICE: DieFace[] = ['plane', 'water', 'food', 'power', 'vaccine', 'firstAid']
const PREVIEW_CRATES: SupplyType[] = ['water', 'food', 'power', 'vaccine', 'firstAid']

export function MissionPreview({ variant = 'hero' }: MissionPreviewProps) {
  return (
    <div
      className={`landing-preview landing-preview--${variant}`}
      aria-hidden={variant === 'hero'}
    >
      <div className="landing-preview__frame">
        <BoardTableFrame className="landing-preview__table" label="Live mission preview">
          <div className="landing-preview__board-wrap">
            <img
              src={assetManifest.board.planeBoard}
              alt=""
              className="mission-table__board landing-preview__board"
              draggable={false}
            />
          </div>
        </BoardTableFrame>

        <img
          src={crisisImagePath('safety-drill')}
          alt=""
          className="landing-preview__float landing-preview__float--crisis"
          draggable={false}
        />
        <img
          src={cityImagePathById(16)}
          alt=""
          className="landing-preview__float landing-preview__float--city"
          draggable={false}
        />
        <div className="landing-preview__dice">
          {PREVIEW_DICE.map((face) => (
            <img key={face} src={dieImagePath(face)} alt="" draggable={false} />
          ))}
        </div>
        <div className="landing-preview__crates">
          {PREVIEW_CRATES.map((type) => (
            <img key={type} src={crateImagePath(type)} alt="" draggable={false} />
          ))}
        </div>
        <img
          src={assetManifest.board.turnReference}
          alt=""
          className="landing-preview__float landing-preview__float--turn-ref"
          draggable={false}
        />

        <div className="landing-preview__badge landing-preview__badge--timer">
          <span className="landing-preview__badge-value">01:24</span>
          <span className="landing-preview__badge-label">Timer</span>
        </div>
        <div className="landing-preview__badge landing-preview__badge--room">
          <span className="landing-preview__badge-value">K7Q2M9</span>
          <span className="landing-preview__badge-label">Room</span>
        </div>
      </div>
    </div>
  )
}
