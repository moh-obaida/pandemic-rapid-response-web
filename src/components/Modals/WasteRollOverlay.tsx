import { useMemo, useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { useGame } from '../../hooks/useGame'
import { rollDieFace } from '../../lib/constants/dice'
import type { DieFace } from '../../lib/constants/dice'
import { Die as DSDie } from '../ds/Die'
import { Button } from '../ds/Button'
import { Recycle } from 'lucide-react'

export function WasteRollOverlay() {
  const snapshot = useGameStore((s) => s.snapshot)
  const playerId = useGameStore((s) => s.playerId)
  const { resolveWasteRoll, isMyTurn } = useGame()
  const pending = snapshot?.pendingWasteRoll

  const [rolls, setRolls] = useState<Record<string, DieFace>>({})
  const [excludedDieId, setExcludedDieId] = useState<string | undefined>()
  const [rolling, setRolling] = useState(false)

  const dieIds = useMemo(() => pending?.dieIds ?? [], [pending?.dieIds])
  const isRecycler =
    pending?.recyclerPlayerId && pending.recyclerPlayerId === playerId

  const allRolled = useMemo(
    () => dieIds.every((id) => rolls[id] !== undefined),
    [dieIds, rolls]
  )

  if (!pending || !snapshot || !isMyTurn) return null

  const handleRoll = () => {
    setRolling(true)
    const next: Record<string, DieFace> = {}
    for (const id of dieIds) {
      next[id] = rollDieFace()
    }
    window.setTimeout(() => {
      setRolls(next)
      setRolling(false)
    }, 480)
  }

  const handleResolve = async () => {
    if (!allRolled) return
    await resolveWasteRoll(rolls, excludedDieId)
    setRolls({})
    setExcludedDieId(undefined)
  }

  return (
    <div className="waste-roll-backdrop" role="dialog" aria-label="Waste dice roll">
      <div className="waste-roll-panel">
        <div className="waste-roll-panel__header">
          <Recycle size={20} className="waste-roll-panel__icon" aria-hidden />
          <h2 className="waste-roll-panel__title">Waste roll</h2>
        </div>
        <p className="waste-roll-panel__desc">
          Roll assigned dice from {pending.roomId}. Circled faces add waste.
          {isRecycler && ' Choose one die to exclude as Recycler.'}
        </p>

        <div className="waste-roll-panel__dice">
          {dieIds.map((id) => {
            const face = rolls[id]
            const die = snapshot.dice.find((d) => d.id === id)
            return (
              <button
                key={id}
                type="button"
                className={[
                  'waste-roll-panel__die',
                  excludedDieId === id ? 'waste-roll-panel__die--excluded' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => {
                  if (isRecycler) {
                    setExcludedDieId((prev) => (prev === id ? undefined : id))
                  }
                }}
                disabled={!isRecycler || !face}
              >
                {face ? (
                  <DSDie face={face} size={40} rolling={rolling} />
                ) : (
                  <span className="waste-roll-panel__die-placeholder">?</span>
                )}
                {die && (
                  <span className="waste-roll-panel__die-label">{die.face}</span>
                )}
              </button>
            )
          })}
        </div>

        <div className="waste-roll-panel__actions">
          {!allRolled ? (
            <Button onClick={handleRoll} disabled={rolling}>
              Roll waste dice
            </Button>
          ) : (
            <Button onClick={handleResolve}>
              Apply waste result
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
