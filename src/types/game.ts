import type { SupplyType, RoleId, RoomId } from './board'

export type GameStatus = 'lobby' | 'playing' | 'ended'
export type GameResult = 'win' | 'lose' | null
export type Difficulty = 'easy' | 'normal' | 'veteran' | 'heroic'
export type Phase = 'rolling' | 'assigning' | 'activating' | 'delivering' | 'resolution'

export interface Die {
  id: string
  value: SupplyType
  assignedRoom: RoomId | null
  locked: boolean
}

export interface Player {
  id: string
  name: string
  role: RoleId
  dice: Die[]
  rerollsUsed: number
  rerollsMax: number
  suppliesCarried: number
  missedTurns: number
  isHost: boolean
  isReady: boolean
  isConnected: boolean
  submitted: boolean
}

export interface SupplyCrate {
  id: string
  type: SupplyType
  room: RoomId
  inCargo: boolean
}

export interface GameState {
  round: number
  phase: Phase
  timer: number
  timerRunning: boolean
  waste: number
  wasteMax: number
  timeTokens: number
  timeTokensMax: number
  supplies: SupplyCrate[]
  result: GameResult
}

export interface GameSettings {
  difficulty: Difficulty
  aiReplacement: boolean
  maxPlayers: number
  crisisEnabled: boolean
}

export interface RoomSession {
  code: string
  status: GameStatus
  players: Player[]
  gameState: GameState
  settings: GameSettings
  hostId: string
  createdAt: number
}
