import type { PlayerView } from '../../../lib/engine/selectors'
import { BOARD_HOTSPOTS } from '../../../lib/boardHotspots'
import { roleImagePath, dieImagePath } from '../../../lib/assetManifest'
import { ROLES } from '../../../lib/constants'
import type { RoomId } from '../../../types/board'

const PAWN_COLORS = ['#38bdf8', '#f472b6', '#a3e635', '#fb923c', '#c084fc', '#2dd4bf', '#facc15']

const ROOM_LABELS = Object.fromEntries(
  BOARD_HOTSPOTS.map((h) => [h.roomId, h.label])
) as Record<RoomId, string>

interface PlayerRailProps {
  players: PlayerView[]
  playerId: string | null
  onRoleClick?: (player: PlayerView) => void
}

export function PlayerRail({ players, playerId, onRoleClick }: PlayerRailProps) {
  const activeIndex = players.findIndex((p) => p.isActive)

  return (
    <div className="player-rail player-rail--crew-deck">
      <h2 className="panel-heading">Crew</h2>
      <ol className="player-rail__order" start={1}>
        {players.map((player, i) => {
          const role = ROLES.find((r) => r.id === player.role)
          const spent = player.dice.filter((d) => d.location === 'spent')
          const isSelf = player.id === playerId
          const pawnColor = PAWN_COLORS[i % PAWN_COLORS.length]
          const turnLabel = player.isActive
            ? 'Active'
            : i === (activeIndex + 1) % players.length
              ? 'On deck'
              : 'Waiting'

          return (
            <li key={player.id}>
              <button
                type="button"
                className={[
                  'player-seat',
                  'player-seat--tabletop',
                  isSelf ? 'player-seat--self' : '',
                  player.isActive ? 'player-seat--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onRoleClick?.(player)}
              >
                <span className="player-seat__turn-order">{i + 1}</span>
                <span className="player-seat__pawn" style={{ background: pawnColor }} aria-hidden />
                <img
                  src={roleImagePath(player.role)}
                  alt={role?.name ?? 'Role card'}
                  className="player-seat__role-art"
                  draggable={false}
                />
                <div className="player-seat__info">
                  <span className="player-seat__name">{player.name}</span>
                  <span className="player-seat__role-name">{role?.name}</span>
                  <span className="player-seat__room">In: {ROOM_LABELS[player.position]}</span>
                  <span
                    className={`player-seat__status${player.isActive ? ' player-seat__status--active' : ''}`}
                  >
                    {turnLabel}
                  </span>
                </div>
                {spent.length > 0 && (
                  <div className="player-seat__spent" aria-label={`${spent.length} spent dice`}>
                    {spent.map((d) => (
                      <img
                        key={d.id}
                        src={dieImagePath(d.face)}
                        alt=""
                        className="player-seat__spent-die"
                        draggable={false}
                      />
                    ))}
                  </div>
                )}
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
