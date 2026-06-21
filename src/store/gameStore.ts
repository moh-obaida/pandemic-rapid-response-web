import { create } from 'zustand'
import type { GameSnapshot, GameAction } from '../types/engine'
import type { PendingConfirm } from '../types/controls'
import type { GameSettings, GameStatus } from '../types/game'
import type { RoomId } from '../types/board'
import type { ModalState } from '../types/ui'
import type { LobbyPlayer } from '../types/firebase'
import { applyAction, isRuleError } from '../lib/engine'
import { friendlyError } from '../lib/userErrors'

interface GameStore {
  roomCode: string | null
  playerId: string | null
  playerName: string
  status: GameStatus
  lobbyPlayers: LobbyPlayer[]
  snapshot: GameSnapshot | null
  settings: GameSettings
  hostId: string
  selectedDieIds: string[]
  selectedRoom: RoomId | null
  pendingConfirm: PendingConfirm | null
  modals: ModalState
  localMode: boolean
  lastError: string | null
  isActionPending: boolean
  /** DEV-only preview hints set by qaBridge for screenshot QA. */
  qaDevPreview: { cityId?: number; rolePlayerId?: string } | null

  setRoom: (code: string, playerId: string) => void
  setPlayerName: (name: string) => void
  setLocalMode: (local: boolean) => void
  syncFromFirebase: (data: {
    status: GameStatus
    lobbyPlayers: Record<string, LobbyPlayer>
    snapshot: GameSnapshot | null
    settings: GameSettings
    hostId: string
  }) => void
  setSnapshot: (snapshot: GameSnapshot | null) => void
  dispatch: (action: GameAction) => GameSnapshot | null
  toggleDieSelection: (dieId: string, additive?: boolean) => void
  setSelectedDice: (dieIds: string[]) => void
  clearSelection: () => void
  selectRoom: (roomId: RoomId | null) => void
  setPendingConfirm: (confirm: PendingConfirm | null) => void
  setModal: (key: keyof ModalState, open: boolean) => void
  clearError: () => void
  setActionPending: (pending: boolean) => void
  reset: () => void
}

const defaultSettings: GameSettings = {
  difficulty: 'normal',
  aiReplacement: false,
  maxPlayers: 4,
  crisisEnabled: false,
}

export const useGameStore = create<GameStore>((set, get) => ({
  roomCode: null,
  playerId: null,
  playerName: '',
  status: 'lobby',
  lobbyPlayers: [],
  snapshot: null,
  settings: defaultSettings,
  hostId: '',
  selectedDieIds: [],
  selectedRoom: null,
  pendingConfirm: null,
  modals: { roomActivation: false, crisis: false, gameEnd: false },
  localMode: false,
  lastError: null,
  isActionPending: false,
  qaDevPreview: null,

  setRoom: (code, playerId) => set({ roomCode: code, playerId }),
  setPlayerName: (name) => set({ playerName: name }),
  setLocalMode: (local) => set({ localMode: local }),

  syncFromFirebase: (data) => {
    const prev = get()
    const ended = data.snapshot?.result ?? null
    const timerPaused = data.snapshot?.turnStep === 'pausedByTimer'
    set({
      status: data.status,
      lobbyPlayers: Object.values(data.lobbyPlayers),
      snapshot: data.snapshot,
      settings: data.settings,
      hostId: data.hostId,
      ...(timerPaused
        ? { selectedDieIds: [], pendingConfirm: null, selectedRoom: null }
        : {}),
    })
    if (ended && prev.status === 'playing' && !prev.modals.gameEnd) {
      set({ status: 'ended', modals: { ...get().modals, gameEnd: true } })
    }
  },

  setSnapshot: (snapshot) => set({ snapshot }),

  dispatch: (action) => {
    const { snapshot } = get()
    if (!snapshot) return null

    const result = applyAction(snapshot, action)
    if (isRuleError(result)) {
      set({ lastError: friendlyError(result.error) })
      return null
    }

    if (result.result) {
      set({
        snapshot: result,
        status: 'ended',
        modals: { ...get().modals, gameEnd: true },
        lastError: null,
        selectedDieIds: [],
        pendingConfirm: null,
      })
    } else {
      set({
        snapshot: result,
        lastError: null,
        selectedDieIds: [],
        pendingConfirm: null,
      })
    }

    return result
  },

  toggleDieSelection: (dieId, additive = false) => {
    const { selectedDieIds, pendingConfirm } = get()
    if (pendingConfirm) return

    if (!additive) {
      const exists = selectedDieIds.includes(dieId)
      set({ selectedDieIds: exists && selectedDieIds.length === 1 ? [] : [dieId] })
      return
    }

    if (selectedDieIds.includes(dieId)) {
      set({ selectedDieIds: selectedDieIds.filter((id) => id !== dieId) })
    } else {
      set({ selectedDieIds: [...selectedDieIds, dieId] })
    }
  },

  setSelectedDice: (dieIds) => set({ selectedDieIds: dieIds }),
  clearSelection: () => set({ selectedDieIds: [], selectedRoom: null }),
  selectRoom: (roomId) => set({ selectedRoom: roomId }),
  setPendingConfirm: (confirm) => set({ pendingConfirm: confirm }),
  clearError: () => set({ lastError: null }),

  setActionPending: (pending) => set({ isActionPending: pending }),

  setModal: (key, open) =>
    set((s) => ({ modals: { ...s.modals, [key]: open } })),

  reset: () =>
    set({
      roomCode: null,
      playerId: null,
      status: 'lobby',
      lobbyPlayers: [],
      snapshot: null,
      settings: defaultSettings,
      hostId: '',
      selectedDieIds: [],
      selectedRoom: null,
      pendingConfirm: null,
      modals: { roomActivation: false, crisis: false, gameEnd: false },
      lastError: null,
      isActionPending: false,
      qaDevPreview: null,
    }),
}))

export function getSnapshot(): GameSnapshot | null {
  return useGameStore.getState().snapshot
}

export function isHost(): boolean {
  const { playerId, hostId } = useGameStore.getState()
  return playerId === hostId
}
