import { useGameStore } from '../store/gameStore'
import { useNavigate } from 'react-router-dom'
import { BarChart3, ArrowLeft } from 'lucide-react'

export function StatsPage() {
  const navigate = useNavigate()
  const gameState = useGameStore((s) => s.gameState)
  const board = useGameStore((s) => s.board)
  const players = useGameStore((s) => s.players)

  const delivered = board.cities.filter((c) => c.delivered).length

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-8">
      <div className="w-[600px] rounded-2xl bg-surface border border-white/10 p-8">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="text-primary" size={24} />
          <h1 className="font-display font-bold text-2xl text-text">
            Game Statistics
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard label="Round" value={String(gameState.round)} />
          <StatCard label="Waste" value={`${gameState.waste}/${gameState.wasteMax}`} />
          <StatCard label="Cities Delivered" value={`${delivered}/24`} />
          <StatCard
            label="Time Tokens"
            value={`${gameState.timeTokens}/${gameState.timeTokensMax}`}
          />
        </div>

        <h2 className="font-display font-bold text-lg text-text mb-3">Players</h2>
        <div className="space-y-2 mb-8">
          {players.map((p) => (
            <div
              key={p.id}
              className="flex justify-between px-3 py-2 rounded-lg bg-canvas text-sm font-body"
            >
              <span className="text-text">{p.name}</span>
              <span className="text-muted capitalize">
                {p.role.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-muted font-body hover:text-text"
        >
          <ArrowLeft size={14} />
          Back to Lobby
        </button>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-canvas p-4">
      <div className="text-xs text-muted font-body uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-2xl font-mono font-bold text-text">{value}</div>
    </div>
  )
}
