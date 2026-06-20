export type GameStatus = 'lobby' | 'playing' | 'ended'
export type GameResult = 'win' | 'lose' | null
export type Difficulty = 'easy' | 'normal' | 'veteran' | 'heroic'

export interface GameSettings {
  difficulty: Difficulty
  aiReplacement: boolean
  maxPlayers: number
  crisisEnabled: boolean
}
