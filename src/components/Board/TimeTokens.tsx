import { Clock } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { TOKEN_DISPLAY } from '../../lib/engine/selectors'
import { Tooltip } from '../layout/Tooltip'

export function TimeTokens() {
  const hq = useGameStore((s) => s.snapshot?.hqTokens ?? 0)
  const supply = useGameStore((s) => s.snapshot?.supplyTokens ?? 0)

  return (
    <Tooltip content="HQ tokens lost each timer flip. Supply tokens convert to HQ on delivery">
      <div className="time-tokens" aria-label={`${hq} HQ tokens, ${supply} supply tokens`}>
        <div className="time-tokens__header">
          <Clock size={12} />
          <span className="ds-label">Tokens</span>
        </div>
        <div className="time-tokens__row">
          <span className="text-xs text-muted mr-2">HQ</span>
          {Array.from({ length: TOKEN_DISPLAY.hqMax }).map((_, i) => (
            <div
              key={`hq-${i}`}
              className={`time-tokens__chip ${i < hq ? 'time-tokens__chip--filled' : 'time-tokens__chip--empty'}`}
              aria-hidden
            />
          ))}
        </div>
        <div className="time-tokens__row mt-1">
          <span className="text-xs text-muted mr-2">Supply</span>
          {Array.from({ length: TOKEN_DISPLAY.supplyMax }).map((_, i) => (
            <div
              key={`sup-${i}`}
              className={`time-tokens__chip time-tokens__chip--supply ${i < supply ? 'time-tokens__chip--filled' : 'time-tokens__chip--empty'}`}
              aria-hidden
            />
          ))}
        </div>
      </div>
    </Tooltip>
  )
}
