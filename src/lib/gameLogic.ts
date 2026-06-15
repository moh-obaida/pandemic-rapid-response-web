import type { Player, Die, GameState } from '../types/game'
import type { RoomId } from '../types/board'
import {
  validateDieAssignment,
  countMatchingDiceInRoom,
  createSupplyFromRoom,
  calculateWaste,
  isDieMatchForRoom,
} from './rules'
import { ROOMS } from './constants'

export function assignDieToRoom(
  player: Player,
  dieId: string,
  roomId: RoomId
): Player | null {
  const die = player.dice.find((d) => d.id === dieId)
  if (!die || !validateDieAssignment(die, roomId, player)) return null

  return {
    ...player,
    dice: player.dice.map((d) =>
      d.id === dieId ? { ...d, assignedRoom: roomId } : d
    ),
  }
}

export function unassignDie(player: Player, dieId: string): Player {
  return {
    ...player,
    dice: player.dice.map((d) =>
      d.id === dieId ? { ...d, assignedRoom: null } : d
    ),
  }
}

export function activateRoomForPlayer(
  player: Player,
  roomId: RoomId
): { supplies: ReturnType<typeof createSupplyFromRoom>; wasteReduction: number } {
  const matching = countMatchingDiceInRoom(player.dice, roomId, player.role)
  const supplies = createSupplyFromRoom(roomId, matching.length)

  let wasteReduction = 0
  if (roomId === 'recycling') {
    const unmatched = player.dice.filter(
      (d) => d.assignedRoom === 'recycling' && !isDieMatchForRoom(d, 'recycling', player.role)
    )
    wasteReduction = unmatched.length
  }

  return {
    supplies,
    wasteReduction,
  }
}

export function processRoundEnd(
  players: Player[],
  gameState: GameState
): GameState {
  const wasteAdded = calculateWaste(players)
  return {
    ...gameState,
    waste: Math.min(gameState.wasteMax, gameState.waste + wasteAdded),
    phase: 'resolution',
  }
}

export function loadSuppliesToCargo(
  supplies: GameState['supplies'],
  supplyIds: string[]
): GameState['supplies'] {
  return supplies.map((s) =>
    supplyIds.includes(s.id) ? { ...s, inCargo: true } : s
  )
}

export function getRoomById(roomId: RoomId) {
  return ROOMS.find((r) => r.id === roomId)
}

export function getUnassignedDice(player: Player): Die[] {
  return player.dice.filter((d) => !d.assignedRoom && !d.locked)
}

export function getAssignedDiceForRoom(player: Player, roomId: RoomId): Die[] {
  return player.dice.filter((d) => d.assignedRoom === roomId)
}
