import type { DieFace } from '../../lib/constants/dice'
import type { SupplyType } from '../../types/board'
import {
  cityImagePathById,
  crateImagePath,
  dieImagePath,
} from '../../lib/assetManifest'

const STEPS = [
  {
    num: 1,
    title: 'Roll Dice',
    desc: 'Use dice to move, fly, and act.',
    kind: 'dice' as const,
    faces: ['plane', 'water', 'food', 'power', 'vaccine', 'firstAid'] as DieFace[],
  },
  {
    num: 2,
    title: 'Activate Rooms',
    desc: 'Trigger room effects to power up.',
    kind: 'rooms' as const,
    crates: ['power', 'vaccine'] as SupplyType[],
  },
  {
    num: 3,
    title: 'Load Cargo',
    desc: 'Collect and load critical supplies.',
    kind: 'cargo' as const,
    crates: ['water', 'food', 'power', 'vaccine', 'firstAid'] as SupplyType[],
  },
  {
    num: 4,
    title: 'Deliver Supplies',
    desc: 'Deliver to cities before time runs out.',
    kind: 'deliver' as const,
    cityId: 10,
  },
]

function StepVisual({ step }: { step: (typeof STEPS)[number] }) {
  if (step.kind === 'dice') {
    return (
      <div className="landing-step__visual landing-step__visual--dice">
        {step.faces.map((face) => (
          <img key={face} src={dieImagePath(face)} alt="" draggable={false} />
        ))}
      </div>
    )
  }
  if (step.kind === 'rooms') {
    return (
      <div className="landing-step__visual landing-step__visual--rooms">
        {step.crates.map((type) => (
          <img key={type} src={crateImagePath(type)} alt="" draggable={false} />
        ))}
      </div>
    )
  }
  if (step.kind === 'cargo') {
    return (
      <div className="landing-step__visual landing-step__visual--cargo">
        {step.crates.map((type) => (
          <img key={type} src={crateImagePath(type)} alt="" draggable={false} />
        ))}
      </div>
    )
  }
  return (
    <div className="landing-step__visual landing-step__visual--deliver">
      <img src={cityImagePathById(step.cityId)} alt="" draggable={false} />
    </div>
  )
}

export function MissionStepsStrip() {
  return (
    <div className="landing-steps" aria-label="Mission steps">
      {STEPS.map((step) => (
        <article key={step.num} className="landing-step">
          <span className="landing-step__num">{step.num}</span>
          <StepVisual step={step} />
          <h3 className="landing-step__title">{step.title}</h3>
          <p className="landing-step__desc">{step.desc}</p>
        </article>
      ))}
    </div>
  )
}
