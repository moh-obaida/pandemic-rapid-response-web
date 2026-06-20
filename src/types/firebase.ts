import type { GameSettings, GameStatus } from './game'
import type { GameAction, GameSnapshot } from './engine'

export interface PendingGameAction {
  id: string
  playerId: string
  action: GameAction
  at: number
}

export interface LobbyPlayer {
  id: string
  name: string
  isHost: boolean
  isReady: boolean
  isConnected: boolean
}

export interface FirebaseRoom {
  code: string
  status: GameStatus
  lobbyPlayers: Record<string, LobbyPlayer>
  snapshot: GameSnapshot | null
  settings: GameSettings
  hostId: string
  pendingAction: PendingGameAction | null
  createdAt: number
  lastUpdated: number
}
