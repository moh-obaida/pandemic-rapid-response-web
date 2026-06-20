import { useGameStore } from '../../store/gameStore'
import { getContextualHints } from '../../lib/controlHints'
import { Button } from '../ds/Button'
import { Dices, SkipForward } from 'lucide-react'

interface ActionHintsProps {
  selectedDieIds: string[]
  roleId?: import('../../types/board').RoleId
  playerId?: string | null
  controlsFrozen: boolean
  canAct: boolean
  turnStep: string
  isMyTurn: boolean
  rerollsRemaining: number
  onRoll: () => void
  onRerollSelected: () => void
  onEndTurn: () => void
  onCancelSelection: () => void
  rolling?: boolean
}

export function ActionHints({
  selectedDieIds,
  roleId,
  playerId,
  controlsFrozen,
  canAct,
  turnStep,
  isMyTurn,
  rerollsRemaining,
  onRoll,
  onRerollSelected,
  onEndTurn,
  onCancelSelection,
  rolling,
}: ActionHintsProps) {
  const snapshot = useGameStore((s) => s.snapshot)
  const lastError = useGameStore((s) => s.lastError)
  const clearError = useGameStore((s) => s.clearError)
  const pendingConfirm = useGameStore((s) => s.pendingConfirm)

  if (!snapshot) return null

  if (!isMyTurn && turnStep !== 'pausedByTimer') {
    const activeName =
      snapshot.players.find((p) => p.id === snapshot.activePlayerId)?.name ?? '—'
    return (
      <div className="dice-dock__hints">
        <p className="dice-dock__hint-text">Waiting for {activeName}…</p>
        <p className="dice-dock__hint-sub">You can inspect cards and the board.</p>
      </div>
    )
  }

  if (turnStep === 'pausedByTimer') {
    return (
      <div className="dice-dock__hints dice-dock__hints--alert">
        <p className="dice-dock__hint-text">Timer event resolving. Actions are paused.</p>
      </div>
    )
  }

  if (isMyTurn && turnStep === 'roll') {
    return (
      <div className="dice-dock__hints">
        <p className="dice-dock__hint-text">Roll your dice to begin</p>
        <Button size="sm" onClick={onRoll} icon={<Dices size={14} />}>
          Roll Dice
        </Button>
      </div>
    )
  }

  if (!canAct || controlsFrozen) return null

  const hints =
    roleId && playerId
      ? getContextualHints(snapshot, playerId, selectedDieIds, roleId)
      : []

  return (
    <div className="dice-dock__hints">
      {lastError && (
        <p className="dice-dock__error">
          {lastError}
          <button type="button" onClick={clearError} className="dice-dock__dismiss">
            dismiss
          </button>
        </p>
      )}
      <ul className="dice-dock__hint-list">
        {hints.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
      {!pendingConfirm && (
        <div className="dice-dock__actions">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRerollSelected}
            disabled={selectedDieIds.length === 0 || rerollsRemaining <= 0 || rolling}
            icon={<Dices size={14} />}
          >
            Reroll Selected
          </Button>
          {selectedDieIds.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onCancelSelection}>
              Cancel Selection
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={onEndTurn} icon={<SkipForward size={14} />}>
            End Turn
          </Button>
        </div>
      )}
    </div>
  )
}
