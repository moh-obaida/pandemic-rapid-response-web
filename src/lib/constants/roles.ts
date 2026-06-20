import type { RoleId, RoomId } from '../../types/board'

export interface RoleDefinition {
  id: RoleId
  name: string
  description: string
  /** Exact ability text from the physical role card (Part 1.2). */
  ability: string
  startingRoom: RoomId
  /** Extra rerolls beyond BASE_REROLLS (Analyst only). */
  rerollBonus: number
}

export const ROLES: readonly RoleDefinition[] = [
  {
    id: 'analyst',
    name: 'Analyst',
    description: 'Data-driven strategist',
    ability: 'You can reroll your dice up to 2 additional times each turn.',
    startingRoom: 'cargo',
    rerollBonus: 2,
  },
  {
    id: 'technician',
    name: 'Technician',
    description: 'Precision operator',
    ability: 'When you spend a die to move, you may move 1 additional room.',
    startingRoom: 'firstAid',
    rerollBonus: 0,
  },
  {
    id: 'engineer',
    name: 'Engineer',
    description: 'Systems modifier',
    ability: 'You can turn your dice showing ✈️ to any other side.',
    startingRoom: 'food',
    rerollBonus: 0,
  },
  {
    id: 'flightPlanner',
    name: 'Flight Planner',
    description: 'Route optimizer',
    ability:
      'When you spend a die to fly, you may move the plane 1 additional city.',
    startingRoom: 'power',
    rerollBonus: 0,
  },
  {
    id: 'director',
    name: 'Director',
    description: 'Command authority',
    ability:
      "During your turn, you can place 1 of your dice in HQ. During any other player's turn, they can assign that die to their room or spend it to move or fly.",
    startingRoom: 'water',
    rerollBonus: 0,
  },
  {
    id: 'recycler',
    name: 'Recycler',
    description: 'Waste reducer',
    ability:
      'When you activate a supply room, roll 1 fewer die to generate waste. When you assign dice in the recycling center, skip the first space.',
    startingRoom: 'recycling',
    rerollBonus: 0,
  },
  {
    id: 'supplySpecialist',
    name: 'Supply Specialist',
    description: 'Logistics expert',
    ability:
      'You can assign dice to die spaces as if the spaces were not grouped.',
    startingRoom: 'vaccine',
    rerollBonus: 0,
  },
] as const

export function getRoleById(roleId: RoleId): RoleDefinition | undefined {
  return ROLES.find((r) => r.id === roleId)
}

export function getRoleStartingRoom(roleId: RoleId): RoomId {
  return getRoleById(roleId)?.startingRoom ?? 'hq'
}
