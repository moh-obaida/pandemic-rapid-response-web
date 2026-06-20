import { ROLES } from '../../lib/constants'
import { roleImagePath } from '../../lib/assetManifest'
import { dieImagePath } from '../../lib/assetManifest'
import type { PlayerView } from '../../lib/engine/selectors'
import type { DieFace } from '../../lib/constants/dice'

interface RoleCardPreviewProps {
  player: PlayerView
  onClose: () => void
}

const STARTING_ROOM: Record<string, string> = {
  analyst: 'HQ',
  technician: 'First Aid',
  engineer: 'Power',
  flightPlanner: 'Cargo',
  director: 'HQ',
  recycler: 'Recycling',
  supplySpecialist: 'Food',
}

export function RoleCardPreview({ player, onClose }: RoleCardPreviewProps) {
  const role = ROLES.find((r) => r.id === player.role)
  if (!role) return null

  const spent = player.dice.filter((d) => d.location === 'spent')
  const inHand = player.dice.filter((d) => d.location === 'hand')
  const assigned = player.dice.filter((d) => d.location === 'room')

  return (
    <div className="card-preview-backdrop" onClick={onClose} role="presentation">
      <div
        className="card-preview card-preview--role"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`${role.name} role card`}
      >
        <button type="button" className="card-preview__close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <img
          src={roleImagePath(player.role)}
          alt={role.name}
          className="card-preview__art card-preview__art--role"
          draggable={false}
        />
        <div className="card-preview__body">
          <h2 className="card-preview__title">{role.name}</h2>
          <p className="card-preview__subtitle">{player.name}</p>
          {player.isActive && (
            <p className="card-preview__tag card-preview__tag--active">Active Turn</p>
          )}
          <p className="card-preview__ability">{role.ability}</p>
          <p className="card-preview__meta">
            Starting room: {STARTING_ROOM[player.role] ?? '—'}
          </p>
          <p className="card-preview__meta">
            Rerolls left: {player.rerollsMax - player.rerollsUsed}
          </p>
          <div className="card-preview__dice-row">
            <span>In hand:</span>
            {inHand.map((d) => (
              <DieThumb key={d.id} face={d.face} />
            ))}
            {inHand.length === 0 && <span className="text-muted">—</span>}
          </div>
          <div className="card-preview__dice-row">
            <span>On board:</span>
            {assigned.map((d) => (
              <DieThumb key={d.id} face={d.face} />
            ))}
            {assigned.length === 0 && <span className="text-muted">—</span>}
          </div>
          <div className="card-preview__dice-row card-preview__dice-row--spent">
            <span>Spent:</span>
            {spent.map((d) => (
              <DieThumb key={d.id} face={d.face} dimmed />
            ))}
            {spent.length === 0 && <span className="text-muted">—</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

function DieThumb({ face, dimmed }: { face: DieFace; dimmed?: boolean }) {
  return (
    <img
      src={dieImagePath(face)}
      alt=""
      width={28}
      height={28}
      className={dimmed ? 'card-preview__die--spent' : ''}
      draggable={false}
    />
  )
}
