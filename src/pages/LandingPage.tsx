import { Link } from 'react-router-dom'
import { SiteLayout } from '../components/layout/SiteLayout'
import { SeoHead } from '../components/layout/SeoHead'
import { Button } from '../components/ds/Button'
import { MissionPreview } from '../components/landing/MissionPreview'
import { ROLES } from '../lib/constants'
import { assetManifest, cityImagePathById } from '../lib/assetManifest'

const STEPS = [
  { num: '01', title: 'Roll dice', desc: 'Assign rolled dice to supply rooms on the aircraft.' },
  { num: '02', title: 'Move through rooms', desc: 'Spend dice to move crew and position for loading.' },
  { num: '03', title: 'Load cargo', desc: 'Activate rooms to pull crates into the limited cargo bay.' },
  { num: '04', title: 'Fly and deliver', desc: 'Spend plane dice along the flightpath. Match each city exactly.' },
]

const PRESSURE = [
  {
    title: 'City cards',
    desc: 'New cities appear as the timer runs out.',
    img: cityImagePathById(3),
  },
  {
    title: 'Cargo bay',
    desc: 'Space is limited — load the right mix before you fly.',
    img: assetManifest.crates.vaccine,
  },
  {
    title: 'HQ tokens',
    desc: 'HQ time tokens keep the mission alive when the clock hits zero.',
    img: assetManifest.tokens.timeToken,
  },
  {
    title: 'Waste track',
    desc: 'Unmatched dice fill waste. Hit the limit and the mission ends.',
    img: assetManifest.tokens.wasteMarker,
  },
  {
    title: 'Mission timer',
    desc: 'Two minutes per round. Pressure never stops.',
    img: null,
    timer: true,
  },
]

export function LandingPage() {
  return (
    <SiteLayout>
      <SeoHead
        title="Mission Briefing"
        description="Cooperative aircraft logistics board game for 2–4 players."
        path="/"
      />

      {/* 1. Mission Briefing Hero */}
      <section className="mission-hero mission-hero--cinematic">
        <div>
          <div className="mission-hero__status">
            <span className="mission-hero__status-dot" aria-hidden />
            Mission briefing
          </div>
          <h1 className="mission-hero__headline">
            The clock is running.
            <br />
            <em>Load the plane. Deliver the supplies.</em>
            <br />
            Save the cities.
          </h1>
          <p className="mission-hero__lede">
            Operate a rapid-response aircraft with your crew. The board is the table — not a web form.
          </p>
          <div className="mission-hero__actions">
            <Link to="/play" style={{ textDecoration: 'none' }}>
              <Button size="lg">Start Mission</Button>
            </Link>
            <Link to="/play?join=1" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="lg">
                Join Room
              </Button>
            </Link>
            <Link to="/rules" style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="lg">
                View Rules
              </Button>
            </Link>
          </div>
        </div>
        <div className="mission-hero__visual mission-hero__visual--large">
          <MissionPreview large />
        </div>
      </section>

      {/* 2. Live Board Preview */}
      <section className="mission-section mission-section--board">
        <div className="mission-board-preview">
          <div className="mission-board-preview__visual">
            <img
              src={assetManifest.board.planeBoard}
              alt="PRR aircraft board with supply rooms, cargo bay, and flightpath"
              className="mission-board-preview__img"
            />
          </div>
          <div className="mission-board-preview__copy">
            <p className="mission-section__eyebrow">Live board</p>
            <h2 className="mission-section__title">Digital aircraft command table</h2>
            <p className="mission-section__subtitle">
              A real-time cooperative mission played on a digital aircraft board. Click rooms, assign
              dice, load crates, and fly the flightpath — together.
            </p>
          </div>
        </div>
      </section>

      {/* 3. How the Mission Works */}
      <section className="mission-section mission-section--tight">
        <p className="mission-section__eyebrow">Operations protocol</p>
        <h2 className="mission-section__title">How the mission works</h2>
        <div className="mission-steps">
          {STEPS.map((s) => (
            <article key={s.num} className="mission-step glass-panel">
              <span className="mission-step__num">{s.num}</span>
              <h3 className="mission-step__title">{s.title}</h3>
              <p className="mission-step__desc">{s.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 4. Crew Roles */}
      <section className="mission-section">
        <p className="mission-section__eyebrow">Crew manifest</p>
        <h2 className="mission-section__title">Crew roles</h2>
        <p className="mission-section__subtitle">
          Each crew member has a unique ability. Roles are assigned randomly at launch.
        </p>
        <div className="mission-roles">
          {ROLES.map((r) => (
            <Link key={r.id} to="/roles" className="mission-role-card" title={r.name}>
              <img
                src={assetManifest.cards.roles[r.id]}
                alt={r.name}
                className="mission-role-card__img"
                loading="lazy"
              />
              <div className="mission-role-card__name">{r.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Cities, Cargo, and Timer */}
      <section className="mission-section mission-section--tight">
        <p className="mission-section__eyebrow">Mission pressure</p>
        <h2 className="mission-section__title">Cities, cargo, and timer</h2>
        <p className="mission-section__subtitle">
          Cities appear as the timer runs out. Cargo space is limited. HQ time tokens keep the mission
          alive. Waste can end the game.
        </p>
        <div className="mission-pressure">
          {PRESSURE.map((item) => (
            <article key={item.title} className="mission-pressure__item glass-panel">
              <div className="mission-pressure__visual">
                {item.timer ? (
                  <span className="mission-pressure__timer">02:00</span>
                ) : (
                  <img src={item.img!} alt="" className="mission-pressure__icon" />
                )}
              </div>
              <h3 className="mission-pressure__title">{item.title}</h3>
              <p className="mission-pressure__desc">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 6. Create or Join Room */}
      <section className="mission-section">
        <div className="mission-multi">
          <div>
            <p className="mission-section__eyebrow">Mission access</p>
            <h2 className="mission-section__title">Create or join room</h2>
            <p className="mission-section__subtitle">
              Create a private mission room. Share the room code. Start when the crew is ready.
            </p>
            <div className="mission-hero__actions">
              <Link to="/play?create=1" style={{ textDecoration: 'none' }}>
                <Button size="lg">Create Room</Button>
              </Link>
              <Link to="/play?join=1" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" size="lg">
                  Join with Code
                </Button>
              </Link>
            </div>
          </div>
          <div className="mission-multi__aside glass-panel">
            <p className="mission-multi__label">Example room code</p>
            <p className="mission-multi__code">7KQ2</p>
            <p className="mission-multi__hint">Share this code with up to 3 crew members.</p>
          </div>
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="mission-cta-band">
        <p className="mission-section__eyebrow">Launch clearance</p>
        <h2 className="mission-cta-band__title">Ready for launch?</h2>
        <Link to="/play" style={{ textDecoration: 'none' }}>
          <Button size="lg">Start Mission</Button>
        </Link>
      </section>
    </SiteLayout>
  )
}
