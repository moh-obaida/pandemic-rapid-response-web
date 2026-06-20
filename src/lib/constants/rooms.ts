import type { RoomId, SupplyType } from '../../types/board'

/** Bidirectional room chain (Part 1.3). */
export const ROOM_ORDER: readonly RoomId[] = [
  'hq',
  'firstAid',
  'water',
  'vaccine',
  'food',
  'power',
  'recycling',
  'cargo',
] as const

export interface SupplyRoomGroups {
  groupSizes: readonly number[]
  /** Crate reward for each completed group level (highest completed group wins). */
  crateRewards: readonly number[]
}

export interface RecyclingRoomGroups {
  groupSizes: readonly number[]
  /** Waste marker reduction per completed group level (positive = move back). */
  wasteReduction: readonly number[]
}

export interface CargoRoomGroups {
  groupSizes: readonly number[]
  requiresPlaneFace: true
}

export interface HqRoomGroups {
  slots: number
}

export type RoomGroupDefinition =
  | ({ roomId: SupplyType } & SupplyRoomGroups)
  | ({ roomId: 'recycling' } & RecyclingRoomGroups)
  | ({ roomId: 'cargo' } & CargoRoomGroups)
  | ({ roomId: 'hq' } & HqRoomGroups)

export const ROOM_GROUPS = {
  firstAid: {
    roomId: 'firstAid',
    groupSizes: [1, 1, 1, 1, 1],
    crateRewards: [0, 0, 1, 2, 3],
  },
  vaccine: {
    roomId: 'vaccine',
    groupSizes: [1, 3, 1],
    crateRewards: [0, 2, 3],
  },
  water: {
    roomId: 'water',
    groupSizes: [2, 1, 2],
    crateRewards: [0, 2, 3],
  },
  power: {
    roomId: 'power',
    groupSizes: [3, 1, 1],
    crateRewards: [1, 2, 3],
  },
  food: {
    roomId: 'food',
    groupSizes: [1, 2, 2],
    crateRewards: [0, 1, 3],
  },
  recycling: {
    roomId: 'recycling',
    groupSizes: [1, 1, 1, 1, 1],
    wasteReduction: [0, 0, 1, 2, 4],
  },
  cargo: {
    roomId: 'cargo',
    groupSizes: [1],
    requiresPlaneFace: true as const,
  },
  hq: {
    roomId: 'hq',
    slots: 6,
  },
} as const satisfies Record<
  Exclude<RoomId, 'hq'> | 'hq',
  RoomGroupDefinition
>

export const SUPPLY_ROOM_FOR_TYPE: Record<SupplyType, RoomId> = {
  firstAid: 'firstAid',
  water: 'water',
  vaccine: 'vaccine',
  food: 'food',
  power: 'power',
}

const SUPPLY_ROOM_IDS = new Set<RoomId>(
  Object.values(SUPPLY_ROOM_FOR_TYPE) as RoomId[]
)

export function isSupplyRoom(roomId: RoomId): boolean {
  return SUPPLY_ROOM_IDS.has(roomId)
}

export function getAdjacentRooms(roomId: RoomId): RoomId[] {
  const index = ROOM_ORDER.indexOf(roomId)
  if (index === -1) return []

  const adjacent: RoomId[] = []
  if (index > 0) adjacent.push(ROOM_ORDER[index - 1])
  if (index < ROOM_ORDER.length - 1) adjacent.push(ROOM_ORDER[index + 1])
  return adjacent
}

/** Reward for the highest completed group in a supply room (Part 5). */
export function getSupplyRoomCrateReward(
  roomId: SupplyType,
  completedGroups: number
): number {
  const config = ROOM_GROUPS[roomId]
  if (!('crateRewards' in config)) return 0
  if (completedGroups <= 0) return 0
  const level = Math.min(completedGroups, config.crateRewards.length) - 1
  return config.crateRewards[level] ?? 0
}

/** Waste reduction for the highest completed group in recycling (Part 8). */
export function getRecyclingWasteReduction(completedGroups: number): number {
  const config = ROOM_GROUPS.recycling
  if (completedGroups <= 0) return 0
  const level = Math.min(completedGroups, config.wasteReduction.length) - 1
  return config.wasteReduction[level] ?? 0
}
