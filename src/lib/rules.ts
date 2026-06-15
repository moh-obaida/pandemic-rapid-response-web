import type { Die, Player, GameState, SupplyCrate } from '../types/game'
import type { BoardState, City, CrisisCard, RoomId, RoleId, SupplyType } from '../types/board'
import {
  BASE_REROLLS,
  DICE_PER_PLAYER,
  SUPPLY_TYPES,
  TIME_TOKENS_START,
  WASTE_MAX,
  TIMER_SECONDS,
  ROLES,
  ROOMS,
  shuffle,
  createCities,
  CRISIS_CARDS,
} from './constants'

export function getRoleRerollMax(roleId: RoleId): number {
  const role = ROLES.find((r) => r.id === roleId)
  return BASE_REROLLS + (role?.rerollBonus ?? 0)
}

export function rollDieValue(): SupplyType {
  return SUPPLY_TYPES[Math.floor(Math.random() * SUPPLY_TYPES.length)]
}

export function createDice(count = DICE_PER_PLAYER): Die[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `die-${crypto.randomUUID().slice(0, 8)}-${i}`,
    value: rollDieValue(),
    assignedRoom: null,
    locked: false,
  }))
}

export function createInitialGameState(): GameState {
  return {
    round: 1,
    phase: 'rolling',
    timer: TIMER_SECONDS,
    timerRunning: false,
    waste: 0,
    wasteMax: WASTE_MAX,
    timeTokens: TIME_TOKENS_START,
    timeTokensMax: TIME_TOKENS_START,
    supplies: [],
    result: null,
  }
}

export function createInitialBoard(): BoardState {
  return {
    planePosition: 0,
    cities: createCities(),
    currentCrisis: null,
    crisisDeck: shuffle(CRISIS_CARDS),
    cityDeckSize: 5,
  }
}

export function getRoomSupplyType(roomId: RoomId): SupplyType | null {
  return ROOMS.find((r) => r.id === roomId)?.supplyType ?? null
}

export function isDieMatchForRoom(
  die: Die,
  roomId: RoomId,
  playerRole: RoleId
): boolean {
  const roomType = getRoomSupplyType(roomId)
  if (!roomType) {
    if (roomId === 'recycling') return true
    if (roomId === 'cargo') return true
    if (roomId === 'hq' && playerRole === 'director') return true
    return false
  }
  if (playerRole === 'director' && roomId === 'hq') return true
  return die.value === roomType
}

export function validateDieAssignment(
  die: Die,
  roomId: RoomId,
  player: Player
): boolean {
  if (die.locked || die.assignedRoom) return false
  if (roomId === 'recycling' || roomId === 'cargo') return true
  const roomType = getRoomSupplyType(roomId)
  if (!roomType) {
    return player.role === 'director' && roomId === 'hq'
  }
  if (player.role === 'director') return true
  return die.value === roomType
}

export function countMatchingDiceInRoom(
  dice: Die[],
  roomId: RoomId,
  role: RoleId
): Die[] {
  return dice.filter(
    (d) => d.assignedRoom === roomId && isDieMatchForRoom(d, roomId, role)
  )
}

export function createSupplyFromRoom(
  roomId: RoomId,
  matchingCount: number
): SupplyCrate[] {
  const supplyType = getRoomSupplyType(roomId)
  if (!supplyType || matchingCount < 1) return []
  return Array.from({ length: Math.floor(matchingCount) }, (_, i) => ({
    id: `supply-${roomId}-${crypto.randomUUID().slice(0, 8)}-${i}`,
    type: supplyType,
    room: roomId,
    inCargo: false,
  }))
}

