import { describe, it, expect } from 'vitest'
import { setupGame, applyAction, cloneState } from '../engine'
import {
  detectRolledDieIds,
  detectRerolledDieIdsByFaceChange,
  resolveRerollAnimationDieIds,
} from '../diceRollAnimation'

describe('detectRolledDieIds', () => {
  const basePlayers = [
    { id: 'p1', name: 'A', isHost: true },
    { id: 'p2', name: 'B', isHost: false },
  ]

  it('returns all hand dice when turn moves from roll to useDice', () => {
    const prev = setupGame({
      difficulty: 'normal',
      maxPlayers: 4,
      crisisEnabled: false,
      players: basePlayers,
      rng: () => 0.5,
    })
    const next = applyAction(cloneState(prev), { type: 'ROLL_DICE', playerId: 'p1' })
    if ('error' in next) throw new Error(next.error)

    const ids = detectRolledDieIds(prev, next)
    expect(ids).toHaveLength(6)
    expect(ids.every((id) => next.dice.some((d) => d.id === id && d.location === 'hand'))).toBe(
      true
    )
  })

  it('returns explicit reroll IDs when provided, even if the face is unchanged', () => {
    let state = setupGame({
      difficulty: 'normal',
      maxPlayers: 4,
      crisisEnabled: false,
      players: basePlayers,
      rng: () => 0.5,
    })
    state = applyAction(state, { type: 'ROLL_DICE', playerId: 'p1' }) as typeof state
    const handDie = state.dice.find((d) => d.ownerId === 'p1' && d.location === 'hand')!
    const prev = cloneState(state)

    const next = cloneState(state)
    next.players.find((p) => p.id === 'p1')!.rerollsUsed += 1

    const ids = resolveRerollAnimationDieIds(prev, next, [handDie.id])
    expect(ids).toEqual([handDie.id])

    const viaDetect = detectRolledDieIds(prev, next, { rerolledDieIds: [handDie.id] })
    expect(viaDetect).toEqual([handDie.id])
  })

  it('falls back to face-changed dice when explicit reroll IDs are missing', () => {
    let state = setupGame({
      difficulty: 'normal',
      maxPlayers: 4,
      crisisEnabled: false,
      players: basePlayers,
      rng: () => 0.5,
    })
    state = applyAction(state, { type: 'ROLL_DICE', playerId: 'p1' }) as typeof state
    const prev = cloneState(state)
    const handId = state.dice.find((d) => d.ownerId === 'p1' && d.location === 'hand')!.id

    const next = applyAction(state, { type: 'REROLL', playerId: 'p1', dieIds: [handId] })
    if ('error' in next) throw new Error(next.error)

    expect(detectRerolledDieIdsByFaceChange(prev, next)).toEqual([handId])
    expect(resolveRerollAnimationDieIds(prev, next)).toEqual([handId])
  })

  it('returns empty for same-face reroll when explicit IDs are not provided', () => {
    let state = setupGame({
      difficulty: 'normal',
      maxPlayers: 4,
      crisisEnabled: false,
      players: basePlayers,
      rng: () => 0.5,
    })
    state = applyAction(state, { type: 'ROLL_DICE', playerId: 'p1' }) as typeof state
    const prev = cloneState(state)

    const next = cloneState(state)
    next.players.find((p) => p.id === 'p1')!.rerollsUsed += 1

    expect(resolveRerollAnimationDieIds(prev, next)).toEqual([])
  })

  it('returns empty when a die face changes without a reroll', () => {
    let state = setupGame({
      difficulty: 'normal',
      maxPlayers: 4,
      crisisEnabled: false,
      players: [{ id: 'p1', name: 'A', isHost: true }],
      rng: () => 0.5,
    })
    state = applyAction(state, { type: 'ROLL_DICE', playerId: 'p1' }) as typeof state
    state.players[0].role = 'engineer'
    state.dice[0].face = 'plane'
    const planeId = state.dice[0].id
    const prev = cloneState(state)

    const next = applyAction(state, {
      type: 'ENGINEER_FLIP',
      playerId: 'p1',
      dieId: planeId,
      targetFace: 'water',
    })
    if ('error' in next) throw new Error(next.error)

    expect(detectRolledDieIds(prev, next)).toEqual([])
  })
})
