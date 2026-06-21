import { Link } from 'react-router-dom'
import { Clock, Dices, Globe, Users } from 'lucide-react'
import { MissionPreview } from './MissionPreview'
import { MissionStepsStrip } from './MissionStepsStrip'
import { assetManifest } from '../../lib/assetManifest'

const FEATURE_CHIPS = [
  { icon: Users, label: '2–4 Players' },
  { icon: Clock, label: 'Real-Time Timer' },
  { icon: Globe, label: 'Online Rooms' },
  { icon: Dices, label: 'Dice Actions' },
] as const

export function LandingHero() {
  return (
    <section className="landing-hero" aria-labelledby="landing-headline">
      <img
        src={assetManifest.board.radar}
        alt=""
        className="landing-hero__radar"
        aria-hidden
        draggable={false}
      />
      <div className="landing-hero__glow landing-hero__glow--red" aria-hidden />
      <div className="landing-hero__glow landing-hero__glow--blue" aria-hidden />

      <div className="landing-hero__inner">
        <div className="landing-hero__grid">
          <div className="landing-hero__copy">
            <p className="landing-hero__label">Online co-op board game</p>
            <h1 id="landing-headline" className="landing-hero__headline">
              The clock is running.
              <br />
              Save the cities.
            </h1>
            <p className="landing-hero__lede">
              Roll dice, load the aircraft, and deliver emergency supplies before the next crisis
              hits.
            </p>

            <div className="landing-hero__actions">
              <Link to="/play" className="landing-hero__cta landing-hero__cta--primary link-plain" data-testid="landing-start-mission">
                Start Mission
              </Link>
              <Link to="/play?join=1" className="landing-hero__cta landing-hero__cta--secondary link-plain">
                Join Room
              </Link>
            </div>

            <ul className="landing-hero__chips" aria-label="Game features">
              {FEATURE_CHIPS.map(({ icon: Icon, label }) => (
                <li key={label} className="landing-hero__chip">
                  <Icon size={14} aria-hidden />
                  {label}
                </li>
              ))}
            </ul>

            <div className="landing-hero__status-panels">
              <div className="landing-hero__status-panel landing-hero__status-panel--timer">
                <span className="landing-hero__status-label">Mission Timer</span>
                <span className="landing-hero__status-value">01:24</span>
              </div>
              <div className="landing-hero__status-panel landing-hero__status-panel--room">
                <span className="landing-hero__status-label">Room Code</span>
                <span className="landing-hero__status-value landing-hero__status-value--mono">K7Q2M9</span>
              </div>
            </div>

            <div className="landing-hero__crisis" aria-hidden>
              <span className="landing-hero__crisis-label">Crisis imminent</span>
              <span className="landing-hero__crisis-meta">Threat level: severe</span>
            </div>
          </div>

          <div className="landing-hero__preview">
            <MissionPreview variant="hero" />
          </div>
        </div>

        <MissionStepsStrip />
      </div>
    </section>
  )
}
