/**
 * DEV-ONLY QA helpers for Playwright screenshot runs.
 * Loaded via dynamic import in main.tsx when import.meta.env.DEV is true.
 * Must never be imported from production code paths.
 */
import { useGameStore } from '../store/gameStore'
import { setupGame } from './engine/setup'
import type { GameSettings } from '../types/game'

export interface PrrQaBridge {
  reset: () => void
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
  }
}

const defaultSettings: GameSettings = {
  difficulty: 'normal',
  aiReplacement: false,
  maxPlayers: 4,
  crisisEnabled: false,
}

export function installQaBridge(): void {
  if (import.meta.env.PROD || !import.meta.env.DEV) {
    return
  }

  window.__PRR_QA__ = {
    reset() {
      useGameStore.getState().reset()
    },

    seedWaitingForHost(roomCode = 'QAHOST') {
      const hostId = 'qa-host-id'
      const guestId = 'qa-guest-id'
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
        players: [{ id: 'qa-player', name: 'QA Captain', isHost: true }],
      })
      snapshot.result = result

      useGameStore.setState({
        roomCode: 'QAEND1',
        playerId: 'qa-player',
        playerName: 'QA Captain',
        hostId: 'qa-player',
        status: 'ended',
        localMode: true,
        lobbyPlayers: [
          {
            id: 'qa-player',
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
      })
      return true
    },
  }
}
