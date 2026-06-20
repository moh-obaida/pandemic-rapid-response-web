import { rollDieFace } from '../constants/dice'
import type { DieFace } from '../constants/dice'
import type { GameAction, GameSnapshot, ApplyResult, RuleError } from '../../types/engine'
import { cloneState, rollDiceForPlayer, getRerollsMax } from './setup'
import {
  canAssignDie,
  assignDie,
  activateRoom,
  resolveWasteRoll,
} from './rooms'
import { canMove, applyMove, canFly, applyFly } from './movement'
import { runTimerEvent } from './timer'
import { applySupplySpill, discardTemporaryCrises } from './crisis'

function blockIfPaused(state: GameSnapshot): RuleError | null {
  if (state.turnStep === 'pausedByTimer') {
    return { error: 'Timer event in progress' }
  }
  return null
}

function requireActive(state: GameSnapshot, playerId: string): RuleError | null {
  if (state.activePlayerId !== playerId) return { error: 'Not your turn' }
  return null
}

function requireUseDice(state: GameSnapshot): RuleError | null {
  if (state.turnStep !== 'useDice') return { error: 'Not in use dice phase' }
  if (state.pendingWasteRoll) return { error: 'Resolve waste roll first' }
  return null
}

export function applyAction(
  state: GameSnapshot,
  action: GameAction
): ApplyResult {
  if (state.result) return { error: 'Game ended' }

  const next = cloneState(state)

  switch (action.type) {
    case 'ROLL_DICE': {
      const paused = blockIfPaused(next)
      if (paused) return paused
      if (next.activePlayerId !== action.playerId)
        return { error: 'Not your turn' }
      if (next.turnStep !== 'roll') return { error: 'Already rolled' }
      const hand = rollDiceForPlayer(next, action.playerId)
      next.dice = [
        ...next.dice.filter(
          (d) => d.ownerId !== action.playerId || d.location === 'spent'
        ),
        ...hand,
      ]
      next.turnStep = 'useDice'
      const player = next.players.find((p) => p.id === action.playerId)
      if (player) player.rerollsUsed = 0
      return next
    }

    case 'ASSIGN_DIE': {
      const paused = blockIfPaused(next)
      if (paused) return paused
      const active = requireActive(next, action.playerId)
      if (active) return active
      const phase = requireUseDice(next)
      if (phase) return phase
      const err = canAssignDie(
        next,
        action.playerId,
        action.dieId,
        action.roomId,
        action.slotIndex
      )
      if (err) return { error: err }
      assignDie(next, action.playerId, action.dieId, action.roomId, action.slotIndex)
      return next
    }

    case 'ACTIVATE_ROOM': {
      const paused = blockIfPaused(next)
      if (paused) return paused
      const active = requireActive(next, action.playerId)
      if (active) return active
      const phase = requireUseDice(next)
      if (phase) return phase
      const err = activateRoom(next, action.playerId, action.roomId)
      if (err) return { error: err }
      return next
    }

    case 'RESOLVE_WASTE_ROLL': {
      const paused = blockIfPaused(next)
      if (paused) return paused
      if (next.turnStep !== 'useDice') return { error: 'Not in use dice phase' }
      if (!next.pendingWasteRoll) return { error: 'No pending waste roll' }
      const err = resolveWasteRoll(next, action.dieRolls)
      if (err) return { error: err }
      return next
    }

    case 'SPEND_MOVE': {
      const paused = blockIfPaused(next)
      if (paused) return paused
      const active = requireActive(next, action.playerId)
      if (active) return active
      const phase = requireUseDice(next)
      if (phase) return phase
      const err = canMove(next, action.playerId, action.dieIds, action.targetRoomId)
      if (err) return { error: err }
      applyMove(next, action.playerId, action.dieIds, action.targetRoomId)
      return next
    }

    case 'SPEND_FLY': {
      const paused = blockIfPaused(next)
      if (paused) return paused
      const active = requireActive(next, action.playerId)
      if (active) return active
      const phase = requireUseDice(next)
      if (phase) return phase
      const err = canFly(next, action.playerId, action.dieIds, action.direction)
      if (err) return { error: err }
      applyFly(next, action.playerId, action.dieIds, action.direction)
      return next
    }

    case 'ENGINEER_FLIP': {
      const paused = blockIfPaused(next)
      if (paused) return paused
      const active = requireActive(next, action.playerId)
      if (active) return active
      const phase = requireUseDice(next)
      if (phase) return phase
      const player = next.players.find((p) => p.id === action.playerId)
      if (player?.role !== 'engineer') return { error: 'Engineer only' }
      const die = next.dice.find((d) => d.id === action.dieId)
      if (!die || die.ownerId !== action.playerId || die.location !== 'hand')
        return { error: 'Invalid die' }
      if (die.face !== 'plane') return { error: 'Must flip plane face' }
      die.face = action.targetFace
      return next
    }

    case 'DIRECTOR_PLACE_HQ': {
      const paused = blockIfPaused(next)
      if (paused) return paused
      const active = requireActive(next, action.playerId)
      if (active) return active
      const phase = requireUseDice(next)
      if (phase) return phase
      const player = next.players.find((p) => p.id === action.playerId)
      if (player?.role !== 'director') return { error: 'Director only' }
      const die = next.dice.find((d) => d.id === action.dieId)
      if (!die || die.location !== 'hand') return { error: 'Invalid die' }
      const slots = next.roomSlots.hq
      if (!slots || action.slotIndex < 0 || action.slotIndex >= slots.length)
        return { error: 'Invalid HQ slot' }
      if (slots[action.slotIndex]) return { error: 'HQ slot occupied' }
      die.location = 'hq'
      die.roomId = 'hq'
      die.slotIndex = action.slotIndex
      die.locked = true
      slots[action.slotIndex] = action.dieId
      return next
    }

    case 'REROLL': {
      const paused = blockIfPaused(next)
      if (paused) return paused
      const active = requireActive(next, action.playerId)
      if (active) return active
      const phase = requireUseDice(next)
      if (phase) return phase
      const player = next.players.find((p) => p.id === action.playerId)
      if (!player) return { error: 'Invalid player' }
      const max = getRerollsMax(player.role)
      if (player.rerollsUsed >= max) return { error: 'No rerolls left' }
      for (const dieId of action.dieIds) {
        const die = next.dice.find((d) => d.id === dieId)
        if (!die || die.ownerId !== action.playerId || die.location !== 'hand')
          return { error: 'Can only reroll unassigned dice' }
        die.face = rollDieFace()
      }
      player.rerollsUsed += 1
      return next
    }

    case 'END_TURN': {
      const paused = blockIfPaused(next)
      if (paused) return paused
      const active = requireActive(next, action.playerId)
      if (active) return active
      if (next.turnStep !== 'useDice') return { error: 'Must roll before ending turn' }
      if (next.pendingWasteRoll) return { error: 'Resolve waste roll first' }
      const idx = next.playerOrder.indexOf(action.playerId)
      const nextIdx = (idx + 1) % next.playerOrder.length
      next.activePlayerId = next.playerOrder[nextIdx]
      next.turnStep = 'roll'
      return next
    }

    case 'BEGIN_TIMER_EVENT': {
      if (next.timer > 0) return { error: 'Timer has not expired' }
      if (next.turnStep === 'pausedByTimer') return { error: 'Timer event already in progress' }
      next.timerResumeStep = next.turnStep === 'roll' ? 'roll' : 'useDice'
      next.turnStep = 'pausedByTimer'
      next.timerRunning = false
      return next
    }

    case 'RESOLVE_TIMER_EVENT': {
      if (next.turnStep !== 'pausedByTimer') {
        return { error: 'No timer event to resolve' }
      }
      discardTemporaryCrises(next)
      const err = runTimerEvent(next)
      if (err) return { error: err }
      return next
    }

    case 'SUPPLY_SPILL': {
      const paused = blockIfPaused(next)
      if (paused) return paused
      const err = applySupplySpill(next, action.playerId, action.crateId)
      if (err) return { error: err }
      return next
    }

    default:
      return { error: 'Unknown action' }
  }
}

export function autoResolveWasteRoll(state: GameSnapshot): GameSnapshot {
  if (!state.pendingWasteRoll) return state
  const rolls: Record<string, DieFace> = {}
  for (const id of state.pendingWasteRoll.dieIds) {
    const die = state.dice.find((d) => d.id === id)
    if (die) rolls[id] = rollDieFace()
  }
  const next = cloneState(state)
  resolveWasteRoll(next, rolls)
  return next
}

/** Test helper: full timer interrupt cycle. */
export function resolveTimerEvent(state: GameSnapshot): ApplyResult {
  const begun = applyAction(state, { type: 'BEGIN_TIMER_EVENT' })
  if ('error' in begun) return begun
  return applyAction(begun, { type: 'RESOLVE_TIMER_EVENT' })
}
