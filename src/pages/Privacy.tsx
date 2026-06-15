import { SiteLayout } from '../components/layout/SiteLayout'
import { SeoHead } from '../components/layout/SeoHead'
import { PageHeader } from '../components/layout/PageHeader'

export function PrivacyPage() {
  return (
    <SiteLayout>
      <SeoHead title="Privacy Policy" description="PRR Online privacy policy." path="/privacy" />
      <PageHeader title="Privacy Policy" subtitle="Last updated: June 2026" />
      <article style={{ maxWidth: 720, margin: '0 auto', padding: '0 var(--gutter) 48px', color: 'var(--text-dim)', lineHeight: 1.7, fontSize: 14 }}>
        <h2 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}>Data We Collect</h2>
        <p>When you play online, we use Firebase Anonymous Authentication and store game room data (player name, role, game state) in Firebase Realtime Database. We do not require email for MVP play.</p>

        <h2 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', marginTop: 24 }}>Analytics</h2>
        <p>If enabled, Google Analytics collects anonymous usage data (sessions, game events). You can block analytics with browser extensions.</p>

        <h2 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', marginTop: 24 }}>Data Retention</h2>
        <p>Game rooms are archived or deleted after 24 hours of inactivity.</p>

        <h2 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', marginTop: 24 }}>Contact</h2>
        <p>Questions: <a href="mailto:privacy@prr-game.com" style={{ color: 'var(--room-vaccine)' }}>privacy@prr-game.com</a></p>
      </article>
    </SiteLayout>
  )
}
