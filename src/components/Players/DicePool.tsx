import { Die as DSDie } from '../ds/Die'
import type { EngineDie } from '../../types/engine'

interface DicePoolProps {
  dice: EngineDie[]
  selectedDieIds?: string[]
  onDieClick?: (dieId: string, additive: boolean) => void
  rolling?: boolean
  disabled?: boolean
}

export function DicePool({
  dice,
  selectedDieIds = [],
  onDieClick,
  rolling,
  disabled,
}: DicePoolProps) {
  const handDice = dice.filter((d) => d.location === 'hand' || d.location === 'hq')

  return (
    <div className="dice-pool" aria-label="Your dice pool">
      {handDice.map((die) => (
        <DSDie
          key={die.id}
          face={die.face}
          size={44}
          selected={selectedDieIds.includes(die.id)}
          locked={die.locked}
          rolling={rolling}
          onClick={
            die.locked || !onDieClick || disabled
              ? undefined
              : (e) => onDieClick(die.id, e.shiftKey || e.metaKey || e.ctrlKey)
          }
        />
      ))}
    </div>
  )
}
