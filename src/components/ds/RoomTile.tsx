import type { ReactNode } from 'react'
import {
  Building2,
  Syringe,
  Apple,
  Zap,
  Droplets,
  HeartPulse,
  Recycle,
  Package,
} from 'lucide-react'
import type { RoomId } from '../../types/board'

const ROOMS: Record<
  RoomId,
  { color: string; Icon: typeof Building2; label: string }
> = {
  hq: { color: 'var(--room-hq)', Icon: Building2, label: 'HQ' },
  vaccine: { color: 'var(--room-vaccine)', Icon: Syringe, label: 'Vaccine Lab' },
  food: { color: 'var(--room-food)', Icon: Apple, label: 'Food Stores' },
  power: { color: 'var(--room-power)', Icon: Zap, label: 'Power' },
  firstAid: { color: 'var(--room-firstaid)', Icon: HeartPulse, label: 'First Aid' },
  water: { color: 'var(--room-water)', Icon: Droplets, label: 'Water' },
  recycling: { color: 'var(--room-recycling)', Icon: Recycle, label: 'Recycling' },
  cargo: { color: 'var(--room-cargo)', Icon: Package, label: 'Cargo Bay' },
}

interface RoomTileProps {
  room: RoomId
  valid?: boolean
  active?: boolean
  children?: ReactNode
  onClick?: () => void
}

export function RoomTile({
  room,
  valid = false,
  active = false,
  children,
  onClick,
}: RoomTileProps) {
  const r = ROOMS[room]
  let ring = '1px solid var(--line)'
  let shadow = 'none'
  if (valid) {
    ring = '2px solid var(--highlight)'
    shadow = 'var(--glow-valid)'
  }
  if (active) {
    ring = '2px solid var(--active)'
    shadow = 'var(--glow-active)'
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={r.label}
      style={{
        background: 'var(--bg-panel)',
        border: ring,
        borderRadius: 'var(--radius-md)',
        boxShadow: shadow,
        padding: '10px 12px',
        minHeight: 92,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        cursor: onClick ? 'pointer' : 'default',
        borderTop: `3px solid ${r.color}`,
        transition: 'box-shadow var(--dur-med)',
        textAlign: 'left',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <r.Icon size={18} color={r.color} strokeWidth={2} />
        <span className="ds-label" style={{ color: 'var(--text-dim)' }}>
          {r.label}
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          flex: 1,
          alignItems: 'center',
        }}
      >
        {children}
      </div>
    </button>
  )
}

export { ROOMS as DS_ROOMS }
