import { SiteLayout } from '../components/layout/SiteLayout'
import { SeoHead } from '../components/layout/SeoHead'
import { PageHeader } from '../components/layout/PageHeader'
import { DocSection } from '../components/layout/DocSection'
import { MissionCtaBand } from '../components/layout/MissionCtaBand'

export function HowToPlayPage() {
  return (
    <SiteLayout>
      <SeoHead
        title="Mission Guide"
        description="Learn how to play PRR Online — cooperative real-time dice assignment, supply creation, and city delivery."
        path="/how-to-play"
      />
      <PageHeader
        eyebrow="Operations protocol"
        title="Mission Guide"
        subtitle="Cooperative real-time logistics aboard the response plane"
      />
      <article className="mission-prose">
        <DocSection title="Objective">
          Deliver supplies to all 24 cities before the waste track reaches END or the team runs out
          of time tokens when the round timer expires.
        </DocSection>
        <DocSection title="Each Round (2 minutes)">
          <ol>
            <li>All players roll 6 dice at once</li>
            <li>
              Assign dice to rooms — Vaccine, Food, Power, Water, First Aid, Recycling, or Cargo
            </li>
            <li>Use up to 2 rerolls (Analyst gets 3)</li>
            <li>Submit assignments when ready</li>
            <li>Load supplies to cargo and deliver to matching cities (1 time token per delivery)</li>
          </ol>
        </DocSection>
        <DocSection title="Waste">
          Unmatched dice create waste. The Recycler role ignores one waste die per round. If waste
          hits END, the mission fails immediately.
        </DocSection>
        <DocSection title="Win & Lose">
          <p>
            <strong style={{ color: 'var(--highlight)' }}>Win:</strong> All 24 cities supplied.
          </p>
          <p>
            <strong style={{ color: 'var(--error)' }}>Lose:</strong> Waste reaches END, or timer
            hits 0:00 with no time tokens in HQ.
          </p>
        </DocSection>
      </article>
      <MissionCtaBand secondaryLabel="Join Room" secondaryTo="/play?join=1" />
    </SiteLayout>
  )
}
