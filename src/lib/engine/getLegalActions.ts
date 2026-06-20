import type { GameAction, GameSnapshot } from '../../types/engine'
import { ROOM_ORDER } from '../constants/rooms'
import { canAssignDie } from './rooms'
import { canMove, canFly } from './movement'
import { getRerollsMax } from './setup'

export type LegalActionKind = GameAction['type']

export function getLegalActions(
  state: GameSnapshot,
  playerId: string
): LegalActionKind[] {
  if (state.result) return []
  if (state.turnStep === 'pausedByTimer') return []

  const actions: LegalActionKind[] = []
  const isActive = state.activePlayerId === playerId
  const player = state.players.find((p) => p.id === playerId)
  if (!player) return []

  if (isActive && state.turnStep === 'roll') {
    actions.push('ROLL_DICE')
  }

  if (isActive && state.turnStep === 'useDice' && !state.pendingWasteRoll) {
    actions.push('END_TURN')

    const handDice = state.dice.filter(
      (d) => d.ownerId === playerId && d.location === 'hand' && !d.locked
    )
    if (handDice.length > 0) {
      actions.push('REROLL')
      for (const roomId of ROOM_ORDER) {
        if (canMove(state, playerId, [handDice[0].id], roomId) === null) {
          actions.push('SPEND_MOVE')
          break
        }
      }
      const planeDice = handDice.filter((d) => d.face === 'plane')
      if (planeDice.length > 0) {
        if (canFly(state, playerId, [planeDice[0].id], 'left') === null) {
          actions.push('SPEND_FLY')
        }
      }
    }

    if (player.position) {
      actions.push('ACTIVATE_ROOM')
      const slots = state.roomSlots[player.position] ?? []
      for (let i = 0; i < slots.length; i++) {
        for (const die of handDice) {
          if (canAssignDie(state, playerId, die.id, player.position, i) === null) {
            actions.push('ASSIGN_DIE')
            break
          }
        }
      }
    }

    if (player.role === 'engineer') {
      actions.push('ENGINEER_FLIP')
    }
    if (player.role === 'director') {
      actions.push('DIRECTOR_PLACE_HQ')
    }
  }

  if (state.pendingWasteRoll && isActive) {
    actions.push('RESOLVE_WASTE_ROLL')
  }

  return [...new Set(actions)]
}

export function getRerollsRemaining(
  state: GameSnapshot,
  playerId: string
): number {
  const player = state.players.find((p) => p.id === playerId)
  if (!player) return 0
  return getRerollsMax(player.role) - player.rerollsUsed
}