export function calculateWaste(players: Player[]): number {
  let waste = 0
  let recyclerUsed = false

  for (const player of players) {
    for (const die of player.dice) {
      if (!die.assignedRoom) {
        waste++
        continue
      }
      const roomType = getRoomSupplyType(die.assignedRoom)
      if (roomType && die.value !== roomType && player.role !== 'director') {
        if (die.assignedRoom === 'recycling') continue
        waste++
      } else if (
        die.assignedRoom !== 'recycling' &&
        die.assignedRoom !== 'cargo' &&
        roomType &&
        die.value !== roomType &&
        player.role === 'director' &&
        die.assignedRoom !== 'hq'
      ) {
        waste++
      }
    }
    if (player.role === 'recycler' && !recyclerUsed) {
      waste = Math.max(0, waste - 1)
      recyclerUsed = true
    }
  }
  return waste
}

export function applyCrisisEffect(
  crisis: CrisisCard,
  gameState: GameState,
  players: Player[]
): { gameState: GameState; players: Player[] } {
  const gs = { ...gameState }
  let ps = [...players]

  switch (crisis.effectType) {
    case 'waste':
      gs.waste = Math.min(gs.wasteMax, gs.waste + crisis.value)
      break
    case 'timeToken':
      gs.timeTokens = Math.max(0, gs.timeTokens - crisis.value)
      break
    case 'dice':
      ps = ps.map((p) => ({
        ...p,
        dice: p.dice.slice(0, Math.max(1, p.dice.length - crisis.value)),
      }))
      break
    case 'delivery':
      break
  }

  return { gameState: gs, players: ps }
}

export function checkWinCondition(cities: City[]): boolean {
  return cities.every((c) => c.delivered)
}

export function checkLoseCondition(gameState: GameState): boolean {
  if (gameState.waste >= gameState.wasteMax) return true
  if (gameState.timer <= 0 && gameState.timeTokens <= 0) return true
  return false
}

export function canDeliverToCity(
  city: City,
  cargoSupplies: SupplyCrate[]
): boolean {
  return cargoSupplies.some((s) => s.type === city.supplyNeeded && s.inCargo)
}

export function getDeliverableCities(
  cities: City[],
  cargoSupplies: SupplyCrate[]
): City[] {
  return cities.filter((c) => !c.delivered && canDeliverToCity(c, cargoSupplies))
}

export function deliverToCity(
  cityId: number,
  cities: City[],
  supplies: SupplyCrate[]
): { cities: City[]; supplies: SupplyCrate[] } {
  const city = cities.find((c) => c.id === cityId)
  if (!city || city.delivered) return { cities, supplies }

  const supplyIdx = supplies.findIndex(
    (s) => s.inCargo && s.type === city.supplyNeeded
  )
  if (supplyIdx === -1) return { cities, supplies }

  const newSupplies = supplies.filter((_, i) => i !== supplyIdx)
  const newCities = cities.map((c) =>
    c.id === cityId ? { ...c, delivered: true } : c
  )
  return { cities: newCities, supplies: newSupplies }
}

export function allPlayersSubmitted(players: Player[]): boolean {
  const active = players.filter((p) => p.isConnected)
  return active.length > 0 && active.every((p) => p.submitted)
}

export function getFlightDeliveryCount(players: Player[]): number {
  const hasFlightPlanner = players.some((p) => p.role === 'flightPlanner')
  return hasFlightPlanner ? 2 : 1
}

export function rerollDie(die: Die, engineerLower = false): Die {
  let value = rollDieValue()
  if (engineerLower) {
    const currentIdx = SUPPLY_TYPES.indexOf(die.value)
    const newIdx = SUPPLY_TYPES.indexOf(value)
    if (newIdx > currentIdx) {
      value = SUPPLY_TYPES[Math.max(0, newIdx - 1)]
    }
  }
  return { ...die, value, assignedRoom: null, locked: false }
}

export function moveDieTechnician(die: Die): Die {
  const idx = SUPPLY_TYPES.indexOf(die.value)
  const newIdx = (idx + 1) % SUPPLY_TYPES.length
  return { ...die, value: SUPPLY_TYPES[newIdx] }
}
