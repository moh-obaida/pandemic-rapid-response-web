import { Clock } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { Tooltip } from '../layout/Tooltip'

export function TimeTokens() {
  const tokens = useGameStore((s) => s.gameState.timeTokens)
  const max = useGameStore((s) => s.gameState.timeTokensMax)

  return (
    <Tooltip content="Spend 1 token per delivery flight. Tokens are shared in HQ">
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
        aria-label={`${tokens} time tokens remaining`}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            color: 'var(--text-faint)',
          }}
        >
          <Clock size={12} />
          <span className="ds-label">Time Tokens</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: max }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 20,
                height: 20,
                borderRadius: '999px',
                border: '2px solid var(--room-vaccine)',
                background: i < tokens ? 'var(--room-vaccine)' : 'transparent',
                opacity: i < tokens ? 1 : 0.3,
                transition: 'opacity var(--dur-med)',
              }}
              aria-hidden
            />
          ))}
        </div>
      </div>
    </Tooltip>
  )
}
