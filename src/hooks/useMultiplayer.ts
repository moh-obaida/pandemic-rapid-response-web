import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import {
  isFirebaseConfigured,
  subscribeToRoom,
  subscribeToRoomLocal,
  initFirebase,
  syncFullRoom,
  syncFullRoomLocal,
  clearPendingAction,
} from '../lib/firebase'
import { applyAction } from '../lib/engine'
import { isRuleError } from '../types/engine'
import type { FirebaseRoom } from '../types/firebase'

async function processPendingAction(
  roomCode: string,
  room: FirebaseRoom,
  localMode: boolean
): Promise<void> {
  const pending = room.pendingAction
  if (!pending || !room.snapshot) return

  const result = applyAction(room.snapshot, pending.action)
  if (isRuleError(result)) {
    await clearPendingAction(roomCode, localMode)
    return
  }

  const updates: Partial<FirebaseRoom> = {
    snapshot: result,
    pendingAction: null,
  }
  if (result.result) {
    updates.status = 'ended'
  }

  if (localMode) {
    await syncFullRoomLocal(roomCode, updates)
  } else {
    await syncFullRoom(roomCode, updates)
  }
}

export function useMultiplayer() {
  const roomCode = useGameStore((s) => s.roomCode)
  const localMode = useGameStore((s) => s.localMode)
  const playerId = useGameStore((s) => s.playerId)
  const hostId = useGameStore((s) => s.hostId)
  const syncFromFirebase = useGameStore((s) => s.syncFromFirebase)
  const isHost = playerId === hostId
  const processingRef = useRef<string | null>(null)

  useEffect(() => {
    if (!roomCode) return

    if (!localMode && isFirebaseConfigured()) {
      initFirebase()
    }

    const subscribe = localMode || !isFirebaseConfigured()
      ? subscribeToRoomLocal
      : subscribeToRoom

    const unsub = subscribe(roomCode, (room) => {
      if (!room) return

      if (
        isHost &&
        room.pendingAction &&
        room.pendingAction.id !== processingRef.current &&
        room.status === 'playing'
      ) {
        processingRef.current = room.pendingAction.id
        void processPendingAction(roomCode, room, localMode).finally(() => {
          processingRef.current = null
        })
      }

      syncFromFirebase({
        status: room.status,
        lobbyPlayers: room.lobbyPlayers,
        snapshot: room.snapshot,
        settings: room.settings,
        hostId: room.hostId,
      })
    })

    return unsub
  }, [roomCode, localMode, syncFromFirebase, isHost])

  return { connected: Boolean(roomCode) }
}

export function useHostActions() {
  const roomCode = useGameStore((s) => s.roomCode)
  const playerId = useGameStore((s) => s.playerId)
  const hostId = useGameStore((s) => s.hostId)
  const localMode = useGameStore((s) => s.localMode)
  const isHost = playerId === hostId

  return { isHost, roomCode, localMode }
}
