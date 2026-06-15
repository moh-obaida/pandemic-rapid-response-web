import { ROLES } from '../../lib/constants'
import type { RoleId } from '../../types/board'
import { RoleCard as DSRoleCard } from '../ds/RoleCard'

interface RoleCardProps {
  roleId: RoleId
  compact?: boolean
  playerIndex?: number
  active?: boolean
  name?: string
}

export function RoleCard({
  roleId,
  compact,
  playerIndex = 0,
  active,
  name,
}: RoleCardProps) {
  const role = ROLES.find((r) => r.id === roleId)
  if (!role) return null

  return (
    <DSRoleCard
      role={role.name}
      name={name}
      ability={compact ? '' : role.ability}
      playerIndex={playerIndex}
      active={active}
      compact={compact}
    />
  )
}
