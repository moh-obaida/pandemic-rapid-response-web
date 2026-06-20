import { SiteLayout } from '../components/layout/SiteLayout'
import { SeoHead } from '../components/layout/SeoHead'
import { PageHeader } from '../components/layout/PageHeader'
import { MissionCtaBand } from '../components/layout/MissionCtaBand'
import { RoleDeckShowcase } from '../components/landing/RoleDeckShowcase'
import { ROLES } from '../lib/constants'

const TIPS: Record<string, string> = {
  analyst: 'Save rerolls for critical mismatches in the final 30 seconds.',
  technician: 'Use the +1 die shift to reach harder room matches.',
  engineer: 'Reroll downward when you need a lower supply type.',
  flightPlanner: 'Coordinate deliveries to maximize 2-for-1 token flights.',
  director: 'HQ dice act as wildcards — assign flexibly across rooms.',
  recycler: 'Send one unmatched die to recycling each round.',
  supplySpecialist: 'Assign out-of-order when cargo needs mix quickly.',
}

export function RolesPage() {
  return (
    <SiteLayout>
      <SeoHead
        title="Crew Roles"
        description="All 7 PRR specialist roles with abilities and strategy tips."
        path="/roles"
      />
      <PageHeader
        eyebrow="Crew manifest"
        title="Crew Roles"
        subtitle="7 unique specialists aboard the response plane — assigned randomly at launch"
      />
      <div className="mission-prose mission-prose--wide">
        <RoleDeckShowcase />
        <div className="mission-role-tips">
          {ROLES.map((r) => (
            <article key={r.id} className="mission-role-tip glass-panel">
              <h3 className="mission-role-tip__name">{r.name}</h3>
              <p className="mission-role-tip__text">Tip: {TIPS[r.id]}</p>
            </article>
          ))}
        </div>
      </div>
      <MissionCtaBand />
    </SiteLayout>
  )
}
