import { SiteLayout } from '../components/layout/SiteLayout'
import { SeoHead } from '../components/layout/SeoHead'
import { PageHeader } from '../components/layout/PageHeader'
import { DocSection } from '../components/layout/DocSection'
import { MissionCtaBand } from '../components/layout/MissionCtaBand'
import { ROOMS, TIMER_SECONDS, TIME_TOKENS_START, WASTE_MAX } from '../lib/constants'

export function RulesPage() {
  return (
    <SiteLayout>
      <SeoHead
        title="Mission Rules"
        description="Full PRR Online rulebook — rooms, dice, waste, delivery, and win conditions."
        path="/rules"
      />
      <PageHeader
        eyebrow="Mission parameters"
        title="Mission Rules"
        subtitle="Digital implementation of Pandemic: Rapid Response"
      />
      <article className="mission-prose">
        <DocSection title="Timer">
          <p>
            Each round lasts {TIMER_SECONDS} seconds. All players act simultaneously. When the timer
            reaches 0:00, resolve waste and advance phase.
          </p>
        </DocSection>

        <DocSection title="Rooms">
          <ul>
            {ROOMS.map((r) => (
              <li key={r.id}>
                <strong>{r.name}</strong> —{' '}
                {r.supplyType
                  ? `Create ${r.name} supplies from matching dice`
                  : r.id === 'recycling'
                    ? 'Reduce waste from unmatched dice'
                    : r.id === 'cargo'
                      ? 'Hold supplies for delivery'
                      : 'Stores time tokens'}
              </li>
            ))}
          </ul>
        </DocSection>

        <DocSection title="Time Tokens">
          <p>
            HQ starts with {TIME_TOKENS_START} tokens. Spend 1 per city delivery. Flight Planner can
            deliver to 2 cities per token when that role is in play.
          </p>
        </DocSection>

        <DocSection title="Waste">
          <p>
            Shared waste track (max {WASTE_MAX}). One waste per unmatched die unless Recycler
            reduces it.
          </p>
        </DocSection>

        <DocSection title="Keyboard Shortcuts">
          <ul>
            <li>
              <kbd>Space</kbd> — Roll / primary action
            </li>
            <li>
              <kbd>Enter</kbd> — Confirm / Submit
            </li>
            <li>
              <kbd>Escape</kbd> — Close modal
            </li>
            <li>
              <kbd>Arrow keys</kbd> — Select room
            </li>
          </ul>
        </DocSection>
      </article>
      <MissionCtaBand />
    </SiteLayout>
  )
}
