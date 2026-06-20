import {
  assetManifest,
  cityImagePathById,
  dieImagePath,
  crateImagePath,
} from '../../lib/assetManifest'
import { BoardTableFrame } from './BoardTableFrame'

interface MissionPreviewProps {
  /** Hero-sized preview inside mission table frame */
  variant?: 'hero' | 'compact'
}

export function MissionPreview({ variant = 'hero' }: MissionPreviewProps) {
  return (
    <div
      className={`mission-preview mission-preview--${variant}`}
      aria-hidden={variant === 'hero'}
    >
      <BoardTableFrame label="Aircraft command table preview">
        <div className="mission-preview__board-wrap">
          <img
            src={assetManifest.board.planeBoard}
            alt=""
            className="mission-table__board mission-preview__board"
            draggable={false}
          />
          <div className="mission-preview__hud">
            <span className="mission-preview__timer">02:00</span>
            <span className="mission-preview__hud-label">Mission clock</span>
          </div>
        </div>
      </BoardTableFrame>

      <div className="mission-preview__orbit">
        <img
          src={cityImagePathById(3)}
          alt=""
          className="mission-preview__float mission-preview__float--city"
          draggable={false}
        />
        <div className="mission-preview__dice-cluster">
          <img src={dieImagePath('plane')} alt="" draggable={false} />
          <img src={dieImagePath('vaccine')} alt="" draggable={false} />
        </div>
        <img
          src={crateImagePath('water')}
          alt=""
          className="mission-preview__float mission-preview__float--crate"
          draggable={false}
        />
      </div>
    </div>
  )
}
