import {
  Syringe,
  Apple,
  Zap,
  Droplets,
  HeartPulse,
  Lock,
  type LucideIcon,
} from 'lucide-react'
import type { SupplyType } from '../../types/board'
import { SUPPLY_LABELS } from '../../lib/constants'

const SUPPLY_ICONS: Record<SupplyType, LucideIcon> = {
  vaccine: Syringe,
  food: Apple,
  power: Zap,
  water: Droplets,
  firstAid: HeartPulse,
}

const SUPPLY_CSS: Record<SupplyType, string> = {
  vaccine: 'var(--room-vaccine)',
  food: 'var(--room-food)',
  power: 'var(--room-power)',
  water: 'var(--room-water)',
  firstAid: 'var(--room-firstaid)',
}

interface DieProps {
  supplyType: SupplyType
  size?: number
  selected?: boolean
  locked?: boolean
  rolling?: boolean
  onClick?: () => void
}

export function Die({
  supplyType,
  size = 52,
  selected = false,
  locked = false,
  rolling = false,
  onClick,
}: DieProps) {
  const Icon = SUPPLY_ICONS[supplyType]
  const color = SUPPLY_CSS[supplyType]
  let glow = 'var(--shadow-piece)'
  if (selected) glow = 'var(--glow-active), var(--shadow-piece-lift)'
  if (locked) glow = 'var(--shadow-xs)'

  return (
    <button
      type="button"
      onClick={locked ? undefined : onClick}
      disabled={locked}
      aria-label={`${SUPPLY_LABELS[supplyType]} die${locked ? ', locked' : ''}`}
      className={rolling ? 'animate-dice-roll' : ''}
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: 'var(--radius-die)',
        background: 'var(--bg-raised)',
        border: `2px solid ${selected ? 'var(--active)' : 'var(--line-strong)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        boxShadow: glow,
        cursor: locked ? 'default' : 'pointer',
        opacity: locked ? 0.6 : 1,
        transition: 'all var(--dur-fast) var(--ease-snap)',
        padding: 0,
      }}
    >
      <Icon size={size * 0.46} strokeWidth={2} />
      {locked && (
        <Lock
          size={14}
          style={{
            position: 'absolute',
            top: -7,
            right: -7,
            color: 'var(--text-faint)',
            background: 'var(--bg-app)',
            borderRadius: '999px',
            padding: 2,
          }}
        />
      )}
    </button>
  )
}
