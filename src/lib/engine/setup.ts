import { rollDieFace } from '../constants/dice'
import { CITIES, CITY_COUNT } from '../constants/cities'
import { DICE_PER_PLAYER, BASE_REROLLS, TIMER_SECONDS, WASTE_MAX } from '../constants/game'
import { HQ_TOKENS_START, SUPPLY_TOKENS_START } from '../constants/tokens'
import { SUPPLY_ROOM_FOR_TYPE, ROOM_GROUPS } from '../constants/rooms'
import { getRoleStartingRoom, ROLES } from '../constants/roles'
import { buildCrisisDeck } from '../constants/crises'
import { shuffle } from '../constants/game'
import { DIFFICULTY_CONFIG } from '../constants/game'
import type { Difficulty } from '../../types/game'
import type {
  GameSnapshot,
  EngineCrate,
  EngineDie,
  EnginePlayer,
  EngineCityState,
  EngineSettings,
} from '../../types/engine'
import type { RoomId, SupplyType, RoleId } from '../../types/board'

let dieCounter = 0

export function resetIdCounters(): void {
  dieCounter = 0
}

function nextDieId(): string {
  dieCounter += 1
  return `die-${dieCounter}`
}

function nextCrateId(type: SupplyType, n: number): string {
  return `crate-${type}-${n}`
}

export function createInitialCrates(): EngineCrate[] {
  const crates: EngineCrate[] = []
  const types: SupplyType[] = ['vaccine', 'food', 'power', 'water', 'firstAid']
  for (const type of types) {
    const room = SUPPLY_ROOM_FOR_TYPE[type]
    for (let i = 0; i < 4; i++) {
      crates.push({ id: nextCrateId(type, i + 1), type, location: room })
    }
  }
  return crates
}

function createRoomSlots(): Partial<Record<RoomId, (string | null)[]>> {
  const slots: Partial<Record<RoomId, (string | null)[]>> = {}
  for (const [key, config] of Object.entries(ROOM_GROUPS)) {
    const roomId = key as RoomId
    if ('slots' in config) {
      slots[roomId] = Array.from({ length: config.slots }, () => null)
    } else if ('groupSizes' in config) {
      const total = config.groupSizes.reduce((a, b) => a + b, 0)
      slots[roomId] = Array.from({ length: total }, () => null)
    }
  }
  return slots
}

export interface SetupInput {
  difficulty: Difficulty
  maxPlayers: number
  crisisEnabled: boolean
  players: Array<{ id: string; name: string; isHost: boolean }>
  rng?: () => number
}

export function setupGame(input: SetupInput): GameSnapshot {
  resetIdCounters()
  const rng = input.rng ?? Math.random
  const config = DIFFICULTY_CONFIG[input.difficulty]

  const rolePool = shuffle([...ROLES.map((r) => r.id)], rng)
  const enginePlayers: EnginePlayer[] = input.players.map((p, i) => ({
    id: p.id,
    name: p.name,
    role: rolePool[i % rolePool.length] as RoleId,
    position: getRoleStartingRoom(rolePool[i % rolePool.length] as RoleId),
    rerollsUsed: 0,
    isHost: p.isHost,
    isConnected: true,
  }))

  const playerOrder = shuffle(enginePlayers.map((p) => p.id), rng)
  const activePlayerId = playerOrder[0]

  const shuffled = shuffle(
    CITIES.map((_, i) => i),
    rng
  )
  const startCity = shuffled[0]!
  const planePosition = startCity
  /** Top card → plane start → returned to bottom of deck. */
  const orderedDeck = [...shuffled.slice(1), startCity]

  const visible = orderedDeck.slice(0, config.citiesVisible)
  const deck = orderedDeck.slice(
    config.citiesVisible,
    config.citiesVisible + config.cityDeckSize
  )

  const cities: EngineCityState[] = CITIES.map((_, cityIndex) => {
    let status: EngineCityState['status'] = 'discarded'
    if (visible.includes(cityIndex)) status = 'faceUpOnPath'
    else if (deck.includes(cityIndex)) status = 'faceDownInDeck'
    return { cityIndex, status, blockers: [] }
  })

  const settings: EngineSettings = {
    difficulty: input.difficulty,
    maxPlayers: input.maxPlayers,
    crisisEnabled: input.crisisEnabled,
  }

  return {
    settings,
    players: enginePlayers,
    playerOrder,
    activePlayerId,
    turnStep: 'roll',
    timer: TIMER_SECONDS,
    timerRunning: true,
    hqTokens: HQ_TOKENS_START,
    supplyTokens: SUPPLY_TOKENS_START,
    waste: 0,
    result: null,
    planePosition,
    cities,
    cityDeck: deck,
    crisisDeck: input.crisisEnabled ? buildCrisisDeck(true) : [],
    activeTemporaryCrises: [],
    turbulenceActive: false,
    extremeWindsActive: false,
    crates: createInitialCrates(),
    roomSlots: createRoomSlots(),
    dice: [],
    pendingWasteRoll: null,
  }
}

export function rollDiceForPlayer(
  _state: GameSnapshot,
  playerId: string,
  rng: () => number = Math.random
): EngineDie[] {
  const newDice: EngineDie[] = []
  for (let i = 0; i < DICE_PER_PLAYER; i++) {
    newDice.push({
      id: nextDieId(),
      face: rollDieFace(rng),
      ownerId: playerId,
      location: 'hand',
      locked: false,
    })
  }
  return newDice
}

export function getRerollsMax(role: RoleId): number {
  const roleDef = ROLES.find((r) => r.id === role)
  return BASE_REROLLS + (roleDef?.rerollBonus ?? 0)
}

export function cloneState(state: GameSnapshot): GameSnapshot {
  return structuredClone(state)
}

export { WASTE_MAX, CITIES, CITY_COUNT }
