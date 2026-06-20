import { useEffect, useRef, useCallback } from 'react'
import { useGameStore, isHost } from '../store/gameStore'
import {
  syncSnapshot,
  syncSnapshotLocal,
} from '../lib/firebase'

const TIMER_EVENT_PAUSE_MS = 450

export function useTimer() {
  const timerRunning = useGameStore((s) => s.snapshot?.timerRunning ?? false)
  const status = useGameStore((s) => s.status)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const resolvingRef = useRef(false)
  const host = isHost()

  const syncSnapshotNow = useCallback(async (snap: NonNullable<ReturnType<typeof useGameStore.getState>['snapshot']>) => {
    const state = useGameStore.getState()
    if (!state.roomCode) return
    if (state.localMode) {
      await syncSnapshotLocal(state.roomCode, snap)
    } else {
      await syncSnapshot(state.roomCode, snap)
    }
  }, [])

  const runTimerEvent = useCallback(async () => {
    if (resolvingRef.current) return
    resolvingRef.current = true
    try {
      const state = useGameStore.getState()
      if (!host && !state.localMode) return

      let snap = state.dispatch({ type: 'BEGIN_TIMER_EVENT' })
      if (snap) {
        await syncSnapshotNow(snap)
        await new Promise((r) => setTimeout(r, TIMER_EVENT_PAUSE_MS))
      }

      snap = useGameStore.getState().dispatch({ type: 'RESOLVE_TIMER_EVENT' })
      if (snap) {
        await syncSnapshotNow(snap)
        if (snap.result) {
          useGameStore.setState({
            status: 'ended',
            modals: { ...useGameStore.getState().modals, gameEnd: true },
          })
        }
      }
    } finally {
      resolvingRef.current = false
    }
  }, [host, syncSnapshotNow])

  const tick = useCallback(async () => {
    const state = useGameStore.getState()
    const snap = state.snapshot
    if (!snap?.timerRunning || state.status !== 'playing') return
    if (!host && !state.localMode) return

    if (snap.timer <= 0) {
      await runTimerEvent()
      return
    }

    const newTimer = snap.timer - 1
    const updated = { ...snap, timer: newTimer }
    useGameStore.setState({ snapshot: updated })

    if (newTimer <= 0) {
      await runTimerEvent()
      return
    }

    if (state.roomCode) {
      await syncSnapshotNow(updated)
    }
  }, [host, runTimerEvent, syncSnapshotNow])

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

  const timer = useGameStore((s) => s.snapshot?.timer ?? 0)
  const turnStep = useGameStore((s) => s.snapshot?.turnStep)
  const timerColor =
    timer <= 30 ? 'danger' : timer <= 60 ? 'warning' : 'success'
  const isFlashing =
    (timer <= 5 && timerRunning) || turnStep === 'pausedByTimer'

  return { timer, timerRunning, timerColor, isFlashing, turnStep }
}
