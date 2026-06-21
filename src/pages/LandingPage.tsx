import { Link } from 'react-router-dom'
import { SiteLayout } from '../components/layout/SiteLayout'
import { SeoHead } from '../components/layout/SeoHead'
import { Button } from '../components/ds/Button'
import { MissionCtaBand } from '../components/layout/MissionCtaBand'
import { MissionPreview } from '../components/landing/MissionPreview'
import { RoleDeckShowcase } from '../components/landing/RoleDeckShowcase'
import { BoardTableImage } from '../components/landing/BoardTableFrame'
import { ROLES } from '../lib/constants'
import type { DieFace } from '../lib/constants/dice'
import {
  assetManifest,
  cityImagePathById,
  dieImagePath,
  crateImagePath,
} from '../lib/assetManifest'

const STEPS: Array<{
  num: string
  title: string
  desc: string
  visual: 'dice' | 'rooms' | 'cargo' | 'deliver'
  faces?: DieFace[]
}> = [
  {
    num: '01',
    title: 'Roll dice',
    desc: 'Assign rolled dice to supply rooms on the aircraft.',
    visual: 'dice',
    faces: ['plane', 'water', 'food'],
  },
  {
    num: '02',
    title: 'Move through rooms',
    desc: 'Spend dice to move crew through the aircraft chain.',
    visual: 'rooms',
  },
  {
    num: '03',
    title: 'Load cargo',
    desc: 'Activate rooms to pull crates into the limited cargo bay.',
    visual: 'cargo',
  },
  {
    num: '04',
    title: 'Fly and deliver',
    desc: 'Spend plane dice along the flightpath. Match each city exactly.',
    visual: 'deliver',
  },
]

const CALLOUTS = [
  {
    title: 'Click rooms',
    desc: 'Select supply rooms, cargo bay, and HQ directly on the board.',
  },
  {
    title: 'Assign dice',
    desc: 'Drop dice into room slots that match their supply face.',
  },
  {
    title: 'Load cargo',
    desc: 'Activate completed groups to fill the bay before you fly.',
  },
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

function StepVisual({
  visual,
  faces,
}: {
  visual: (typeof STEPS)[number]['visual']
  faces?: DieFace[]
}) {
  if (visual === 'dice' && faces) {
    return (
      <div className="mission-step__visual mission-step__visual--dice">
        {faces.map((face) => (
          <img key={face} src={dieImagePath(face)} alt="" draggable={false} />
        ))}
      </div>
    )
  }
  if (visual === 'rooms') {
    return (
      <div className="mission-step__visual mission-step__visual--rooms" aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </div>
    )
  }
  if (visual === 'cargo') {
    return (
      <div className="mission-step__visual mission-step__visual--cargo">
        {(['water', 'food', 'vaccine'] as const).map((type) => (
          <img key={type} src={crateImagePath(type)} alt="" draggable={false} />
        ))}
      </div>
    )
  }
  return (
    <div className="mission-step__visual mission-step__visual--deliver">
      <img src={cityImagePathById(8)} alt="" className="mission-step__city" draggable={false} />
      <img src={dieImagePath('plane')} alt="" className="mission-step__plane" draggable={false} />
    </div>
  )
}

export function LandingPage() {
  return (
    <SiteLayout>
      <SeoHead
        title="Mission Briefing"
        description="Cooperative aircraft logistics board game for 2–4 players."
        path="/"
      />

      <section className="mission-hero mission-hero--composed">
        <div className="mission-hero__copy">
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
            Operate a rapid-response aircraft with your crew. The board is the table — not a web
            form.
          </p>
          <div className="mission-hero__actions">
            <Link to="/play" className="link-plain" data-testid="landing-start-mission">
              <Button size="lg">Start Mission</Button>
            </Link>
            <Link to="/play?join=1" className="link-plain">
              <Button variant="secondary" size="lg">
                Join Room
              </Button>
            </Link>
            <Link to="/rules" className="link-plain">
              <Button variant="ghost" size="lg">
                View Rules
              </Button>
            </Link>
          </div>
        </div>
        <div className="mission-hero__visual">
          <MissionPreview variant="hero" />
        </div>
      </section>

      <section className="mission-section mission-section--board">
        <div className="mission-board-preview">
          <div className="mission-board-preview__visual">
            <BoardTableImage
              src={assetManifest.board.planeBoard}
              alt="PRR aircraft command table"
              className="mission-board-preview__frame"
            />
          </div>
          <div className="mission-board-preview__copy">
            <p className="mission-section__eyebrow">Live board</p>
            <h2 className="mission-section__title">Digital aircraft command table</h2>
            <p className="mission-section__subtitle mission-section__subtitle--tight">
              A real-time cooperative mission on a digital aircraft board — click, assign, load,
              and fly together.
            </p>
            <ul className="mission-callouts">
              {CALLOUTS.map((item) => (
                <li key={item.title} className="mission-callout glass-panel">
                  <h3 className="mission-callout__title">{item.title}</h3>
                  <p className="mission-callout__desc">{item.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mission-section mission-section--tight">
        <p className="mission-section__eyebrow">Operations protocol</p>
        <h2 className="mission-section__title">How the mission works</h2>
        <div className="mission-steps mission-steps--visual">
          {STEPS.map((s) => (
            <article key={s.num} className="mission-step mission-step--visual glass-panel">
              <StepVisual visual={s.visual} faces={s.faces} />
              <span className="mission-step__num">{s.num}</span>
              <h3 className="mission-step__title">{s.title}</h3>
              <p className="mission-step__desc">{s.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mission-section mission-section--roles">
        <p className="mission-section__eyebrow">Crew manifest</p>
        <h2 className="mission-section__title">Crew roles</h2>
        <p className="mission-section__subtitle mission-section__subtitle--tight">
          Each crew member has a unique ability. Roles are assigned randomly at launch —{' '}
          {ROLES.length} specialists in the deck.
        </p>
        <RoleDeckShowcase />
      </section>

      <section className="mission-section mission-section--tight">
        <p className="mission-section__eyebrow">Mission pressure</p>
        <h2 className="mission-section__title">Cities, cargo, and timer</h2>
        <div className="mission-pressure">
          {PRESSURE.map((item) => (
            <article key={item.title} className="mission-pressure__item glass-panel">
              <div className="mission-pressure__visual">
                {'timer' in item && item.timer ? (
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

      <section className="mission-section mission-section--tight">
        <div className="mission-multi">
          <div>
            <p className="mission-section__eyebrow">Mission access</p>
            <h2 className="mission-section__title">Create or join room</h2>
            <p className="mission-section__subtitle mission-section__subtitle--tight">
              Create a private mission room. Share the room code. Start when the crew is ready.
            </p>
            <div className="mission-hero__actions">
              <Link to="/play?create=1" className="link-plain">
                <Button size="lg">Create Room</Button>
              </Link>
              <Link to="/play?join=1" className="link-plain">
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

      <MissionCtaBand />
    </SiteLayout>
  )
}
