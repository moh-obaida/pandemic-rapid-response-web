import { Badge } from './Badge'

const PLAYER_COLORS = [
  'var(--room-vaccine)',
  'var(--room-firstaid)',
  'var(--room-food)',
  'var(--room-power)',
]

interface RoleCardProps {
  role: string
  name?: string
  ability?: string
  playerIndex?: number
  active?: boolean
  compact?: boolean
}

export function RoleCard({
  role,
  name = '',
  ability = '',
  playerIndex = 0,
  active = false,
  compact = false,
}: RoleCardProps) {
  const color = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length]
  const initials = role
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (compact) {
    return <Badge tone={active ? 'active' : 'neutral'}>{role}</Badge>
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        background: 'var(--bg-panel)',
        border: active ? '2px solid var(--active)' : '1px solid var(--line)',
        borderLeft: `4px solid ${color}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: active ? 'var(--glow-active)' : 'var(--shadow-panel)',
        padding: 14,
        width: '100%',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          flexShrink: 0,
          borderRadius: 'var(--radius-md)',
          background: color,
          color: 'var(--text-on-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: 19,
        }}
      >
        {initials}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 17,
              color: 'var(--text)',
            }}
          >
            {role}
          </span>
          {active && <Badge tone="active">Your Turn</Badge>}
        </div>
        {name && (
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              color: 'var(--text-faint)',
            }}
          >
            {name}
          </div>
        )}
        {ability && (
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--text-dim)',
              marginTop: 6,
              lineHeight: 1.35,
            }}
          >
            {ability}
          </div>
        )}
      </div>
    </div>
  )
}
