import { Button } from '../ds/Button'
import { Panel } from '../ds/Panel'
import { useGame } from '../../hooks/useGame'
import { useDice } from '../../hooks/useDice'
import { RoomSelector } from './RoomSelector'
import { Dices, Send, Package } from 'lucide-react'
import type { RoomId } from '../../types/board'

export function ActionPanel() {
  const {
    currentPlayer,
    selectedDieId,
    selectedRoom,
    selectDie,
    selectRoom,
    assignDice,
    submitAssignments,
    loadCargo,
    gameState,
    startNextRound,
  } = useGame()

  const { rerollsRemaining, canReroll, rerollAll, rolling } = useDice()
  const phase = gameState.phase

  const handleRoomSelect = (roomId: RoomId) => {
    selectRoom(roomId)
    if (selectedDieId) {
      assignDice(selectedDieId, roomId)
      selectRoom(null)
    }
  }

  const handleLoadCargo = () => {
    const ids = gameState.supplies.filter((s) => !s.inCargo).map((s) => s.id)
    loadCargo(ids)
  }

  if (!currentPlayer) return null

  return (
    <Panel label="Actions" padding={12} style={{ minWidth: 280 }}>
      {phase === 'assigning' && (
        <>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--text-dim)',
              marginBottom: 12,
            }}
          >
            YOUR TURN — Assign dice to rooms, then Submit
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
              Clear Selection
            </Button>
          </div>
          <div style={{ marginTop: 12 }}>
            <Button
              full
              onClick={submitAssignments}
              disabled={currentPlayer.submitted}
              variant={currentPlayer.submitted ? 'success' : 'primary'}
              icon={<Send size={14} />}
            >
              {currentPlayer.submitted ? 'Submitted' : 'Submit'}
            </Button>
          </div>
        </>
      )}

      {phase === 'delivering' && (
        <>
          <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 12 }}>
            Load cargo, then tap cities on the flightpath to Deliver
          </p>
          <Button full icon={<Package size={14} />} onClick={handleLoadCargo}>
            Load Cargo
          </Button>
        </>
      )}

      {phase === 'resolution' && (
        <Button full onClick={startNextRound}>
          Next Round
        </Button>
      )}
    </Panel>
  )
}
