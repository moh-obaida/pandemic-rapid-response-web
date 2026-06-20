import type { DieFace } from '../constants/dice'
import { isCircledFace } from '../constants/dice'
import {
  ROOM_GROUPS,
  getSupplyRoomCrateReward,
  getRecyclingWasteReduction,
  isSupplyRoom,
} from '../constants/rooms'
import type { RoomId, SupplyType } from '../../types/board'
import type { EngineDie, GameSnapshot } from '../../types/engine'
import { transferCratesToCargo, hasCratesInCargo, transferCratesFromCargo } from './crates'
import { CITIES } from '../constants/cities'
import { WASTE_MAX } from '../constants/game'

const FACE_FOR_SUPPLY: Record<SupplyType, DieFace> = {
  water: 'water',
  food: 'food',
  power: 'power',
  vaccine: 'vaccine',
  firstAid: 'firstAid',
}

const SUPPLY_TYPE_FOR_ROOM: Partial<Record<RoomId, SupplyType>> = {
  firstAid: 'firstAid',
  water: 'water',
  vaccine: 'vaccine',
  food: 'food',
  power: 'power',
}

function getPlayer(state: GameSnapshot, playerId: string) {
  return state.players.find((p) => p.id === playerId)
}

function getDie(state: GameSnapshot, dieId: string) {
  return state.dice.find((d) => d.id === dieId)
}

function getDirectorId(state: GameSnapshot): string | undefined {
  return state.players.find((p) => p.role === 'director')?.id
}

function isDirectorHqDie(die: EngineDie): boolean {
  return die.location === 'hq'
}

function dieAvailableToPlayer(
  state: GameSnapshot,
  playerId: string,
  die: EngineDie
): boolean {
  if (die.locked) return false
  if (die.location === 'hand') {
    return die.ownerId === playerId
  }
  if (die.location === 'hq') {
    const player = getPlayer(state, playerId)
    return player?.position === 'hq'
  }
  return false
}

function groupContainingSlot(
  roomId: RoomId,
  slotIndex: number
): { offset: number; size: number } | null {
  const config = ROOM_GROUPS[roomId as keyof typeof ROOM_GROUPS]
  if (!config || !('groupSizes' in config)) return null
  let offset = 0
  for (const size of config.groupSizes) {
    if (slotIndex >= offset && slotIndex < offset + size) {
      return { offset, size }
    }
    offset += size
  }
  return null
}

function recyclerSkipApplies(state: GameSnapshot, playerId: string, roomId: RoomId): boolean {
  const player = getPlayer(state, playerId)
  return roomId === 'recycling' && player?.role === 'recycler'
}

export function countCompletedGroups(
  state: GameSnapshot,
  roomId: RoomId,
  playerId?: string
): number {
  const slots = state.roomSlots[roomId] ?? []
  const config = ROOM_GROUPS[roomId as keyof typeof ROOM_GROUPS]
  if (!config || !('groupSizes' in config)) return 0

  const recyclerGhost =
    roomId === 'recycling' &&
    playerId &&
    getPlayer(state, playerId)?.role === 'recycler'

  let completed = 0
  let offset = 0
  for (const size of config.groupSizes) {
    let groupComplete = true
    for (let i = 0; i < size; i++) {
      const slotIdx = offset + i
      if (recyclerGhost && slotIdx === 0) continue
      if (slots[slotIdx] === null) groupComplete = false
    }
    if (groupComplete) completed++
    offset += size
  }
  return completed
}

export function dieMatchesRoom(die: EngineDie, roomId: RoomId): boolean {
  if (roomId === 'cargo') return die.face === 'plane'
  if (roomId === 'recycling') return true
  if (roomId === 'hq') return true
  const supply = SUPPLY_TYPE_FOR_ROOM[roomId]
  return supply ? die.face === FACE_FOR_SUPPLY[supply] : false
}

