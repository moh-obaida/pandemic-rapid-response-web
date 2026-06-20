import type { RoleId } from '../../types/board'
import { roleImagePath } from '../../lib/assetManifest'
import { Badge } from './Badge'

interface RoleCardProps {
  role: string
  roleId: RoleId
  name?: string
  ability?: string
  active?: boolean
  compact?: boolean
}

export function RoleCard({
  role,
  roleId,
  name = '',
  ability = '',
  active = false,
  compact = false,
}: RoleCardProps) {
  const imgSrc = roleImagePath(roleId)

  if (compact) {
    return (
      <img
        src={imgSrc}
        alt={role}
        title={role}
        className="role-card-art__img"
        style={{ width: '2.75rem', borderRadius: '0.35rem' }}
        draggable={false}
        data-role-id={roleId}
      />
    )
  }

  return (
    <div
      className={['role-card-art', active ? 'role-card-art--active' : ''].filter(Boolean).join(' ')}
      data-role-id={roleId}
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        border: active ? '2px solid var(--active)' : '1px solid var(--line)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: active ? 'var(--glow-active)' : 'var(--shadow-panel)',
        padding: 0,
        width: '100%',
        overflow: 'hidden',
        background: 'var(--bg-panel)',
      }}
    >
      <img
        src={imgSrc}
        alt={role}
        className="role-card-art__img"
        style={{ width: '5.5rem', flexShrink: 0 }}
        draggable={false}
      />
      <div style={{ minWidth: 0, padding: '0.75rem 0.875rem 0.875rem 0' }}>
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
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-faint)' }}>
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
