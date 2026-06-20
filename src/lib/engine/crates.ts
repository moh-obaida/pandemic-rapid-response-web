import type { SupplyType, RoomId } from '../../types/board'
import type { EngineCrate, GameSnapshot } from '../../types/engine'
import { CARGO_MAX } from '../constants/tokens'
import { SUPPLY_ROOM_FOR_TYPE } from '../constants/rooms'

export function countCratesInLocation(
  crates: EngineCrate[],
  location: RoomId | 'cargo',
  type?: SupplyType
): number {
  return crates.filter(
    (c) => c.location === location && (type === undefined || c.type === type)
  ).length
}

export function countCargoCrates(crates: EngineCrate[]): number {
  return crates.filter((c) => c.location === 'cargo').length
}

/** Move up to `count` crates of `type` from supply room to cargo. Returns how many moved. */
export function transferCratesToCargo(
  state: GameSnapshot,
  type: SupplyType,
  maxCount: number
): number {
  const room = SUPPLY_ROOM_FOR_TYPE[type]
  const available = state.crates.filter(
    (c) => c.location === room && c.type === type
  )
  const cargoSpace = CARGO_MAX - countCargoCrates(state.crates)
  const toMove = Math.min(maxCount, available.length, cargoSpace)
  let moved = 0
  for (const crate of available) {
    if (moved >= toMove) break
    crate.location = 'cargo'
    moved++
  }
  return moved
}

/** Move specific crates from cargo back to their supply rooms. */
export function transferCratesFromCargo(
  state: GameSnapshot,
  requirements: Partial<Record<SupplyType, number>>
): boolean {
  for (const [type, needed] of Object.entries(requirements) as [
    SupplyType,
    number,
  ][]) {
    if (!needed) continue
    const room = SUPPLY_ROOM_FOR_TYPE[type]
    const inCargo = state.crates.filter(
      (c) => c.location === 'cargo' && c.type === type
    )
    if (inCargo.length < needed) return false
    for (let i = 0; i < needed; i++) {
      inCargo[i].location = room
    }
  }
  return true
}

export function transferOneCrateFromCargoToRoom(
  state: GameSnapshot,
  crateId: string
): boolean {
  const crate = state.crates.find((c) => c.id === crateId && c.location === 'cargo')
  if (!crate) return false
  crate.location = SUPPLY_ROOM_FOR_TYPE[crate.type]
  return true
}

export function hasCratesInCargo(
  state: GameSnapshot,
  requirements: Partial<Record<SupplyType, number>>
): boolean {
  for (const [type, needed] of Object.entries(requirements) as [
    SupplyType,
    number,
  ][]) {
    if (!needed) continue
    const count = countCratesInLocation(state.crates, 'cargo', type)
    if (count < needed) return false
  }
  return true
}
