import { ROOM_ORDER } from '../constants/rooms'
import { CITY_COUNT } from '../constants/cities'
import type { GameSnapshot } from '../../types/engine'
import type { RoomId } from '../../types/board'
import { dieAvailableToPlayer } from './rooms'

function getPlayer(state: GameSnapshot, playerId: string) {
  return state.players.find((p) => p.id === playerId)
}

function getDie(state: GameSnapshot, dieId: string) {
  return state.dice.find((d) => d.id === dieId)
}

function getDirectorId(state: GameSnapshot): string | undefined {
  return state.players.find((p) => p.role === 'director')?.id
}

function spendMovementDie(state: GameSnapshot, die: NonNullable<ReturnType<typeof getDie>>): void {
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

export function findPathRooms(from: RoomId, to: RoomId): RoomId[] | null {
  if (from === to) return []
  const fromIdx = ROOM_ORDER.indexOf(from)
  const toIdx = ROOM_ORDER.indexOf(to)
  if (fromIdx === -1 || toIdx === -1) return null

  const path: RoomId[] = []
  let idx = fromIdx
  while (idx !== toIdx) {
    if (fromIdx < toIdx) {
      idx++
    } else {
      idx--
    }
    path.push(ROOM_ORDER[idx])
  }
  return path
}

export function canMove(
  state: GameSnapshot,
  playerId: string,
  dieIds: string[],
  targetRoomId: RoomId
): string | null {
  if (state.activePlayerId !== playerId) return 'Not your turn'
  const player = getPlayer(state, playerId)
  if (!player) return 'Invalid player'

  const diceCost = state.turbulenceActive ? dieIds.length * 2 : dieIds.length
  if (dieIds.length === 0) return 'Select dice to move'

  const available = dieIds.every((id) => {
    const d = getDie(state, id)
    return d && dieAvailableToPlayer(state, playerId, d)
  })
  if (!available) return 'Invalid dice'

  const path = findPathRooms(player.position, targetRoomId)
  if (path === null) return 'Invalid target room'

  const roomsToMove = path.length
  const roomsPerDie = player.role === 'technician' ? 2 : 1
  const maxRooms = dieIds.length * roomsPerDie

  if (roomsToMove > maxRooms) return 'Not enough movement'
  if (state.turbulenceActive && dieIds.length < diceCost) return 'Turbulence: need 2 dice per move'

  return null
}

export function applyMove(
  state: GameSnapshot,
  playerId: string,
  dieIds: string[],
  targetRoomId: RoomId
): void {
  const player = getPlayer(state, playerId)!
  const path = findPathRooms(player.position, targetRoomId)!
  const roomsPerDie = player.role === 'technician' ? 2 : 1
  let steps = path.length
  let diceUsed = 0
  while (steps > 0 && diceUsed < dieIds.length) {
    const step = Math.min(roomsPerDie, steps)
    steps -= step
    const die = getDie(state, dieIds[diceUsed])!
    spendMovementDie(state, die)
    diceUsed++
  }
  player.position = targetRoomId
}

export function canFly(
  state: GameSnapshot,
  playerId: string,
  dieIds: string[],
  direction: 'left' | 'right'
): string | null {
  void direction
  if (state.activePlayerId !== playerId) return 'Not your turn'
  const player = getPlayer(state, playerId)
  if (!player) return 'Invalid player'

  const planeDiceNeeded = state.extremeWindsActive ? dieIds.length * 2 : dieIds.length
  if (state.extremeWindsActive && dieIds.length < planeDiceNeeded / 2)
    return 'Extreme winds: need 2 plane dice per fly'

  for (const id of dieIds) {
    const d = getDie(state, id)
    if (!d || !dieAvailableToPlayer(state, playerId, d) || d.face !== 'plane')
      return 'Need plane dice in hand or HQ'
  }

  return null
}

export function applyFly(
  state: GameSnapshot,
  playerId: string,
  dieIds: string[],
  direction: 'left' | 'right'
): void {
  const player = getPlayer(state, playerId)!
  const citiesPerDie = player.role === 'flightPlanner' ? 2 : 1
  const total = dieIds.length * citiesPerDie
  for (const id of dieIds) {
    const die = getDie(state, id)!
    spendMovementDie(state, die)
  }
  const delta = direction === 'right' ? total : -total
  state.planePosition = ((state.planePosition + delta) % CITY_COUNT + CITY_COUNT) % CITY_COUNT
}

export function pathDistance(from: number, to: number): number {
  const diff = Math.abs(from - to)
  return Math.min(diff, CITY_COUNT - diff)
}
