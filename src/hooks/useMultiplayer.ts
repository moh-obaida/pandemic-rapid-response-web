import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import {
  isFirebaseConfigured,
  subscribeToRoom,
  subscribeToRoomLocal,
  initFirebase,
} from '../lib/firebase'
import { allPlayersSubmitted } from '../lib/rules'

export function useMultiplayer() {
  const roomCode = useGameStore((s) => s.roomCode)
  const localMode = useGameStore((s) => s.localMode)
  const syncFromFirebase = useGameStore((s) => s.syncFromFirebase)
  const prevPlayersRef = useRef<string>('')

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
      syncFromFirebase({
        status: room.status,
        players: room.players,
        gameState: room.gameState,
        board: room.board,
        settings: room.settings,
        hostId: room.hostId,
      })

      const playerKey = JSON.stringify(
        Object.values(room.players).map((p) => ({
          id: p.id,
          submitted: p.submitted,
        }))
      )
      if (
        playerKey !== prevPlayersRef.current &&
        room.status === 'playing' &&
        allPlayersSubmitted(Object.values(room.players))
      ) {
        prevPlayersRef.current = playerKey
      }
    })

    return unsub
  }, [roomCode, localMode, syncFromFirebase])

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
