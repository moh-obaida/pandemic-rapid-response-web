import { useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '../store/gameStore'
import { syncGameState, syncFullRoomLocal } from '../lib/firebase'
import { TIMER_SECONDS } from '../lib/constants'
import { checkLoseCondition } from '../lib/rules'

export function useTimer() {
  const timer = useGameStore((s) => s.gameState.timer)
  const timerRunning = useGameStore((s) => s.gameState.timerRunning)
  const roomCode = useGameStore((s) => s.roomCode)
  const localMode = useGameStore((s) => s.localMode)
  const status = useGameStore((s) => s.status)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isHost = useGameStore((s) => s.playerId === s.hostId)

  const tick = useCallback(() => {
    const state = useGameStore.getState()
    if (!state.gameState.timerRunning || state.gameState.timer <= 0) return

    const newTimer = state.gameState.timer - 1
    const gs = { ...state.gameState, timer: newTimer }

    if (newTimer <= 0) {
      gs.timerRunning = false
      if (checkLoseCondition(gs)) {
        gs.result = 'lose'
        useGameStore.setState({ status: 'ended', gameState: gs })
        useGameStore.getState().setModal('gameEnd', true)
      }
    }

    useGameStore.setState({ gameState: gs })

    if (roomCode && isHost) {
      if (localMode) {
        syncFullRoomLocal(roomCode, { gameState: gs })
      } else {
        syncGameState(roomCode, { timer: newTimer, timerRunning: gs.timerRunning, result: gs.result })
      }
    }
  }, [roomCode, isHost, localMode])

  useEffect(() => {
    if (status !== 'playing' || !timerRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(tick, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [status, timerRunning, tick])

  const startTimer = useCallback(() => {
    const gs = useGameStore.getState().gameState
    useGameStore.setState({
      gameState: { ...gs, timer: TIMER_SECONDS, timerRunning: true },
    })
  }, [])

  const stopTimer = useCallback(() => {
    const gs = useGameStore.getState().gameState
    useGameStore.setState({
      gameState: { ...gs, timerRunning: false },
    })
  }, [])

  const timerColor =
    timer <= 30 ? 'danger' : timer <= 60 ? 'warning' : 'success'
  const isFlashing = timer <= 5 && timerRunning

  return { timer, timerRunning, timerColor, isFlashing, startTimer, stopTimer }
}
