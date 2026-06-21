import { useCallback, useEffect, useRef, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import {
  DICE_ROLL_ANIM_MS,
  detectRolledDieIds,
} from '../lib/diceRollAnimation'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/** Visual-only rolling state driven by engine snapshot diffs (works for local + multiplayer sync). */
export function useDiceRollAnimation() {
  const snapshot = useGameStore((s) => s.snapshot)
  const prefersReducedMotion = usePrefersReducedMotion()
  const [rollingDieIds, setRollingDieIds] = useState<ReadonlySet<string>>(() => new Set())
  const prevSnapshotRef = useRef(snapshot)
  const pendingRerollIdsRef = useRef<string[] | null>(null)
  const clearTimerRef = useRef<number | null>(null)

  const triggerRolling = useCallback(
    (ids: string[]) => {
      if (prefersReducedMotion || ids.length === 0) return

      if (clearTimerRef.current != null) {
        window.clearTimeout(clearTimerRef.current)
      }

      setRollingDieIds(new Set(ids))
      clearTimerRef.current = window.setTimeout(() => {
        setRollingDieIds(new Set())
        clearTimerRef.current = null
      }, DICE_ROLL_ANIM_MS)
    },
    [prefersReducedMotion]
  )

  const queueRerollAnimation = useCallback((dieIds: readonly string[]) => {
    pendingRerollIdsRef.current = dieIds.length > 0 ? [...dieIds] : null
  }, [])

  useEffect(() => {
    const prev = prevSnapshotRef.current
    prevSnapshotRef.current = snapshot

    if (!prev || !snapshot) return

    const explicitRerollIds = pendingRerollIdsRef.current
    const rolledIds = detectRolledDieIds(prev, snapshot, {
      rerolledDieIds: explicitRerollIds,
    })

    if (explicitRerollIds != null) {
      pendingRerollIdsRef.current = null
    }

    if (rolledIds.length > 0) {
      triggerRolling(rolledIds)
    }
  }, [snapshot, triggerRolling])

  useEffect(
    () => () => {
      if (clearTimerRef.current != null) {
        window.clearTimeout(clearTimerRef.current)
      }
    },
    []
  )

  const isDieRolling = useCallback(
    (dieId: string) => rollingDieIds.has(dieId),
    [rollingDieIds]
  )

  return {
    rollingDieIds,
    isDieRolling,
    isRollingAny: rollingDieIds.size > 0,
    queueRerollAnimation,
  }
}
