import { SiteLayout } from '../components/layout/SiteLayout'
import { SeoHead } from '../components/layout/SeoHead'
import { PageHeader } from '../components/layout/PageHeader'
import { MissionCtaBand } from '../components/layout/MissionCtaBand'

const FAQ = [
  {
    q: 'How do I create or join a room?',
    a: 'Click Start Mission, enter your name, and Create Room. Share the room code with teammates so they can Join Room.',
  },
  {
    q: 'Which difficulty should we pick?',
    a: 'Easy: 2 cities visible, smallest city deck. Normal is the default. Veteran and Heroic add more visible cities and larger decks.',
  },
  {
    q: 'What happens if I disconnect?',
    a: 'Reconnect with the same browser session if possible. After 3 missed turns you may be removed from the game.',
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
      <SeoHead
        title="FAQ"
        description="Frequently asked questions about PRR Online multiplayer, difficulty, and troubleshooting."
        path="/faq"
      />
      <PageHeader
        eyebrow="Support desk"
        title="FAQ"
        subtitle="Multiplayer setup, difficulty, and troubleshooting"
      />
      <div className="mission-faq">
        {FAQ.map((item) => (
          <details key={item.q} className="mission-faq__item glass-panel">
            <summary className="mission-faq__question">{item.q}</summary>
            <p className="mission-faq__answer">{item.a}</p>
          </details>
        ))}
      </div>
      <MissionCtaBand
        title="Still ready to fly?"
        secondaryLabel="Mission Guide"
        secondaryTo="/how-to-play"
      />
    </SiteLayout>
  )
}
