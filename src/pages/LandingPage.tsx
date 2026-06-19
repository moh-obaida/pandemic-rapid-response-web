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

      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <img src="/logos/prr-full.svg" alt="Pandemic Rapid Response" className="hero-logo" />
            <h1 className="hero-headline">Real-Time Logistics Crisis</h1>
            <div className="hero-tagline">Medical chaos. Coordinated response. Two minutes to save them all.</div>
            <p className="hero-description">
              Lead your elite medical team through a global health crisis. Roll dice, coordinate resources, and deliver life-saving supplies to 24 cities before waste overwhelms your command center.
            </p>
            <div className="hero-buttons">
              <Link to="/play" style={{ textDecoration: 'none' }}>
                <Button size="lg">Play Now</Button>
              </Link>
              <Link to="/how-to-play" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" size="lg">
                  How to Play
                </Button>
              </Link>
            </div>
            <p className="hero-status">
              Join medical professionals in high-stakes cooperative play
            </p>
          </div>
          <img
            src="/screenshots/board-preview.png"
            alt="PRR game board"
            className="hero-image"
            loading="eager"
          />
        </div>
      </section>

      <section className="gameplay-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">The Protocol</h2>
            <p className="section-subtitle">Master the four-phase coordination system</p>
          </div>
          <div className="gameplay-grid">
            {[
              { step: '1', title: 'Roll', desc: 'All medical coordinators roll 6 dice simultaneously' },
              { step: '2', title: 'Assign', desc: 'Allocate dice to specialized supply rooms in real time' },
              { step: '3', title: 'Activate', desc: 'Process supplies and manage operational waste' },
              { step: '4', title: 'Deliver', desc: 'Deploy supplies to critical care locations worldwide' },
            ].map((s) => (
              <div key={s.step} className="gameplay-card">
                <span className="gameplay-step">{s.step}</span>
                <h3 className="gameplay-title">{s.title}</h3>
                <p className="gameplay-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Command Center Capabilities</h2>
            <p className="section-subtitle">Professional-grade multiplayer logistics system</p>
          </div>
          <div className="features-grid">
            <Feature icon={<Users size={24} />} title="2–4 Players" desc="Secure real-time team coordination" />
            <Feature icon={<Clock size={24} />} title="120-Second Rounds" desc="Intense synchronized operations" />
            <Feature icon={<Zap size={24} />} title="7 Specializations" desc="Unique tactical expertise per role" />
            <Feature icon={<Shield size={24} />} title="4 Difficulty Levels" desc="From training to heroic operations" />
          </div>
        </div>
      </section>

      <section className="roles-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Medical Specialists</h2>
            <p className="section-subtitle">Choose your expertise and lead the response</p>
          </div>
          <div className="roles-grid">
            {ROLES.slice(0, 6).map((r) => (
              <div key={r.id} className="role-card">
                <h3 className="role-name">{r.name}</h3>
                <p className="role-ability">{r.ability}</p>
              </div>
            ))}
          </div>
          <Link to="/roles" className="view-all-link">
            Explore all specialists →
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
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{desc}</p>
    </div>
  )
}
