import { useState, useCallback } from 'react'
import { useGameStore, getCurrentPlayer } from '../store/gameStore'
import { rerollDie, moveDieTechnician } from '../lib/rules'
import type { Die } from '../types/game'

export function useDice() {
  const currentPlayer = getCurrentPlayer()
  const updateLocalPlayer = useGameStore((s) => s.updateLocalPlayer)
  const [rolling, setRolling] = useState(false)

  const canReroll =
    currentPlayer &&
    currentPlayer.rerollsUsed < currentPlayer.rerollsMax

  const reroll = useCallback(
    (dieId: string) => {
      if (!currentPlayer || !canReroll) return
      const die = currentPlayer.dice.find((d) => d.id === dieId)
      if (!die || die.locked) return

      setRolling(true)
      setTimeout(() => {
        const engineerLower = currentPlayer.role === 'engineer'
        let newDie = rerollDie(die, engineerLower)
        if (currentPlayer.role === 'technician') {
          newDie = moveDieTechnician(newDie)
        }
        const updated = {
          ...currentPlayer,
          dice: currentPlayer.dice.map((d) => (d.id === dieId ? newDie : d)),
          rerollsUsed: currentPlayer.rerollsUsed + 1,
        }
        updateLocalPlayer(updated)
        setRolling(false)
      }, 400)
    },
    [currentPlayer, canReroll, updateLocalPlayer]
  )

  const rerollAll = useCallback(() => {
    if (!currentPlayer || !canReroll) return
    setRolling(true)
    setTimeout(() => {
      const engineerLower = currentPlayer.role === 'engineer'
      const updated = {
        ...currentPlayer,
        dice: currentPlayer.dice.map((d) => {
          if (d.locked) return d
          let newDie = rerollDie(d, engineerLower)
          if (currentPlayer.role === 'technician') {
            newDie = moveDieTechnician(newDie)
          }
          return newDie
        }),
        rerollsUsed: currentPlayer.rerollsUsed + 1,
      }
      updateLocalPlayer(updated)
      setRolling(false)
    }, 400)
  }, [currentPlayer, canReroll, updateLocalPlayer])

  const rerollsRemaining = currentPlayer
    ? currentPlayer.rerollsMax - currentPlayer.rerollsUsed
    : 0

  return {
    dice: currentPlayer?.dice ?? ([] as Die[]),
    rolling,
    canReroll: Boolean(canReroll),
    rerollsRemaining,
    reroll,
    rerollAll,
  }
}
