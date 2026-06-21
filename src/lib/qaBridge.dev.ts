/**
 * DEV-ONLY QA helpers for Playwright screenshot runs.
 * Loaded via dynamic import in main.tsx when import.meta.env.DEV is true.
 * Must never be imported from production code paths.
 */
import { useGameStore } from '../store/gameStore'
import { setupGame } from './engine/setup'
import { syncLocalRoomForQa } from './firebase'
import type { FirebaseRoom } from '../types/firebase'
import type { GameSettings } from '../types/game'
import {
  buildQaSeed,
  QA_P1,
  QA_P2,
  QA_SEED_NAMES,
  type QaSeedName,
} from './qaSeeds.dev'

export interface PrrQaBridgeStatus {
  bridgeLoaded: boolean
  availableStates: readonly string[]
  lastSeededState: string | null
  lastSeedError: string | null
  hasSnapshot: boolean
  status: string | null
  roomCode: string | null
}

export interface PrrQaBridge {
  reset: () => void
  listStates: () => readonly string[]
  seedState: (name: string) => boolean
  getStatus: () => PrrQaBridgeStatus
  seedWaitingForHost: (roomCode?: string) => void
  showErrorToast: (message: string) => void
  clearErrorToast: () => void
  showActionPending: (pending?: boolean) => void
  selectFirstHandDie: () => string | null
  seedGameEnd: (result?: 'win' | 'lose') => boolean
}

declare global {
  interface Window {
    __PRR_QA__?: PrrQaBridge
    /** Alias for Playwright prompts / external tooling. */
    PRR_QA?: PrrQaBridge
  }
}

const defaultSettings: GameSettings = {
  difficulty: 'normal',
  aiReplacement: false,
  maxPlayers: 4,
  crisisEnabled: false,
}

const QA_ROOM_CODE = 'QASEED'

let lastSeededState: string | null = null
let lastSeedError: string | null = null

function buildStatus(): PrrQaBridgeStatus {
  const s = useGameStore.getState()
  return {
    bridgeLoaded: true,
    availableStates: QA_SEED_NAMES,
    lastSeededState,
    lastSeedError,
    hasSnapshot: Boolean(s.snapshot),
    status: s.status,
    roomCode: s.roomCode,
  }
}

function lobbyPlayersRecord() {
  return {
    [QA_P1]: {
      id: QA_P1,
      name: 'QA Captain',
      isHost: true,
      isReady: true,
      isConnected: true,
    },
    [QA_P2]: {
      id: QA_P2,
      name: 'QA Mate',
      isHost: false,
      isReady: true,
      isConnected: true,
    },
  }
}

function syncQaLocalRoom(
  snapshot: NonNullable<ReturnType<typeof useGameStore.getState>['snapshot']>,
  status: 'playing' | 'ended',
  settings: GameSettings,
): void {
  const room: FirebaseRoom = {
    code: QA_ROOM_CODE,
    status,
    lobbyPlayers: lobbyPlayersRecord(),
    snapshot,
    settings,
    hostId: QA_P1,
    pendingAction: null,
    createdAt: Date.now(),
    lastUpdated: Date.now(),
  }
  syncLocalRoomForQa(room)
}

