import type { DieFace } from '../constants/dice'
import { CITIES } from '../constants/cities'
import { WASTE_MAX } from '../constants/game'
import { HQ_TOKENS_START, SUPPLY_TOKENS_START } from '../constants/tokens'
import type { RoomId, SupplyType } from '../../types/board'
import type { EngineDie, GameSnapshot, CityStatus } from '../../types/engine'
import { getRerollsMax } from './setup'
import { hasCratesInCargo } from './crates'
import { countCompletedGroups } from './rooms'

export interface FlightpathCityView {
  cityIndex: number
  name: string
  status: CityStatus
  crates: Partial<Record<SupplyType, number>>
  blockerCount: number
  isPlaneHere: boolean
  delivered: boolean
  faceUp: boolean
}

export interface PlayerView {
  id: string
  name: string
  role: import('../../types/board').RoleId
  isHost: boolean
  isConnected: boolean
  position: RoomId
  rerollsUsed: number
  rerollsMax: number
  dice: EngineDie[]
  isActive: boolean
}

export function getPlayerDice(state: GameSnapshot, playerId: string): EngineDie[] {
  return state.dice.filter((d) => d.ownerId === playerId && d.location !== 'spent')
}

/** Hand dice plus Director HQ dice when the active player is in HQ. */
export function getSelectableDice(state: GameSnapshot, playerId: string): EngineDie[] {
  const player = state.players.find((p) => p.id === playerId)
  if (!player) return []
  const hand = state.dice.filter(
    (d) => d.ownerId === playerId && d.location === 'hand' && !d.locked
  )
  if (player.position === 'hq') {
    const hqDice = state.dice.filter((d) => d.location === 'hq' && !d.locked)
    return [...hand, ...hqDice]
  }
  return hand
}

export function getCratesInRoom(state: GameSnapshot, roomId: RoomId) {
  return state.crates.filter((c) => c.location === roomId)
}

export function getCratesInCargo(state: GameSnapshot) {
  return state.crates.filter((c) => c.location === 'cargo')
}

export function getFlightpathCities(state: GameSnapshot): FlightpathCityView[] {
  return CITIES.map((def) => {
    const city = state.cities.find((c) => c.cityIndex === def.cityId)!
    return {
      cityIndex: def.cityId,
      name: def.name,
      status: city.status,
      crates: def.crates,
      blockerCount: city.blockers.length,
      isPlaneHere: state.planePosition === def.cityId,
      delivered: city.status === 'delivered',
      faceUp: city.status === 'faceUpOnPath',
    }
  })
}

export function getPlayerViews(state: GameSnapshot): PlayerView[] {
  return state.players.map((p) => ({
    id: p.id,
    name: p.name,
    role: p.role,
    isHost: p.isHost,
    isConnected: p.isConnected,
    position: p.position,
    rerollsUsed: p.rerollsUsed,
    rerollsMax: getRerollsMax(p.role),
    dice: getPlayerDice(state, p.id),
    isActive: state.activePlayerId === p.id,
  }))
}

export function getCurrentPlayerView(
  state: GameSnapshot,
  playerId: string | null
): PlayerView | undefined {
  if (!playerId) return undefined
  return getPlayerViews(state).find((p) => p.id === playerId)
}

export function canDeliverAtPlane(state: GameSnapshot): boolean {
  const city = state.cities.find(
    (c) => c.cityIndex === state.planePosition && c.status === 'faceUpOnPath'
  )
  if (!city || city.blockers.length > 0) return false
  const req = CITIES[state.planePosition].crates
  return hasCratesInCargo(state, req)
}

export function getRoomActivationCount(
  state: GameSnapshot,
  roomId: RoomId,
  playerId?: string
): number {
  return countCompletedGroups(state, roomId, playerId)
}

export function dieFaceToSupplyType(face: DieFace): SupplyType | 'plane' {
  if (face === 'plane') return 'plane'
  return face
}

export const TOKEN_DISPLAY = {
  hqMax: HQ_TOKENS_START,
  supplyMax: SUPPLY_TOKENS_START,
  wasteMax: WASTE_MAX,
}
