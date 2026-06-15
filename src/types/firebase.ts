import type { GameSettings, GameState, Player, GameStatus } from './game'
import type { BoardState } from './board'

export interface FirebaseRoom {
  code: string
  status: GameStatus
  players: Record<string, Player>
  gameState: GameState
  board: BoardState
  settings: GameSettings
  hostId: string
  createdAt: number
  lastUpdated: number
}

export interface RoomAssignment {
  playerId: string
  dieId: string
  roomId: string
  timestamp: number
}