export function canAssignDie(
  state: GameSnapshot,
  playerId: string,
  dieId: string,
  roomId: RoomId,
  slotIndex: number
): string | null {
  if (state.activePlayerId !== playerId) return 'Not your turn'
  if (state.turnStep !== 'useDice') return 'Roll dice first'
  const player = getPlayer(state, playerId)
  const die = getDie(state, dieId)
  if (!player || !die) return 'Invalid player or die'
  if (!dieAvailableToPlayer(state, playerId, die)) return 'Die not available'
  if (player.position !== roomId) return 'Must be in room to assign'

  const slots = state.roomSlots[roomId]
  if (!slots || slotIndex < 0 || slotIndex >= slots.length) return 'Invalid slot'

  if (slotIndex === 0 && recyclerSkipApplies(state, playerId, roomId)) {
    return 'Recycler skip: slot 0 auto-filled'
  }

  if (slots[slotIndex] !== null) return 'Slot occupied'

  const group = groupContainingSlot(roomId, slotIndex)
  if (
    player.role !== 'supplySpecialist' &&
    roomId !== 'recycling' &&
    roomId !== 'hq' &&
    roomId !== 'cargo' &&
    group &&
    group.size > 1
  ) {
    return 'Assign full group at once'
  }

  if (roomId === 'recycling') {
    const faces = new Set<DieFace>()
    for (let i = 0; i < slots.length; i++) {
      if (i === slotIndex) {
        faces.add(die.face)
        continue
      }
      const id = slots[i]
      if (id) {
        const d = getDie(state, id)
        if (d) {
          if (faces.has(d.face)) return 'Recycling requires all different icons'
          faces.add(d.face)
        }
      }
    }
  } else if (!dieMatchesRoom(die, roomId)) {
    return 'Die face does not match room'
  }

  return null
}

export function canAssignDiceGroup(
  state: GameSnapshot,
  playerId: string,
  roomId: RoomId,
  dieIds: string[],
  startSlot: number
): string | null {
  if (dieIds.length <= 1) {
    return dieIds[0]
      ? canAssignDie(state, playerId, dieIds[0], roomId, startSlot)
      : 'No dice selected'
  }

  if (state.activePlayerId !== playerId) return 'Not your turn'
  if (state.turnStep !== 'useDice') return 'Roll dice first'
  const player = getPlayer(state, playerId)
  if (!player || player.position !== roomId) return 'Must be in room to assign'

  const group = groupContainingSlot(roomId, startSlot)
  if (!group || group.offset !== startSlot || group.size !== dieIds.length) {
    return 'Invalid group assignment'
  }

  const slots = state.roomSlots[roomId] ?? []
  for (let i = 0; i < dieIds.length; i++) {
    const slotIndex = startSlot + i
    if (slotIndex === 0 && recyclerSkipApplies(state, playerId, roomId)) {
      return 'Recycler skip: slot 0 auto-filled'
    }
    if (slots[slotIndex] !== null) return 'Slot occupied'
    const die = getDie(state, dieIds[i])
    if (!die || !dieAvailableToPlayer(state, playerId, die)) {
      return 'Die not available'
    }
    if (roomId === 'recycling') {
      if (dieIds.slice(0, i).some((id) => getDie(state, id)?.face === die.face)) {
        return 'Recycling requires all different icons'
      }
    } else if (!dieMatchesRoom(die, roomId)) {
      return 'Die face does not match room'
    }
  }

  return null
}

export function assignDie(
  state: GameSnapshot,
  _playerId: string,
  dieId: string,
  roomId: RoomId,
  slotIndex: number
): void {
  const die = getDie(state, dieId)!
  if (isDirectorHqDie(die)) {
    const hqSlots = state.roomSlots.hq ?? []
    if (die.slotIndex !== undefined) hqSlots[die.slotIndex] = null
    const directorId = getDirectorId(state)
    if (directorId) die.ownerId = directorId
  }
  die.location = 'room'
  die.roomId = roomId
  die.slotIndex = slotIndex
  die.locked = true
  state.roomSlots[roomId]![slotIndex] = dieId
}

export function assignDiceGroup(
  state: GameSnapshot,
  playerId: string,
  roomId: RoomId,
  dieIds: string[],
  startSlot: number
): void {
  for (let i = 0; i < dieIds.length; i++) {
    assignDie(state, playerId, dieIds[i], roomId, startSlot + i)
  }
}

function clearRoomSlots(state: GameSnapshot, roomId: RoomId): void {
  const slots = state.roomSlots[roomId] ?? []
  for (let i = 0; i < slots.length; i++) {
    slots[i] = null
  }
}

function spendDiceFromRoom(state: GameSnapshot, dieIds: string[]): void {
  for (const id of dieIds) {
    const die = getDie(state, id)
    if (die) {
      if (die.location === 'hq') {
        const hqSlots = state.roomSlots.hq ?? []
        if (die.slotIndex !== undefined) hqSlots[die.slotIndex] = null
        const directorId = getDirectorId(state)
        if (directorId) die.ownerId = directorId
      }
      die.location = 'spent'
      die.locked = true
      die.roomId = undefined
      die.slotIndex = undefined
    }
  }
}

function clearCargoActivation(state: GameSnapshot, assignedIds: string[]): void {
  spendDiceFromRoom(state, assignedIds)
  clearRoomSlots(state, 'cargo')
}

