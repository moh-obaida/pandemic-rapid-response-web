import { Link } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { SiteLayout } from '../components/layout/SiteLayout'
import { SeoHead } from '../components/layout/SeoHead'
import { PageHeader } from '../components/layout/PageHeader'
import { DocSection } from '../components/layout/DocSection'
import { getPlayerViews, TOKEN_DISPLAY } from '../lib/engine/selectors'
import { ArrowLeft, BarChart3 } from 'lucide-react'

export function StatsPage() {
  const snapshot = useGameStore((s) => s.snapshot)

  if (!snapshot) {
    return (
      <SiteLayout>
        <SeoHead title="Mission Statistics" description="Live mission statistics." path="/stats" />
        <PageHeader eyebrow="Mission telemetry" title="Mission Statistics" />
        <article className="mission-prose">
          <p>No active game session. Start or join a mission to view live stats.</p>
          <Link to="/play" className="mission-stats-back">
            <ArrowLeft size={14} />
            Return to mission access
          </Link>
        </article>
      </SiteLayout>
    )
  }

  const players = getPlayerViews(snapshot)
  const delivered = snapshot.cities.filter((c) => c.status === 'delivered').length

  return (
    <SiteLayout>
      <SeoHead title="Mission Statistics" description="Live mission statistics." path="/stats" />
      <PageHeader
        eyebrow="Mission telemetry"
        title="Mission Statistics"
        subtitle="Live readout from the current session"
      />
      <div className="mission-stats-panel">
        <div className="mission-stats-grid">
          <StatCard label="Waste" value={`${snapshot.waste}/${TOKEN_DISPLAY.wasteMax}`} />
          <StatCard label="Cities Delivered" value={`${delivered}/24`} />
          <StatCard label="HQ Tokens" value={`${snapshot.hqTokens}/${TOKEN_DISPLAY.hqMax}`} />
          <StatCard
            label="Supply Tokens"
            value={`${snapshot.supplyTokens}/${TOKEN_DISPLAY.supplyMax}`}
          />
        </div>

        <DocSection title="Connected crew">
          <ul className="mission-stats-players">
            {players.map((p) => (
              <li key={p.id} className="mission-stats-player">
                <span>{p.name}</span>
                <span className="mission-stats-player__role">
                  {p.role.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </li>
            ))}
          </ul>
        </DocSection>

        <Link to="/game" className="mission-stats-back">
          <BarChart3 size={14} />
          Return to mission board
        </Link>
      </div>
    </SiteLayout>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="mission-stat-card glass-panel">
      <div className="mission-stat-card__value">{value}</div>
      <div className="mission-stat-card__label">{label}</div>
    </article>
  )
}
