import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { SiteLayout } from '../components/layout/SiteLayout'
import { SeoHead } from '../components/layout/SeoHead'
import { Button } from '../components/ds/Button'
import { ROLES } from '../lib/constants'
import { Users, Clock, Zap, Shield } from 'lucide-react'

export function LandingPage() {
  return (
    <SiteLayout>
      <SeoHead
        title="PRR Online"
        description="Play Pandemic: Rapid Response online — real-time cooperative board game with 2–4 players, 7 roles, and 4 difficulty levels."
        path="/"
      />

      <section
        style={{
          maxWidth: 'var(--content-max)',
          margin: '0 auto',
          padding: '64px var(--gutter)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 48,
          alignItems: 'center',
        }}
      >
        <div>
          <img src="/logos/prr-full.svg" alt="Pandemic Rapid Response" style={{ maxWidth: 360, marginBottom: 24 }} />
          <p style={{ fontSize: 18, color: 'var(--text-dim)', lineHeight: 1.5, marginBottom: 32 }}>
            Real-time cooperative logistics under pressure. Roll dice, assign rooms,
            deliver supplies to 24 cities — before the timer runs out and waste overwhelms HQ.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/play" style={{ textDecoration: 'none' }}>
              <Button size="lg">Play Now</Button>
            </Link>
            <Link to="/how-to-play" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="lg">
                How to Play
              </Button>
            </Link>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 16 }}>
            Players online: coming soon
          </p>
        </div>
        <img
          src="/screenshots/board-preview.png"
          alt="PRR game board"
          style={{
            width: '100%',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--line)',
            boxShadow: 'var(--shadow-panel)',
          }}
          loading="eager"
        />
      </section>

      <section style={{ background: 'var(--bg-900)', padding: '48px var(--gutter)' }}>
        <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
          <h2 className="ds-label" style={{ marginBottom: 24 }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { step: '1', title: 'Roll', desc: 'All players roll 6 dice simultaneously' },
              { step: '2', title: 'Assign', desc: 'Match dice to supply rooms in real time' },
              { step: '3', title: 'Activate', desc: 'Create supply crates and manage waste' },
              { step: '4', title: 'Deliver', desc: 'Fly supplies to cities on the flightpath' },
            ].map((s) => (
              <div
                key={s.step}
                style={{
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 20,
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 700 }}>
                  {s.step}
                </span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, margin: '8px 0' }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-dim)', margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '48px var(--gutter)' }}>
        <h2 className="ds-label" style={{ marginBottom: 24 }}>Features</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <Feature icon={<Users size={24} />} title="2–4 Players" desc="Real-time multiplayer sync" />
          <Feature icon={<Clock size={24} />} title="2-Min Rounds" desc="Simultaneous chaotic play" />
          <Feature icon={<Zap size={24} />} title="7 Roles" desc="Unique abilities per specialist" />
          <Feature icon={<Shield size={24} />} title="4 Difficulties" desc="Easy through Heroic" />
        </div>
      </section>

      <section style={{ background: 'var(--bg-900)', padding: '48px var(--gutter)' }}>
        <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
          <h2 className="ds-label" style={{ marginBottom: 24 }}>Roles</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {ROLES.slice(0, 6).map((r) => (
              <div
                key={r.id}
                style={{
                  padding: 16,
                  background: 'var(--bg-panel)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--line)',
                }}
              >
                <strong style={{ fontFamily: 'var(--font-display)' }}>{r.name}</strong>
                <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: '6px 0 0' }}>{r.ability}</p>
              </div>
            ))}
          </div>
          <Link to="/roles" style={{ display: 'inline-block', marginTop: 16, color: 'var(--room-vaccine)' }}>
            View all roles →
          </Link>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'VideoGame',
            name: 'Pandemic Rapid Response Online',
            description: 'Real-time cooperative board game for 2-4 players',
            gamePlatform: 'Web browser',
            numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 4 },
            genre: 'Cooperative board game',
          }),
        }}
      />
    </SiteLayout>
  )
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: ReactNode
  title: string
  desc: string
}) {
  return (
    <div
      style={{
        padding: 20,
        background: 'var(--bg-panel)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--line)',
      }}
    >
      <div style={{ color: 'var(--accent)', marginBottom: 8 }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, margin: '0 0 6px' }}>{title}</h3>
      <p style={{ fontSize: 14, color: 'var(--text-dim)', margin: 0 }}>{desc}</p>
    </div>
  )
}
