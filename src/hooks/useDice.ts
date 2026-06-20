import { useState, useCallback } from 'react'
import { useGame } from './useGame'
import type { EngineDie } from '../types/engine'

export function useDice() {
  const { currentPlayer, rerollDice, rerollsRemaining, turnStep, isMyTurn } =
    useGame()
  const [rolling, setRolling] = useState(false)

  const canReroll =
    isMyTurn &&
    turnStep === 'useDice' &&
    currentPlayer &&
    rerollsRemaining > 0

  const reroll = useCallback(
    async (dieId: string) => {
      if (!canReroll) return
      setRolling(true)
      await rerollDice([dieId])
      setRolling(false)
    },
    [canReroll, rerollDice]
  )

  const rerollAll = useCallback(async () => {
    if (!canReroll || !currentPlayer) return
    const ids = currentPlayer.dice
      .filter((d) => d.location === 'hand' && !d.locked)
      .map((d) => d.id)
    if (ids.length === 0) return
    setRolling(true)
    await rerollDice(ids)
    setRolling(false)
  }, [canReroll, currentPlayer, rerollDice])

  return {
    dice: (currentPlayer?.dice ?? []) as EngineDie[],
    rolling,
    canReroll: Boolean(canReroll),
    rerollsRemaining,
    reroll,
    rerollAll,
  }
}
