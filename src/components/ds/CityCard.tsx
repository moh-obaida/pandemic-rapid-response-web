import { Check, Syringe, Apple, Zap, Droplets, HeartPulse } from 'lucide-react'
import type { SupplyType } from '../../types/board'
import { SUPPLY_LABELS } from '../../lib/constants'
import { abbreviateCity } from '../../lib/cityLabel'

const REGION_COLORS: Record<string, string> = {
  blue: 'var(--room-vaccine)',
  yellow: 'var(--room-food)',
  red: 'var(--room-firstaid)',
}

const SUPPLY_ICONS = {
  vaccine: Syringe,
  food: Apple,
  power: Zap,
  water: Droplets,
  firstAid: HeartPulse,
} as const

interface CityCardProps {
  city: string
  region?: string
  supplyNeeded: SupplyType
  current?: boolean
  delivered?: boolean
  compact?: boolean
  onClick?: () => void
}

export function CityCard({
  city,
  region = 'blue',
  supplyNeeded,
  current = false,
  delivered = false,
  compact = false,
  onClick,
}: CityCardProps) {
  const regionColor = REGION_COLORS[region] || 'var(--room-firstaid)'
  const Icon = SUPPLY_ICONS[supplyNeeded]
  const supplyColor = `var(--room-${supplyNeeded === 'firstAid' ? 'firstaid' : supplyNeeded})`

  if (compact) {
    const markerClass = [
      'city-card-compact__marker',
      current ? 'city-card-compact__marker--current' : '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        type="button"
        onClick={onClick}
        disabled={delivered}
        title={city}
        aria-label={`${city}, needs ${SUPPLY_LABELS[supplyNeeded]}${delivered ? ', delivered' : ''}`}
        className={[
          'city-card-compact',
          delivered ? 'city-card-compact--delivered' : '',
          onClick && !delivered ? 'city-card-compact--clickable' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div
          className={markerClass}
          style={{
            background: delivered ? 'var(--highlight)' : supplyColor,
          }}
        />
        <span className="city-card-compact__label">{abbreviateCity(city)}</span>
      </button>
    )
  }

  return (
    <div
      style={{
        width: 150,
        background: 'var(--bg-panel)',
        borderRadius: 'var(--radius-md)',
        border: current ? '2px solid var(--active)' : '1px solid var(--line)',
        boxShadow: current ? 'var(--glow-active)' : 'var(--shadow-panel)',
        borderTop: `4px solid ${regionColor}`,
        overflow: 'hidden',
        opacity: delivered ? 0.5 : 1,
        position: 'relative',
      }}
    >
      <div style={{ padding: '10px 12px' }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 16,
            color: 'var(--text)',
            lineHeight: 1.1,
          }}
        >
          {city}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, padding: '0 12px 12px' }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 5,
            background: supplyColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-on-color)',
          }}
        >
          <Icon size={16} strokeWidth={2} />
        </div>
      </div>
      {delivered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(20,24,31,0.55)',
          }}
        >
          <Check size={36} color="var(--highlight)" strokeWidth={2} />
        </div>
      )}
    </div>
  )
}
