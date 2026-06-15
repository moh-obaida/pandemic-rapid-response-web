import { SiteLayout } from '../components/layout/SiteLayout'
import { SeoHead } from '../components/layout/SeoHead'
import { PageHeader } from '../components/layout/PageHeader'

export function AboutPage() {
  return (
    <SiteLayout>
      <SeoHead
        title="About"
        description="About PRR Online — a fan-made digital companion for Pandemic: Rapid Response by Z-Man Games."
        path="/about"
      />
      <PageHeader title="About" />
      <article style={{ maxWidth: 720, margin: '0 auto', padding: '0 var(--gutter) 48px', color: 'var(--text-dim)', lineHeight: 1.7 }}>
        <p>
          <strong style={{ color: 'var(--text)' }}>Pandemic: Rapid Response</strong> is a real-time cooperative
          board game published by Z-Man Games, designed by Kane Klenko and Matt Leacock&apos;s Pandemic system.
        </p>
        <p>
          PRR Online is an independent fan project — a browser-based, real-time multiplayer interface inspired by
          the tabletop game. It is not affiliated with, endorsed by, or sponsored by Z-Man Games or Asmodee.
        </p>
        <p>
          This digital version focuses on simultaneous play, Firebase-synced multiplayer, and a clean mission-console
          aesthetic. Original board artwork and trademarks belong to their respective owners.
        </p>
        <p>
          Feedback: <a href="mailto:feedback@prr-game.com" style={{ color: 'var(--room-vaccine)' }}>feedback@prr-game.com</a>
        </p>
      </article>
    </SiteLayout>
  )
}
