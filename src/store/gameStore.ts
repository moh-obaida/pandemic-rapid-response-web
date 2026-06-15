import { create } from 'zustand'
import type { Player, GameState, GameSettings, GameStatus } from '../types/game'
import type { BoardState, RoomId } from '../types/board'
import type { ModalState } from '../types/ui'
import { createInitialGameState, createInitialBoard, createDice } from '../lib/rules'

interface GameStore {
  roomCode: string | null
  playerId: string | null
  playerName: string
  status: GameStatus
  players: Player[]
  gameState: GameState
  board: BoardState
  settings: GameSettings
  hostId: string
  selectedDieId: string | null
  selectedRoom: RoomId | null
  modals: ModalState
  localMode: boolean

  setRoom: (code: string, playerId: string) => void
  setPlayerName: (name: string) => void
  setLocalMode: (local: boolean) => void
  syncFromFirebase: (data: {
    status: GameStatus
    players: Record<string, Player>
    gameState: GameState
    board: BoardState
    settings: GameSettings
    hostId: string
  }) => void
  updateLocalPlayer: (player: Player) => void
  selectDie: (dieId: string | null) => void
  selectRoom: (roomId: RoomId | null) => void
  setModal: (key: keyof ModalState, open: boolean) => void
  reset: () => void
}

const defaultSettings: GameSettings = {
  difficulty: 'normal',
  aiReplacement: false,
  maxPlayers: 4,
}

export const useGameStore = create<GameStore>((set, get) => ({
  roomCode: null,
  playerId: null,
  playerName: '',
  status: 'lobby',
  players: [],
  gameState: createInitialGameState(),
  board: createInitialBoard(),
  settings: defaultSettings,
  hostId: '',
  selectedDieId: null,
  selectedRoom: null,
  modals: { roomActivation: false, crisis: false, gameEnd: false },
  localMode: false,

  setRoom: (code, playerId) => set({ roomCode: code, playerId }),
  setPlayerName: (name) => set({ playerName: name }),
  setLocalMode: (local) => set({ localMode: local }),

  syncFromFirebase: (data) =>
    set({
      status: data.status,
      players: Object.values(data.players),
      gameState: data.gameState,
      board: data.board,
      settings: data.settings,
      hostId: data.hostId,
    }),

  updateLocalPlayer: (player) => {
    const { playerId, players } = get()
    if (!playerId) return
    set({
      players: players.map((p) => (p.id === playerId ? player : p)),
    })
  },

  selectDie: (dieId) => set({ selectedDieId: dieId }),
  selectRoom: (roomId) => set({ selectedRoom: roomId }),

  setModal: (key, open) =>
    set((s) => ({ modals: { ...s.modals, [key]: open } })),

  reset: () =>
    set({
      roomCode: null,
      playerId: null,
      status: 'lobby',
      players: [],
      gameState: createInitialGameState(),
      board: createInitialBoard(),
      settings: defaultSettings,
      hostId: '',
      selectedDieId: null,
      selectedRoom: null,
      modals: { roomActivation: false, crisis: false, gameEnd: false },
    }),
}))

export function getCurrentPlayer(): Player | undefined {
  const { players, playerId } = useGameStore.getState()
  return players.find((p) => p.id === playerId)
}

export function rollAllDice(): void {
  const { playerId, players } = useGameStore.getState()
  if (!playerId) return
  const updated = players.map((p) =>
    p.id === playerId
      ? { ...p, dice: createDice(), submitted: false, rerollsUsed: 0 }
      : p
  )
  useGameStore.setState({ players: updated })
}
