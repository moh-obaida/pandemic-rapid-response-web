import { Link } from 'react-router-dom'
import { Button } from '../ds/Button'

interface MissionCtaBandProps {
  eyebrow?: string
  title?: string
  primaryLabel?: string
  primaryTo?: string
  secondaryLabel?: string
  secondaryTo?: string
}

export function MissionCtaBand({
  eyebrow = 'Launch clearance',
  title = 'Ready for launch?',
  primaryLabel = 'Start Mission',
  primaryTo = '/play',
  secondaryLabel,
  secondaryTo,
}: MissionCtaBandProps) {
  return (
    <section className="mission-cta-band">
      <p className="mission-section__eyebrow">{eyebrow}</p>
      <h2 className="mission-cta-band__title">{title}</h2>
      <div className="mission-cta-band__actions">
        <Link to={primaryTo} className="link-plain">
          <Button size="lg">{primaryLabel}</Button>
        </Link>
        {secondaryLabel && secondaryTo && (
          <Link to={secondaryTo} className="link-plain">
            <Button variant="secondary" size="lg">
              {secondaryLabel}
            </Button>
          </Link>
        )}
      </div>
    </section>
  )
}
