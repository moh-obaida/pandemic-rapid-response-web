import { SiteLayout } from '../components/layout/SiteLayout'
import { SeoHead } from '../components/layout/SeoHead'
import { PageHeader } from '../components/layout/PageHeader'
import { RoleCard } from '../components/ds/RoleCard'
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
      <SeoHead title="Roles" description="All 7 PRR specialist roles with abilities and strategy tips." path="/roles" />
      <PageHeader title="Roles" subtitle="7 unique specialists aboard the response plane" />
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '0 var(--gutter) 48px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {ROLES.map((r, i) => (
          <div key={r.id}>
            <RoleCard role={r.name} ability={r.ability} playerIndex={i} />
            <p style={{ fontSize: 13, color: 'var(--text-faint)', margin: '8px 0 0 4px' }}>
              Tip: {TIPS[r.id]}
            </p>
          </div>
        ))}
      </div>
    </SiteLayout>
  )
}
