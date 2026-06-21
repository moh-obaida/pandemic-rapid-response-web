import type { GameSnapshot } from '../types/engine'

export const DICE_ROLL_ANIM_MS = 750
export const DICE_FACE_FLICKER_MS = 70

function rerollOccurred(prev: GameSnapshot, next: GameSnapshot): boolean {
  if (prev.turnStep !== 'useDice' || next.turnStep !== 'useDice') return false
  const player = next.players.find((p) => p.id === next.activePlayerId)
  const prevPlayer = prev.players.find((p) => p.id === next.activePlayerId)
  return Boolean(player && prevPlayer && player.rerollsUsed > prevPlayer.rerollsUsed)
}

/** Fallback when explicit reroll IDs are unavailable (e.g. remote sync with changed faces). */
export function detectRerolledDieIdsByFaceChange(
  prev: GameSnapshot,
  next: GameSnapshot
): string[] {
  if (!rerollOccurred(prev, next)) return []

  const activeId = next.activePlayerId
  return next.dice
    .filter((d) => d.ownerId === activeId && d.location === 'hand')
    .filter((d) => {
      const prevDie = prev.dice.find((x) => x.id === d.id)
      return prevDie != null && prevDie.face !== d.face
    })
    .map((d) => d.id)
}

/** Resolve reroll animation targets — prefer explicit IDs (same-face rerolls included). */
export function resolveRerollAnimationDieIds(
  prev: GameSnapshot,
  next: GameSnapshot,
  rerolledDieIds?: readonly string[] | null
): string[] {
  if (!rerollOccurred(prev, next)) return []

  if (rerolledDieIds && rerolledDieIds.length > 0) {
    return [...rerolledDieIds]
  }

  return detectRerolledDieIdsByFaceChange(prev, next)
}

/** Detect which dice were rolled/rerolled between two engine snapshots (UI only). */
export function detectRolledDieIds(
  prev: GameSnapshot,
  next: GameSnapshot,
  options?: { rerolledDieIds?: readonly string[] | null }
): string[] {
  const activeId = next.activePlayerId

  if (prev.turnStep === 'roll' && next.turnStep === 'useDice') {
    return next.dice
      .filter((d) => d.ownerId === activeId && d.location === 'hand')
      .map((d) => d.id)
  }

  return resolveRerollAnimationDieIds(prev, next, options?.rerolledDieIds)
}
