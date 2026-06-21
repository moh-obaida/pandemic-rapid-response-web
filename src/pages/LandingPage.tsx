import { SiteLayout } from '../components/layout/SiteLayout'
import { SeoHead } from '../components/layout/SeoHead'
import { MissionCtaBand } from '../components/layout/MissionCtaBand'
import { LandingHero } from '../components/landing/LandingHero'
import { RoleDeckShowcase } from '../components/landing/RoleDeckShowcase'
import { ROLES } from '../lib/constants'

export function LandingPage() {
  return (
    <SiteLayout>
      <SeoHead
        title="Mission Control"
        description="Cooperative aircraft logistics board game for 2–4 players. Roll dice, load cargo, and deliver supplies before time runs out."
        path="/"
      />

      <LandingHero />

      <section className="mission-section mission-section--roles mission-section--tight">
        <p className="mission-section__eyebrow">Crew manifest</p>
        <h2 className="mission-section__title">Crew roles</h2>
        <p className="mission-section__subtitle mission-section__subtitle--tight">
          Each crew member has a unique ability. Roles are assigned randomly at launch —{' '}
          {ROLES.length} specialists in the deck.
        </p>
        <RoleDeckShowcase />
      </section>

      <MissionCtaBand />
    </SiteLayout>
  )
}
