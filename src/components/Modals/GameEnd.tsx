import { useGameStore } from '../../store/gameStore'
import { Trophy, Skull, RotateCcw } from 'lucide-react'
import { Button } from '../ds/Button'
import { Panel } from '../ds/Panel'

export function GameEnd() {
  const open = useGameStore((s) => s.modals.gameEnd)
  const result = useGameStore((s) => s.gameState.result)
  const round = useGameStore((s) => s.gameState.round)
  const waste = useGameStore((s) => s.gameState.waste)
  const tokens = useGameStore((s) => s.gameState.timeTokens)
  const cities = useGameStore((s) => s.board.cities)
  const reset = useGameStore((s) => s.reset)

  if (!open || !result) return null

  const delivered = cities.filter((c) => c.delivered).length
  const isWin = result === 'win'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(2px)',
      }}
    >
      <Panel
        style={{ width: 480, textAlign: 'center', boxShadow: 'var(--shadow-modal)' }}
        padding={32}
      >
        {isWin ? (
          <Trophy size={48} style={{ color: 'var(--highlight)', margin: '0 auto 16px' }} />
        ) : (
          <Skull size={48} style={{ color: 'var(--error)', margin: '0 auto 16px' }} />
        )}

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 28,
            color: isWin ? 'var(--highlight)' : 'var(--error)',
            marginBottom: 8,
          }}
        >
          {isWin ? 'ALL SUPPLIES DELIVERED' : 'MISSION FAILED'}
        </h2>

        <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 24 }}>
          {isWin
            ? 'We delivered everything. Humanity survives.'
            : waste >= useGameStore.getState().gameState.wasteMax
              ? 'Waste reached critical'
              : 'Timer ended with no time tokens in HQ'}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            marginBottom: 24,
          }}
        >
          <Stat label="Rounds" value={String(round)} />
          <Stat label="Cities" value={`${delivered}/24`} />
          <Stat label="Waste" value={String(waste)} />
          <Stat label="Tokens" value={String(tokens)} />
        </div>

        <Button
          onClick={() => {
            reset()
            window.location.href = '/play'
          }}
          icon={<RotateCcw size={16} />}
        >
          Return to Lobby
        </Button>
      </Panel>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: 'var(--bg-900)',
        borderRadius: 'var(--radius-md)',
        padding: 12,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: 22,
          color: 'var(--text)',
        }}
      >
        {value}
      </div>
      <div className="ds-label">{label}</div>
    </div>
  )
}
