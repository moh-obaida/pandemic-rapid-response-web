import { assetManifest, cityImagePathById, dieImagePath, crateImagePath } from '../../lib/assetManifest'

interface MissionPreviewProps {
  large?: boolean
}

export function MissionPreview({ large = false }: MissionPreviewProps) {
  const scale = large ? 1.15 : 1

  return (
    <div
      className="mission-preview"
      style={large ? { width: 'min(100%, 380px)', transform: `scale(${scale})` } : undefined}
      aria-hidden
    >
      <span className="mission-preview__radar" />
      <img
        src={assetManifest.board.planeBoard}
        alt=""
        className="mission-preview__board"
        draggable={false}
      />
      <div className="mission-preview__timer">02:00</div>
      <img
        src={cityImagePathById(0)}
        alt=""
        className="mission-preview__city mission-preview__city--1"
        draggable={false}
      />
      <img
        src={cityImagePathById(5)}
        alt=""
        className="mission-preview__city mission-preview__city--2"
        draggable={false}
      />
      <img
        src={cityImagePathById(12)}
        alt=""
        className="mission-preview__city mission-preview__city--3"
        draggable={false}
      />
      <img
        src={dieImagePath('plane')}
        alt=""
        className="mission-preview__die mission-preview__die--1"
        draggable={false}
      />
      <img
        src={dieImagePath('vaccine')}
        alt=""
        className="mission-preview__die mission-preview__die--2"
        draggable={false}
      />
      <img
        src={crateImagePath('water')}
        alt=""
        className="mission-preview__crate mission-preview__crate--1"
        draggable={false}
      />
      <img
        src={crateImagePath('food')}
        alt=""
        className="mission-preview__crate mission-preview__crate--2"
        draggable={false}
      />
    </div>
  )
}
