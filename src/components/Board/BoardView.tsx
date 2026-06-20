import { useMemo } from 'react'
import { assetManifest } from '../../lib/assetManifest'
import { BOARD_HOTSPOTS } from '../../lib/boardHotspots'
import { useGameStore } from '../../store/gameStore'
import { getCratesInRoom, getCratesInCargo } from '../../lib/engine/selectors'
import { CITIES } from '../../lib/constants/cities'
import {
  getValidFlyDirections,
  canRoomActivate,
  isDeliveryReady,
  isSlotValidTarget,
  roomAcceptsMove,
  roomAcceptsAssign,
} from '../../lib/boardTargets'
import type { RoomId } from '../../types/board'
import { RoomHotspot } from './overlays/RoomHotspot'
import { DieSlotHotspot } from './overlays/DieSlotHotspot'
import { PawnOverlay } from './overlays/PawnOverlay'
import { CrateOverlay } from './overlays/CrateOverlay'
import { CityTabOverlay } from './overlays/CityTabOverlay'
import { FlyArrowOverlay } from './overlays/FlyArrowOverlay'
import { TOKEN_DISPLAY } from '../../lib/engine/selectors'

const PAWN_COLORS = ['#38bdf8', '#f472b6', '#a3e635', '#fb923c', '#c084fc', '#2dd4bf', '#facc15']

interface BoardViewProps {
  selectedDieIds: string[]
  selectedRoom?: RoomId | null
  controlsFrozen?: boolean
  onRoomClick?: (roomId: RoomId) => void
  onDieSlotClick?: (roomId: RoomId, slotIndex: number) => void
  onCityClick?: (cityId: number) => void
  onFlyLeft?: () => void
  onFlyRight?: () => void
}

