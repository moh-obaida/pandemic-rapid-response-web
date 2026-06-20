import { useState, useCallback } from 'react'
import { DicePool } from '../Players/DicePool'
import { ActionHints } from './ActionHints'
import { ConfirmBar } from './ConfirmBar'
import { EngineerFlipPicker } from '../Board/overlays/FlyArrowOverlay'
import { getDieById } from '../../lib/boardInteraction'
import { useGameStore } from '../../store/gameStore'
import type { PendingConfirm } from '../../types/controls'

interface DiceHandBarProps {
  selectedDieIds: string[]
  roleName?: string
  playerName?: string
  roleId?: import('../../types/board').RoleId
  playerId?: string | null
  controlsFrozen: boolean
  canAct: boolean
  turnStep: string
  isMyTurn: boolean
  rerollsRemaining: number
  pendingConfirm: PendingConfirm | null
  dice: import('../../types/engine').EngineDie[]
  onDieClick: (dieId: string, additive: boolean) => void
  onRoll: () => void
  onRerollSelected: () => void
  onEndTurn: () => void
  onCancelSelection: () => void
  onConfirm: () => void
  onCancelConfirm: () => void
  onEngineerFlip: (face: import('../../lib/constants/dice').DieFace) => void
}

export function DiceHandBar({
  selectedDieIds,
  roleName,
  playerName,
  roleId,
  playerId,
  controlsFrozen,
  canAct,
  turnStep,
  isMyTurn,
  rerollsRemaining,
  pendingConfirm,
  dice,
  onDieClick,
  onRoll,
  onRerollSelected,
  onEndTurn,
  onCancelSelection,
  onConfirm,
  onCancelConfirm,
  onEngineerFlip,
}: DiceHandBarProps) {
  const snapshot = useGameStore((s) => s.snapshot)
  const [rolling, setRolling] = useState(false)

  const triggerRollAnimation = useCallback(() => {
    setRolling(true)
    window.setTimeout(() => setRolling(false), 520)
  }, [])

  const handleRoll = useCallback(() => {
    triggerRollAnimation()
    onRoll()
  }, [onRoll, triggerRollAnimation])

  const handleRerollSelected = useCallback(() => {
    triggerRollAnimation()
    onRerollSelected()
  }, [onRerollSelected, triggerRollAnimation])

  const showEngineerFlip =
    isMyTurn &&
    canAct &&
    roleId === 'engineer' &&
    selectedDieIds.some(
      (id) => snapshot && getDieById(snapshot, id)?.face === 'plane'
    )

  return (
    <div className="dice-dock" aria-label="Active player dock">
      {pendingConfirm ? (
        <ConfirmBar pending={pendingConfirm} onConfirm={onConfirm} onCancel={onCancelConfirm} />
      ) : (
        <>
          <div className="dice-dock__primary">
            <div className="dice-dock__turn">
              <span className="dice-dock__turn-label">
                {isMyTurn ? 'Your Turn' : `${playerName ?? 'Player'}'s Turn`}
              </span>
              {roleName && <span className="dice-dock__role">— {roleName}</span>}
              <span className="dice-dock__rerolls-inline">Rerolls: {rerollsRemaining}</span>
            </div>

            <div className="dice-dock__hand">
              <span className="dice-dock__hand-label">Your dice</span>
              {isMyTurn && turnStep === 'useDice' ? (
                <DicePool
                  dice={dice}
                  selectedDieIds={selectedDieIds}
                  onDieClick={onDieClick}
                  rolling={rolling}
                  disabled={controlsFrozen}
                />
              ) : isMyTurn && turnStep === 'roll' ? (
                <span className="dice-dock__hint">Tap Roll Dice</span>
              ) : (
                <span className="dice-dock__hint">
                  {dice.filter((d) => d.location === 'hand').length} in hand
                </span>
              )}
            </div>

            {showEngineerFlip && (
              <EngineerFlipPicker onFlip={onEngineerFlip} disabled={controlsFrozen} />
            )}
          </div>

          <ActionHints
            selectedDieIds={selectedDieIds}
            roleId={roleId}
            playerId={playerId}
            controlsFrozen={controlsFrozen}
            canAct={canAct}
            turnStep={turnStep}
            isMyTurn={isMyTurn}
            rerollsRemaining={rerollsRemaining}
            onRoll={handleRoll}
            onRerollSelected={handleRerollSelected}
            onEndTurn={onEndTurn}
            onCancelSelection={onCancelSelection}
            rolling={rolling}
          />
        </>
      )}
    </div>
  )
}
