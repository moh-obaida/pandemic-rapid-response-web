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

export function dieMatchesRoom(die: EngineDie, roomId: RoomId): boolean {
  if (roomId === 'cargo') return die.face === 'plane'
  if (roomId === 'recycling') return true
  if (roomId === 'hq') return true
  const supply = SUPPLY_TYPE_FOR_ROOM[roomId]
  return supply ? die.face === FACE_FOR_SUPPLY[supply] : false
}

function getPlayer(state: GameSnapshot, playerId: string) {
  return state.players.find((p) => p.id === playerId)
}

function getDie(state: GameSnapshot, dieId: string) {
  return state.dice.find((d) => d.id === dieId)
}

function countCompletedGroups(roomId: RoomId, slots: (string | null)[]): number {
  const config = ROOM_GROUPS[roomId as keyof typeof ROOM_GROUPS]
  if (!config || !('groupSizes' in config)) return 0

  let completed = 0
  let offset = 0
  for (const size of config.groupSizes) {
    const group = slots.slice(offset, offset + size)
    if (group.every((s) => s !== null)) completed++
    offset += size
  }
  return completed
}

function recyclerSkipApplies(state: GameSnapshot, playerId: string, roomId: RoomId): boolean {
  const player = getPlayer(state, playerId)
  return roomId === 'recycling' && player?.role === 'recycler'
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
  if (die.ownerId !== playerId || die.location !== 'hand' || die.locked)
    return 'Die not available'
  if (player.position !== roomId) return 'Must be in room to assign'

  const slots = state.roomSlots[roomId]
  if (!slots || slotIndex < 0 || slotIndex >= slots.length)
    return 'Invalid slot'

  if (slotIndex === 0 && recyclerSkipApplies(state, playerId, roomId)) {
    return 'Recycler skip: slot 0 auto-filled'
  }

  if (slots[slotIndex] !== null) return 'Slot occupied'

  if (player.role !== 'supplySpecialist' && roomId !== 'recycling') {
    const config = ROOM_GROUPS[roomId as keyof typeof ROOM_GROUPS]
    if (config && 'groupSizes' in config) {
      let offset = 0
      for (const size of config.groupSizes) {
        const groupEnd = offset + size
        if (slotIndex >= offset && slotIndex < groupEnd) {
          for (let i = offset; i < groupEnd; i++) {
            if (i !== slotIndex && slots[i] === null) {
              return 'Must fill group completely (except Supply Specialist)'
            }
          }
          break
        }
        offset += size
      }
    }
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

export function assignDie(
  state: GameSnapshot,
  _playerId: string,
  dieId: string,
  roomId: RoomId,
  slotIndex: number
): void {
  const die = getDie(state, dieId)!
  die.location = 'room'
  die.roomId = roomId
  die.slotIndex = slotIndex
  die.locked = true
  state.roomSlots[roomId]![slotIndex] = dieId
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
      die.location = 'spent'
      die.locked = true
      die.roomId = undefined
      die.slotIndex = undefined
    }
  }
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
  const completed = countCompletedGroups(roomId, slots)
  const assignedIds = slots.filter(Boolean) as string[]

  if (roomId === 'cargo') {
    return activateCargo(state, playerId, assignedIds)
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

    const wasteDieIds = assignedIds.filter((id) => {
      const d = getDie(state, id)
      return d !== undefined
    })

    let pool = [...wasteDieIds]
    if (player.role === 'recycler') {
      pool = pool.slice(1)
    }

    if (pool.length > 0) {
      state.pendingWasteRoll = {
        roomId,
        dieIds: pool,
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

function activateCargo(
  state: GameSnapshot,
  _playerId: string,
  assignedIds: string[]
): string | null {
  if (assignedIds.length === 0) return 'Assign plane die to cargo'
  const city = state.cities.find(
    (c) => c.cityIndex === state.planePosition && c.status === 'faceUpOnPath'
  )
  if (!city) return 'No city card at plane position'
  if (city.blockers.length > 0) return 'Clear delivery blocker first'

  const req = CITIES[city.cityIndex].crates
  if (!hasCratesInCargo(state, req)) return 'Missing required crates in cargo'

  transferCratesFromCargo(state, req)
  if (state.supplyTokens > 0) {
    state.supplyTokens -= 1
    state.hqTokens += 1
  }
  city.status = 'delivered'
  spendDiceFromRoom(state, assignedIds)
  clearRoomSlots(state, 'cargo')
  checkWin(state)
  return null
}

export function resolveWasteRoll(
  state: GameSnapshot,
  dieRolls: Record<string, DieFace>
): string | null {
  const pending = state.pendingWasteRoll
  if (!pending) return 'No pending waste roll'

  let wasteAdded = 0
  for (const dieId of pending.dieIds) {
    const face = dieRolls[dieId] ?? getDie(state, dieId)?.face
    if (face && isCircledFace(face)) wasteAdded++
  }

  state.waste = Math.min(WASTE_MAX, state.waste + wasteAdded)
  if (state.waste >= WASTE_MAX) {
    state.result = 'lose'
    state.timerRunning = false
  }

  const allRoomDieIds = (state.roomSlots[pending.roomId] ?? []).filter(
    Boolean
  ) as string[]
  spendDiceFromRoom(state, allRoomDieIds)
  clearRoomSlots(state, pending.roomId)
  state.pendingWasteRoll = null
  return null
}

export function checkWin(state: GameSnapshot): void {
  const pathClear = state.cities.every(
    (c) => c.status !== 'faceUpOnPath'
  )
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

export { countCompletedGroups }