export function BoardView({
  selectedDieIds,
  selectedRoom,
  controlsFrozen,
  onRoomClick,
  onDieSlotClick,
  onCityClick,
  onFlyLeft,
  onFlyRight,
}: BoardViewProps) {
  const snapshot = useGameStore((s) => s.snapshot)
  const playerId = useGameStore((s) => s.playerId)

  const activeRoomId = snapshot?.players.find((p) => p.id === snapshot.activePlayerId)?.position

  const flyDirs = useMemo(() => {
    if (!snapshot || !playerId || controlsFrozen) return []
    return getValidFlyDirections(snapshot, playerId, selectedDieIds)
  }, [snapshot, playerId, selectedDieIds, controlsFrozen])

  const pawns = useMemo(() => {
    if (!snapshot) return []
    return snapshot.players.map((p, i) => ({
      id: p.id,
      name: p.name.slice(0, 2).toUpperCase(),
      roomId: p.position,
      color: PAWN_COLORS[i % PAWN_COLORS.length],
      isSelf: p.id === playerId,
    }))
  }, [snapshot, playerId])

  if (!snapshot) {
    return (
      <div className="board-view board-view--loading">
        <span className="text-muted text-sm">Loading board…</span>
      </div>
    )
  }

  const cargoCrates = getCratesInCargo(snapshot)
  const waste = snapshot.waste
  const deliveryReady = playerId ? isDeliveryReady(snapshot, playerId) : false
  const hasSelection = selectedDieIds.length > 0

  return (
    <div
      className={`board-stage board-view${controlsFrozen ? ' board-view--frozen' : ''}`}
      aria-label="Plane board"
    >
      <img
        src={assetManifest.board.planeBoard}
        alt=""
        className="board-view__art"
        draggable={false}
      />

      <div className="board-view__layer board-view__hotspots">
        {BOARD_HOTSPOTS.map((spot) => {
          const isSelected = selectedRoom === spot.roomId
          const isActiveTurn = activeRoomId === spot.roomId
          const roomCrates =
            spot.roomId === 'cargo' ? cargoCrates : getCratesInRoom(snapshot, spot.roomId)
          const roomPawns = pawns.filter((p) => p.roomId === spot.roomId)
          const slots = snapshot.roomSlots[spot.roomId] ?? []

          const validMove = Boolean(
            !controlsFrozen &&
            hasSelection &&
            playerId &&
            roomAcceptsMove(snapshot, playerId, selectedDieIds, spot.roomId)
          )
          const validAssign = Boolean(
            !controlsFrozen &&
            hasSelection &&
            playerId &&
            roomAcceptsAssign(snapshot, playerId, selectedDieIds, spot.roomId)
          )
          const canActivate = Boolean(
            !controlsFrozen &&
            !hasSelection &&
            playerId &&
            canRoomActivate(snapshot, playerId, spot.roomId)
          )
          const deliveryGlow =
            spot.roomId === 'cargo' && deliveryReady && !controlsFrozen

          return (
            <div key={spot.roomId}>
              <RoomHotspot
                roomId={spot.roomId}
                label={spot.label}
                selected={isSelected}
                activeTurn={isActiveTurn}
                validMove={validMove}
                validAssign={validAssign}
                canActivate={canActivate}
                deliveryReady={deliveryGlow}
                disabled={controlsFrozen && !onCityClick}
                onClick={() => onRoomClick?.(spot.roomId)}
              />

              {canActivate && (
                <button
                  type="button"
                  className="board-activate-badge"
                  style={{
                    left: `${spot.left + spot.width / 2}%`,
                    top: `${spot.top + spot.height - 2}%`,
                  }}
                  onClick={() => onRoomClick?.(spot.roomId)}
                >
                  Activate
                </button>
              )}

              {spot.roomId === 'hq' && (
                <span className="board-overlay__hq" aria-hidden>
                  HQ ×{snapshot.hqTokens}
                </span>
              )}

              {spot.roomId === 'recycling' && (
                <div className="board-overlay__waste" aria-label={`Waste ${waste}`}>
                  <img
                    src={assetManifest.tokens.wasteMarker}
                    alt=""
                    className="board-overlay__waste-marker"
                    draggable={false}
                  />
                  <span>
                    {waste}/{TOKEN_DISPLAY.wasteMax}
                  </span>
                </div>
              )}

              {slots.map((dieId, slotIndex) => {
                if (!dieId) {
                  const valid = Boolean(
                    !controlsFrozen &&
                    playerId &&
                    isSlotValidTarget(
                      snapshot,
                      playerId,
                      selectedDieIds,
                      spot.roomId,
                      slotIndex
                    )
                  )
                  return (
                    <DieSlotHotspot
                      key={`${spot.roomId}-slot-${slotIndex}`}
                      roomId={spot.roomId}
                      slotIndex={slotIndex}
                      validTarget={valid}
                      dieSelected={hasSelection}
                      onClick={
                        onDieSlotClick && !controlsFrozen
                          ? () => onDieSlotClick(spot.roomId, slotIndex)
                          : undefined
                      }
                    />
                  )
                }
                const die = snapshot.dice.find((d) => d.id === dieId)
                return (
                  <DieSlotHotspot
                    key={dieId}
                    roomId={spot.roomId}
                    slotIndex={slotIndex}
                    face={die?.face}
                    filled
                    locked={die?.locked}
                  />
                )
              })}

              {roomCrates.map((c, i) => (
                <CrateOverlay
                  key={c.id}
                  crateId={c.id}
                  type={c.type}
                  location={spot.roomId === 'cargo' ? 'cargo' : spot.roomId}
                  index={i}
                />
              ))}

              {roomPawns.map((p, idx) => (
                <PawnOverlay
                  key={p.id}
                  playerId={p.id}
                  roomId={spot.roomId}
                  label={p.name}
                  color={p.color}
                  isSelf={p.isSelf}
                  index={idx}
                  total={roomPawns.length}
                />
              ))}
            </div>
          )
        })}

        {CITIES.map((cityDef) => {
          const state = snapshot.cities.find((c) => c.cityIndex === cityDef.cityId)
          if (!state || state.status === 'discarded' || state.status === 'faceDownInDeck') {
            return null
          }
          const topBlocker = state.blockers[state.blockers.length - 1]
          const isPlaneHere = snapshot.planePosition === cityDef.cityId
          const deliveryCityGlow =
            isPlaneHere && deliveryReady && state.status === 'faceUpOnPath'

          return (
            <CityTabOverlay
              key={cityDef.cityId}
              cityId={cityDef.cityId}
              cityName={cityDef.name}
              faceUp={state.status === 'faceUpOnPath'}
              isCurrent={isPlaneHere}
              delivered={state.status === 'delivered'}
              blockerId={topBlocker?.definitionId}
              deliveryReady={deliveryCityGlow}
              onClick={() => onCityClick?.(cityDef.cityId)}
            />
          )
        })}

        <FlyArrowOverlay
          planeCityId={snapshot.planePosition}
          showLeft={flyDirs.includes('left')}
          showRight={flyDirs.includes('right')}
          onFlyLeft={onFlyLeft}
          onFlyRight={onFlyRight}
          disabled={controlsFrozen}
        />
      </div>

      {hasSelection && !controlsFrozen && (
        <div className="board-view__selection-hint" aria-live="polite">
          {selectedDieIds.length} die selected — click glowing targets
        </div>
      )}
    </div>
  )
}
