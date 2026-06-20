import { Button } from '../ds/Button'
import { Panel } from '../ds/Panel'
import { useGame } from '../../hooks/useGame'
import { useDice } from '../../hooks/useDice'
import { RoomSelector } from './RoomSelector'
import { Dices, SkipForward, Package, Navigation } from 'lucide-react'
import type { RoomId } from '../../types/board'
import { canDeliverAtPlane } from '../../lib/engine/selectors'

export function ActionPanel() {
  const {
    currentPlayer,
    selectedDieId,
    selectedRoom,
    selectDie,
    selectRoom,
    assignDieToFirstSlot,
    activateRoom,
    endTurn,
    rollDice,
    turnStep,
    isMyTurn,
    snapshot,
    lastError,
    clearError,
    moveToRoom,
    flyPlane,
  } = useGame()

  const { rerollsRemaining, canReroll, rerollAll, rolling } = useDice()

  const handleRoomSelect = (roomId: RoomId) => {
    if (selectedDieId && currentPlayer?.position === roomId) {
      assignDieToFirstSlot(selectedDieId, roomId)
      selectRoom(null)
    } else if (isMyTurn && turnStep === 'useDice' && currentPlayer) {
      const hand = currentPlayer.dice.filter((d) => d.location === 'hand' && !d.locked)
      if (hand.length > 0) {
        moveToRoom([hand[0].id], roomId)
      } else {
        selectRoom(roomId)
      }
    } else {
      selectRoom(roomId)
    }
  }

  if (!currentPlayer || !snapshot) return null

  const canActivateCargo =
    currentPlayer.position === 'cargo' &&
    snapshot.planePosition !== undefined &&
    canDeliverAtPlane(snapshot)

  return (
    <Panel label="Action Dock" padding={12} style={{ minWidth: 280 }} accent="var(--medical-blue)">
      {lastError && (
        <p style={{ color: 'var(--error)', fontSize: 12, marginBottom: 8 }}>
          {lastError}
          <button type="button" onClick={clearError} className="ml-2 underline">
            dismiss
          </button>
        </p>
      )}

      {!isMyTurn && turnStep !== 'pausedByTimer' && (
        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 12 }}>
          Waiting for{' '}
          {snapshot.players.find((p) => p.id === snapshot.activePlayerId)?.name ?? 'next player'}
          …
        </p>
      )}

      {isMyTurn && turnStep === 'pausedByTimer' && (
        <p style={{ fontSize: 13, color: 'var(--warning)', marginBottom: 12, fontWeight: 600 }}>
          Timer event — mission clock resetting…
        </p>
      )}

      {isMyTurn && turnStep === 'roll' && (
        <>
          <p style={{ fontSize: 13, color: 'var(--accent)', marginBottom: 12, fontWeight: 600 }}>
            Roll your dice to begin
          </p>
          <Button full onClick={rollDice} icon={<Dices size={14} />}>
            Roll Dice
          </Button>
        </>
      )}

      {isMyTurn && turnStep === 'useDice' && (
        <>
          <p style={{ fontSize: 13, color: 'var(--accent)', marginBottom: 12, fontWeight: 600 }}>
            Move, assign dice, activate rooms
          </p>
          <RoomSelector
            selectedDieId={selectedDieId}
            selectedRoom={selectedRoom}
            onRoomSelect={handleRoomSelect}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={rerollAll}
              disabled={!canReroll || rolling}
              icon={<Dices size={14} />}
            >
              Reroll ({rerollsRemaining})
            </Button>
            <Button variant="ghost" size="sm" onClick={() => selectDie(null)}>
              Clear
            </Button>
            {currentPlayer.dice.some((d) => d.face === 'plane' && d.location === 'hand') && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Navigation size={14} />}
                  onClick={() => {
                    const id = currentPlayer.dice.find(
                      (d) => d.face === 'plane' && d.location === 'hand'
                    )?.id
                    if (id) flyPlane([id], 'right')
                  }}
                >
                  Fly →
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Navigation size={14} />}
                  onClick={() => {
                    const id = currentPlayer.dice.find(
                      (d) => d.face === 'plane' && d.location === 'hand'
                    )?.id
                    if (id) flyPlane([id], 'left')
                  }}
                >
                  ← Fly
                </Button>
              </>
            )}
          </div>
          {currentPlayer.position && (
            <div style={{ marginTop: 12 }}>
              <Button
                full
                variant="secondary"
                icon={<Package size={14} />}
                onClick={() => activateRoom(currentPlayer.position)}
                disabled={currentPlayer.position === 'cargo' && !canActivateCargo}
              >
                Activate {currentPlayer.position}
              </Button>
            </div>
          )}
          <div style={{ marginTop: 8 }}>
            <Button full variant="ghost" onClick={endTurn} icon={<SkipForward size={14} />}>
              End Turn
            </Button>
          </div>
        </>
      )}

      {!isMyTurn && turnStep === 'pausedByTimer' && (
        <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Timer event in progress…</p>
      )}
    </Panel>
  )
}
