import { ROOM_ORDER, ROOM_GROUPS } from './constants/rooms'
import { canMove, canFly } from './engine/movement'
import { canAssignDie, countCompletedGroups } from './engine/rooms'
import { canDeliverAtPlane } from './engine/selectors'
import type { RoomId } from '../types/board'
import type { GameSnapshot } from '../types/engine'

export interface SlotTarget {
  roomId: RoomId
  slotIndex: number
}

export function getValidMoveRooms(
  snapshot: GameSnapshot,
  playerId: string,
  dieIds: string[]
): RoomId[] {
  if (dieIds.length === 0) return []
  return ROOM_ORDER.filter(
    (roomId) => canMove(snapshot, playerId, dieIds, roomId) === null
  )
}

export function getValidFlyDirections(
  snapshot: GameSnapshot,
  playerId: string,
  dieIds: string[]
): ('left' | 'right')[] {
  if (dieIds.length === 0) return []
  const dirs: ('left' | 'right')[] = []
  if (canFly(snapshot, playerId, dieIds, 'left') === null) dirs.push('left')
  if (canFly(snapshot, playerId, dieIds, 'right') === null) dirs.push('right')
  return dirs
}

export function getValidAssignSlots(
  snapshot: GameSnapshot,
  playerId: string,
  dieIds: string[]
): SlotTarget[] {
  if (dieIds.length === 0) return []

  const player = snapshot.players.find((p) => p.id === playerId)
  if (!player) return []

  const roomId = player.position
  const slots = snapshot.roomSlots[roomId] ?? []
  const targets: SlotTarget[] = []

  if (dieIds.length === 1) {
    for (let i = 0; i < slots.length; i++) {
      if (canAssignDie(snapshot, playerId, dieIds[0], roomId, i) === null) {
        targets.push({ roomId, slotIndex: i })
      }
    }
    return targets
  }

  if (player.role === 'supplySpecialist') {
    for (const dieId of dieIds) {
      for (let i = 0; i < slots.length; i++) {
        if (canAssignDie(snapshot, playerId, dieId, roomId, i) === null) {
          if (!targets.some((t) => t.slotIndex === i)) {
            targets.push({ roomId, slotIndex: i })
          }
        }
      }
    }
    return targets
  }

  const config = ROOM_GROUPS[roomId as keyof typeof ROOM_GROUPS]
  if (config && 'groupSizes' in config) {
    let offset = 0
    for (const size of config.groupSizes) {
      if (size === dieIds.length) {
        const group = slots.slice(offset, offset + size)
        if (group.every((s) => s === null)) {
          if (canAssignDie(snapshot, playerId, dieIds[0], roomId, offset) === null) {
            targets.push({ roomId, slotIndex: offset })
          }
        }
      }
      offset += size
    }
  }

  return targets
}

export function isSlotValidTarget(
  snapshot: GameSnapshot,
  playerId: string,
  dieIds: string[],
  roomId: RoomId,
  slotIndex: number
): boolean {
  return getValidAssignSlots(snapshot, playerId, dieIds).some(
    (t) => t.roomId === roomId && t.slotIndex === slotIndex
  )
}

export function canRoomActivate(
  snapshot: GameSnapshot,
  playerId: string,
  roomId: RoomId
): boolean {
  if (snapshot.turnStep !== 'useDice') return false
  const player = snapshot.players.find((p) => p.id === playerId)
  if (!player || player.position !== roomId) return false

  const slots = snapshot.roomSlots[roomId] ?? []

  if (roomId === 'cargo') {
    const hasPlane = slots.some((id) => {
      if (!id) return false
      return snapshot.dice.find((d) => d.id === id)?.face === 'plane'
    })
    return hasPlane
  }

  return countCompletedGroups(roomId, slots) > 0
}

export function isDeliveryReady(
  snapshot: GameSnapshot,
  playerId: string
): boolean {
  const player = snapshot.players.find((p) => p.id === playerId)
  if (!player || player.position !== 'cargo') return false
  return canDeliverAtPlane(snapshot)
}

export function roomAcceptsMove(
  snapshot: GameSnapshot,
  playerId: string,
  dieIds: string[],
  roomId: RoomId
): boolean {
  return getValidMoveRooms(snapshot, playerId, dieIds).includes(roomId)
}

export function roomAcceptsAssign(
  snapshot: GameSnapshot,
  playerId: string,
  dieIds: string[],
  roomId: RoomId
): boolean {
  return getValidAssignSlots(snapshot, playerId, dieIds).some((t) => t.roomId === roomId)
}
