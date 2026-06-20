import { ROLES } from '../../lib/constants'
import type { RoleId } from '../../types/board'
import { RoleCard as DSRoleCard } from '../ds/RoleCard'

interface RoleCardProps {
  roleId: RoleId
  compact?: boolean
  active?: boolean
  name?: string
}

export function RoleCard({
  roleId,
  compact,
  active,
  name,
}: RoleCardProps) {
  const role = ROLES.find((r) => r.id === roleId)
  if (!role) return null

  return (
    <DSRoleCard
      role={role.name}
      roleId={roleId}
      name={name}
      ability={compact ? '' : role.ability}
      active={active}
      compact={compact}
    />
  )
}
