import { SiteLayout } from '../components/layout/SiteLayout'
import { SeoHead } from '../components/layout/SeoHead'
import { PageHeader } from '../components/layout/PageHeader'

export function HowToPlayPage() {
  return (
    <SiteLayout>
      <SeoHead
        title="How to Play"
        description="Learn how to play PRR Online — cooperative real-time dice assignment, supply creation, and city delivery."
        path="/how-to-play"
      />
      <PageHeader title="How to Play" subtitle="Cooperative real-time logistics aboard the response plane" />
      <article style={{ maxWidth: 720, margin: '0 auto', padding: '0 var(--gutter) 48px', color: 'var(--text-dim)', lineHeight: 1.6 }}>
        <Section title="Objective">
          Deliver supplies to all 24 cities before the waste track reaches END or the team runs out of time tokens when the round timer expires.
        </Section>
        <Section title="Each Round (2 minutes)">
          <ol style={{ paddingLeft: 20 }}>
            <li>All players roll 6 dice at once</li>
            <li>Assign dice to rooms — Vaccine, Food, Power, Water, First Aid, Recycling, or Cargo</li>
            <li>Use up to 2 rerolls (Analyst gets 3)</li>
            <li>Submit assignments when ready</li>
            <li>Load supplies to cargo and deliver to matching cities (1 time token per delivery)</li>
          </ol>
        </Section>
        <Section title="Waste">
          Unmatched dice create waste. The Recycler role ignores one waste die per round. If waste hits END, the mission fails immediately.
        </Section>
        <Section title="Win & Lose">
          <strong style={{ color: 'var(--highlight)' }}>Win:</strong> All 24 cities supplied.<br />
          <strong style={{ color: 'var(--error)' }}>Lose:</strong> Waste reaches END, or timer hits 0:00 with no time tokens in HQ.
        </Section>
      </article>
    </SiteLayout>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>
        {title}
      </h2>
      {children}
    </section>
  )
}
