import { Clock } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { Tooltip } from '../layout/Tooltip'

export function TimeTokens() {
  const tokens = useGameStore((s) => s.gameState.timeTokens)
  const max = useGameStore((s) => s.gameState.timeTokensMax)

  return (
    <Tooltip content="Spend 1 token per delivery flight. Tokens are shared in HQ">
      <div className="time-tokens" aria-label={`${tokens} time tokens remaining`}>
        <div className="time-tokens__header">
          <Clock size={12} />
          <span className="ds-label">Time Tokens</span>
        </div>
        <div className="time-tokens__row">
          {Array.from({ length: max }).map((_, i) => (
            <div
              key={i}
              className={`time-tokens__chip ${i < tokens ? 'time-tokens__chip--filled' : 'time-tokens__chip--empty'}`}
              aria-hidden
            />
          ))}
        </div>
      </div>
    </Tooltip>
  )
}
