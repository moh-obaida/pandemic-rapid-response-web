import { Syringe, Apple, Zap, Droplets, HeartPulse } from 'lucide-react'
import type { SupplyType } from '../../types/board'

const SUPPLY: Record<string, { color: string; Icon: typeof Syringe }> = {
  vaccine: { color: 'var(--room-vaccine)', Icon: Syringe },
  food: { color: 'var(--room-food)', Icon: Apple },
  power: { color: 'var(--room-power)', Icon: Zap },
  firstaid: { color: 'var(--room-firstaid)', Icon: HeartPulse },
  firstAid: { color: 'var(--room-firstaid)', Icon: HeartPulse },
  water: { color: 'var(--room-water)', Icon: Droplets },
}

interface SupplyCrateProps {
  type: SupplyType | string
  size?: number
  count?: number
  inCargo?: boolean
  onClick?: () => void
}

export function SupplyCrate({
  type,
  size = 44,
  count,
  inCargo,
  onClick,
}: SupplyCrateProps) {
  const key = type === 'firstAid' ? 'firstAid' : type
  const s = SUPPLY[key] || SUPPLY.vaccine
  const { Icon } = s

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className="animate-fade-in"
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: 'var(--radius-crate)',
        background: s.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-on-color)',
        boxShadow: inCargo ? 'var(--glow-valid)' : 'var(--shadow-piece)',
        cursor: onClick ? 'pointer' : 'default',
        outline: inCargo ? '2px solid var(--highlight)' : undefined,
      }}
    >
      <Icon size={size * 0.5} strokeWidth={2} />
      {count != null && (
        <span
          style={{
            position: 'absolute',
            bottom: -6,
            right: -6,
            minWidth: 18,
            height: 18,
            padding: '0 4px',
            borderRadius: '999px',
            background: 'var(--bg-900)',
            color: '#fff',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1.5px solid var(--bg-app)',
          }}
        >
          {count}
        </span>
      )}
    </div>
  )
}
