import { SiteLayout } from '../components/layout/SiteLayout'
import { SeoHead } from '../components/layout/SeoHead'
import { PageHeader } from '../components/layout/PageHeader'
import { DocSection } from '../components/layout/DocSection'

export function PrivacyPage() {
  return (
    <SiteLayout>
      <SeoHead title="Privacy Policy" description="PRR Online privacy policy." path="/privacy" />
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="Last updated: June 2026"
      />
      <article className="mission-prose">
        <DocSection title="Data We Collect">
          <p>
            When you play online, we use Firebase Anonymous Authentication and store game room data
            (player name, role, game state) in Firebase Realtime Database. We do not require email
            for MVP play.
          </p>
        </DocSection>

        <DocSection title="Analytics">
          <p>
            If enabled, Google Analytics collects anonymous usage data (sessions, game events). You
            can block analytics with browser extensions.
          </p>
        </DocSection>

        <DocSection title="Data Retention">
          <p>Game rooms are archived or deleted after 24 hours of inactivity.</p>
        </DocSection>

        <DocSection title="Contact">
          <p>
            Questions: <a href="mailto:privacy@prr-game.com">privacy@prr-game.com</a>
          </p>
        </DocSection>
      </article>
    </SiteLayout>
  )
}
