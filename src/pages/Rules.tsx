import { SiteLayout } from '../components/layout/SiteLayout'
import { SeoHead } from '../components/layout/SeoHead'
import { PageHeader } from '../components/layout/PageHeader'
import { ROOMS, TIMER_SECONDS, TIME_TOKENS_START, WASTE_MAX } from '../lib/constants'

export function RulesPage() {
  return (
    <SiteLayout>
      <SeoHead title="Rules" description="Full PRR Online rulebook — rooms, dice, waste, delivery, and win conditions." path="/rules" />
      <PageHeader title="Rules" subtitle="Digital implementation of Pandemic: Rapid Response" />
      <article style={{ maxWidth: 720, margin: '0 auto', padding: '0 var(--gutter) 48px', color: 'var(--text-dim)', lineHeight: 1.6 }}>
        <h2 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}>Timer</h2>
        <p>Each round lasts {TIMER_SECONDS} seconds. All players act simultaneously. When the timer reaches 0:00, resolve waste and advance phase.</p>

        <h2 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', marginTop: 32 }}>Rooms</h2>
        <ul>
          {ROOMS.map((r) => (
            <li key={r.id}><strong style={{ color: 'var(--text)' }}>{r.name}</strong> — {r.supplyType ? `Create ${r.name} supplies from matching dice` : r.id === 'recycling' ? 'Reduce waste from unmatched dice' : r.id === 'cargo' ? 'Hold supplies for delivery' : 'Stores time tokens'}</li>
          ))}
        </ul>

        <h2 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', marginTop: 32 }}>Time Tokens</h2>
        <p>HQ starts with {TIME_TOKENS_START} tokens. Spend 1 per city delivery. Flight Planner can deliver to 2 cities per token when that role is in play.</p>

        <h2 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', marginTop: 32 }}>Waste</h2>
        <p>Shared waste track (max {WASTE_MAX}). One waste per unmatched die unless Recycler reduces it.</p>

        <h2 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', marginTop: 32 }}>Keyboard Shortcuts</h2>
        <ul>
          <li><kbd>Space</kbd> — Roll / primary action</li>
          <li><kbd>Enter</kbd> — Confirm / Submit</li>
          <li><kbd>Escape</kbd> — Close modal</li>
          <li><kbd>Arrow keys</kbd> — Select room</li>
        </ul>
      </article>
    </SiteLayout>
  )
}
