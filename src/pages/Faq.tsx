import { SiteLayout } from '../components/layout/SiteLayout'
import { SeoHead } from '../components/layout/SeoHead'
import { PageHeader } from '../components/layout/PageHeader'

const FAQ = [
  {
    q: 'How do I create or join a room?',
    a: 'Click Play Now, enter your name, pick a role, and Create Room. Share the 6-character code with teammates so they can Join Room.',
  },
  {
    q: 'Which difficulty should we pick?',
    a: 'Easy: 2 cities visible, smallest city deck. Normal is the default. Veteran and Heroic add more visible cities and larger decks.',
  },
  {
    q: 'What happens if I disconnect?',
    a: 'Reconnect with the same browser session if possible. After 3 missed turns you may be removed from the game. AFK handling is host-configurable in a future update.',
  },
  {
    q: 'Why does the game say "Local mode"?',
    a: 'Firebase is not configured. Copy .env.example to .env and add your Realtime Database credentials for online multiplayer.',
  },
  {
    q: 'Game connection lost — what now?',
    a: 'Check your network. The app will attempt to resync when Firebase reconnects. Refresh only as a last resort.',
  },
]

export function FaqPage() {
  return (
    <SiteLayout>
      <SeoHead title="FAQ" description="Frequently asked questions about PRR Online multiplayer, difficulty, and troubleshooting." path="/faq" />
      <PageHeader title="FAQ" />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 var(--gutter) 48px' }}>
        {FAQ.map((item) => (
          <details
            key={item.q}
            style={{
              marginBottom: 12,
              background: 'var(--bg-panel)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
            }}
          >
            <summary style={{ fontFamily: 'var(--font-display)', fontWeight: 700, cursor: 'pointer', color: 'var(--text)' }}>
              {item.q}
            </summary>
            <p style={{ color: 'var(--text-dim)', fontSize: 14, margin: '12px 0 0', lineHeight: 1.5 }}>{item.a}</p>
          </details>
        ))}
      </div>
    </SiteLayout>
  )
}
