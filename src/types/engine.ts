import type { DieFace } from '../lib/constants/dice'
import type { CrisisCardInstance, CrisisDefinitionId } from '../lib/constants/crises'
import type { RoleId, RoomId, SupplyType } from './board'
import type { Difficulty, GameResult } from './game'

export type TurnStep = 'roll' | 'useDice' | 'pausedByTimer'
export type CityStatus = 'discarded' | 'faceDownInDeck' | 'faceUpOnPath' | 'delivered'
export type DieLocation = 'hand' | 'spent' | 'room' | 'hq' | 'distraction'

export interface EngineDie {
  id: string
  face: DieFace
  ownerId: string
  location: DieLocation
  roomId?: RoomId
  slotIndex?: number
  locked: boolean
}

export interface EngineCrate {
  id: string
  type: SupplyType
  /** Supply room id or cargo bay */
  location: RoomId | 'cargo'
}

export interface EngineCityState {
  cityIndex: number
  status: CityStatus
  /** Delivery blocker crises stacked on this city (top = last) */
  blockers: CrisisCardInstance[]
}

export interface EnginePlayer {
  id: string
  name: string
  role: RoleId
  position: RoomId
  rerollsUsed: number
  isHost: boolean
  isConnected: boolean
}

export interface ActiveTemporaryCrisis {
  instance: CrisisCardInstance
  distractionDice?: string[]
}

export interface EngineSettings {
  difficulty: Difficulty
  maxPlayers: number
  crisisEnabled: boolean
}

export interface PendingWasteRoll {
  roomId: RoomId
  dieIds: string[]
  recyclerPlayerId?: string
}

export interface GameSnapshot {
  settings: EngineSettings
  players: EnginePlayer[]
  playerOrder: string[]
  activePlayerId: string
  turnStep: TurnStep
  /** Saved when timer interrupts; restored after timer event resolves. */
  timerResumeStep?: 'roll' | 'useDice'
  timer: number
  timerRunning: boolean
  hqTokens: number
  supplyTokens: number
  waste: number
  result: GameResult
  planePosition: number
  cities: EngineCityState[]
  cityDeck: number[]
  crisisDeck: CrisisCardInstance[]
  activeTemporaryCrises: ActiveTemporaryCrisis[]
  turbulenceActive: boolean
  extremeWindsActive: boolean
  crates: EngineCrate[]
  roomSlots: Partial<Record<RoomId, (string | null)[]>>
  dice: EngineDie[]
  pendingWasteRoll: PendingWasteRoll | null
}

export type GameAction =
  | { type: 'ROLL_DICE'; playerId: string }
  | { type: 'ASSIGN_DIE'; playerId: string; dieId: string; roomId: RoomId; slotIndex: number }
  | { type: 'ACTIVATE_ROOM'; playerId: string; roomId: RoomId }
  | { type: 'RESOLVE_WASTE_ROLL'; dieRolls: Record<string, DieFace> }
  | { type: 'SPEND_MOVE'; playerId: string; dieIds: string[]; targetRoomId: RoomId }
  | { type: 'SPEND_FLY'; playerId: string; dieIds: string[]; direction: 'left' | 'right' }
  | { type: 'ENGINEER_FLIP'; playerId: string; dieId: string; targetFace: DieFace }
  | { type: 'DIRECTOR_PLACE_HQ'; playerId: string; dieId: string; slotIndex: number }
  | { type: 'REROLL'; playerId: string; dieIds: string[] }
  | { type: 'END_TURN'; playerId: string }
  | { type: 'BEGIN_TIMER_EVENT' }
  | { type: 'RESOLVE_TIMER_EVENT' }
  | { type: 'SUPPLY_SPILL'; playerId: string; crateId: string }

export interface RuleError {
  error: string
}

export type ApplyResult = GameSnapshot | RuleError

export function isRuleError(r: ApplyResult): r is RuleError {
  return 'error' in r
}

export type CrisisDefinitionIdRef = CrisisDefinitionId