export function activateRoom(
  state: GameSnapshot,
  playerId: string,
  roomId: RoomId
): string | null {
  if (state.activePlayerId !== playerId) return 'Not your turn'
  const player = getPlayer(state, playerId)
  if (!player || player.position !== roomId) return 'Must be in room'

  const slots = state.roomSlots[roomId] ?? []
  const completed = countCompletedGroups(state, roomId, playerId)
  const assignedIds = slots.filter(Boolean) as string[]

  if (roomId === 'cargo') {
    return activateCargo(state, assignedIds)
  }

  if (roomId === 'recycling') {
    const reduction = getRecyclingWasteReduction(completed)
    state.waste = Math.max(0, state.waste - reduction)
    spendDiceFromRoom(state, assignedIds)
    clearRoomSlots(state, roomId)
    return null
  }

  if (isSupplyRoom(roomId)) {
    const reward = getSupplyRoomCrateReward(roomId as SupplyType, completed)
    const supplyType = roomId as SupplyType
    transferCratesToCargo(state, supplyType, Math.min(reward, 3))

    const wasteDieIds = assignedIds.filter((id) => getDie(state, id) !== undefined)

    if (wasteDieIds.length > 0) {
      state.pendingWasteRoll = {
        roomId,
        dieIds: wasteDieIds,
        recyclerPlayerId: player.role === 'recycler' ? playerId : undefined,
      }
    } else {
      spendDiceFromRoom(state, assignedIds)
      clearRoomSlots(state, roomId)
    }
    return null
  }

  return 'Room cannot be activated'
}

function activateCargo(state: GameSnapshot, assignedIds: string[]): string | null {
  if (assignedIds.length === 0) return 'Assign plane die to cargo'

  const city = state.cities.find(
    (c) => c.cityIndex === state.planePosition && c.status === 'faceUpOnPath'
  )

  if (city && city.blockers.length > 0) {
    const blocker = city.blockers[city.blockers.length - 1]
    const blockerType = blocker.supplyType
    if (blockerType && hasCratesInCargo(state, { [blockerType]: 1 })) {
      transferCratesFromCargo(state, { [blockerType]: 1 })
      city.blockers.pop()
      clearCargoActivation(state, assignedIds)
      return null
    }
  }

  if (!city) {
    clearCargoActivation(state, assignedIds)
    return null
  }

  if (city.blockers.length > 0) {
    clearCargoActivation(state, assignedIds)
    return null
  }

  const req = CITIES[city.cityIndex].crates
  if (!hasCratesInCargo(state, req)) {
    clearCargoActivation(state, assignedIds)
    return null
  }

  transferCratesFromCargo(state, req)
  if (state.supplyTokens > 0) {
    state.supplyTokens -= 1
    state.hqTokens += 1
  }
  city.status = 'delivered'
  clearCargoActivation(state, assignedIds)
  checkWin(state)
  return null
}

export function resolveWasteRoll(
  state: GameSnapshot,
  dieRolls: Record<string, DieFace>,
  excludedDieId?: string
): string | null {
  const pending = state.pendingWasteRoll
  if (!pending) return 'No pending waste roll'

  const exclude = excludedDieId ?? pending.excludedDieId

  let wasteAdded = 0
  for (const dieId of pending.dieIds) {
    if (exclude && dieId === exclude) continue
    const face = dieRolls[dieId] ?? getDie(state, dieId)?.face
    if (face && isCircledFace(face)) wasteAdded++
  }

  state.waste = Math.min(WASTE_MAX, state.waste + wasteAdded)
  if (state.waste >= WASTE_MAX) {
    state.result = 'lose'
    state.timerRunning = false
  }

  const allRoomDieIds = (state.roomSlots[pending.roomId] ?? []).filter(Boolean) as string[]
  spendDiceFromRoom(state, allRoomDieIds)
  clearRoomSlots(state, pending.roomId)
  state.pendingWasteRoll = null
  return null
}

export function checkWin(state: GameSnapshot): void {
  const pathClear = state.cities.every((c) => c.status !== 'faceUpOnPath')
  const deckEmpty = state.cityDeck.length === 0
  if (pathClear && deckEmpty) {
    state.result = 'win'
    state.timerRunning = false
  }
}

export function getRoomFaceRequirement(roomId: RoomId): DieFace | null {
  const supply = SUPPLY_TYPE_FOR_ROOM[roomId]
  return supply ? FACE_FOR_SUPPLY[supply] : roomId === 'cargo' ? 'plane' : null
}

export { dieAvailableToPlayer, isDirectorHqDie }
