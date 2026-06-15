import { Die as DSDie } from '../ds/Die'
import type { Die } from '../../types/game'

interface DicePoolProps {
  dice: Die[]
  selectedDieId?: string | null
  onDieClick?: (dieId: string) => void
  rolling?: boolean
}

export function DicePool({
  dice,
  selectedDieId,
  onDieClick,
  rolling,
}: DicePoolProps) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center" aria-label="Your dice pool">
      {dice.map((die) => (
        <DSDie
          key={die.id}
          supplyType={die.value}
          size={44}
          selected={selectedDieId === die.id}
          locked={die.locked}
          rolling={rolling}
          onClick={
            die.locked || !onDieClick ? undefined : () => onDieClick(die.id)
          }
        />
      ))}
    </div>
  )
}