function mountPlayingFromSeed(name: QaSeedName): boolean {
  lastSeedError = null
  const result = buildQaSeed(name)
  if (!result.ok) {
    lastSeedError = result.reason
    console.warn(`[PRR QA] seed ${name} failed:`, result.reason)
    return false
  }

  const { payload } = result
  const { snapshot } = payload

  // Pause live timer during screenshot QA so the clock does not fire mid-capture.
  snapshot.timerRunning = false

  const gameStatus = payload.status ?? 'playing'
  const settings: GameSettings = {
    ...snapshot.settings,
    aiReplacement: defaultSettings.aiReplacement,
  }

  useGameStore.setState({
    roomCode: QA_ROOM_CODE,
    playerId: payload.playerId,
    playerName: payload.playerId === QA_P1 ? 'QA Captain' : 'QA Mate',
    hostId: QA_P1,
    status: gameStatus,
    localMode: true,
    lobbyPlayers: Object.values(lobbyPlayersRecord()),
    settings,
    snapshot,
    selectedDieIds: payload.selectedDieIds ?? [],
    pendingConfirm: payload.pendingConfirm ?? null,
    selectedRoom: null,
    modals: {
      roomActivation: payload.modals?.roomActivation ?? false,
      crisis: payload.modals?.crisis ?? false,
      gameEnd: payload.modals?.gameEnd ?? false,
    },
    lastError: null,
    isActionPending: false,
    qaDevPreview: payload.qaDevPreview ?? null,
  })

  syncQaLocalRoom(snapshot, gameStatus === 'ended' ? 'ended' : 'playing', settings)
  lastSeededState = name
  return true
}

function createBridge(): PrrQaBridge {
  return {
    reset() {
      lastSeededState = null
      lastSeedError = null
      useGameStore.getState().reset()
    },

    listStates() {
      return QA_SEED_NAMES
    },

    getStatus() {
      return buildStatus()
    },

    seedState(name: string) {
      if (!QA_SEED_NAMES.includes(name as QaSeedName)) {
        lastSeedError = `unknown seed: ${name}`
        console.warn(`[PRR QA] unknown seed: ${name}`)
        return false
      }
      return mountPlayingFromSeed(name as QaSeedName)
    },

    seedWaitingForHost(roomCode = 'QAHOST') {
      const hostId = QA_P1
      const guestId = QA_P2
      useGameStore.setState({
        roomCode,
        playerId: guestId,
        playerName: 'QA Guest',
        hostId,
        status: 'lobby',
        localMode: true,
        lobbyPlayers: [
          {
            id: hostId,
            name: 'QA Host',
            isHost: true,
            isReady: true,
            isConnected: true,
          },
          {
            id: guestId,
            name: 'QA Guest',
            isHost: false,
            isReady: false,
            isConnected: true,
          },
        ],
        settings: defaultSettings,
        snapshot: null,
        lastError: null,
        isActionPending: false,
        qaDevPreview: null,
      })
    },

    showErrorToast(message) {
      useGameStore.setState({ lastError: message })
    },

    clearErrorToast() {
      useGameStore.getState().clearError()
    },

    showActionPending(pending = true) {
      useGameStore.getState().setActionPending(pending)
    },

    selectFirstHandDie() {
      const snap = useGameStore.getState().snapshot
      if (!snap) return null
      const die = snap.dice.find((d) => d.location === 'hand')
      if (!die) return null
      useGameStore.getState().setSelectedDice([die.id])
      return die.id
    },

    seedGameEnd(result = 'win') {
      const snapshot = setupGame({
        difficulty: 'normal',
        maxPlayers: 4,
        crisisEnabled: false,
        players: [{ id: QA_P1, name: 'QA Captain', isHost: true }],
      })
      snapshot.result = result
      snapshot.timerRunning = false

      useGameStore.setState({
        roomCode: 'QAEND1',
        playerId: QA_P1,
        playerName: 'QA Captain',
        hostId: QA_P1,
        status: 'ended',
        localMode: true,
        lobbyPlayers: [
          {
            id: QA_P1,
            name: 'QA Captain',
            isHost: true,
            isReady: true,
            isConnected: true,
          },
        ],
        settings: defaultSettings,
        snapshot,
        modals: { roomActivation: false, crisis: false, gameEnd: true },
        lastError: null,
        isActionPending: false,
        qaDevPreview: null,
      })
      return true
    },
  }
}

export function installQaBridge(): void {
  if (import.meta.env.PROD || !import.meta.env.DEV) {
    return
  }

  const bridge = createBridge()
  window.__PRR_QA__ = bridge
  window.PRR_QA = bridge
}
