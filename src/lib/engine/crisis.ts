import type { CrisisCardInstance } from '../constants/crises'
import { getRoleStartingRoom } from '../constants/roles'
import { CITY_COUNT } from '../constants/cities'
import type { GameSnapshot } from '../../types/engine'
import { pathDistance } from './movement'
import { transferOneCrateFromCargoToRoom } from './crates'

export function resolveCrisisDraw(
  state: GameSnapshot,
  crisis: CrisisCardInstance
): string | null {
  switch (crisis.definitionId) {
    case 'distraction': {
      state.activeTemporaryCrises.push({ instance: crisis, distractionDice: [] })
      for (const player of state.players) {
        const die = state.dice.find(
          (d) => d.ownerId === player.id && d.location === 'hand' && !d.locked
        )
        if (die) {
          die.location = 'distraction'
          const active = state.activeTemporaryCrises.find(
            (c) => c.instance.instanceId === crisis.instanceId
          )
          active?.distractionDice?.push(die.id)
        }
      }
      break
    }
    case 'turbulence':
      state.turbulenceActive = true
      state.activeTemporaryCrises.push({ instance: crisis })
      break
    case 'extreme-winds':
      state.extremeWindsActive = true
      state.activeTemporaryCrises.push({ instance: crisis })
      break
    case 'equipment-failure':
      for (const roomId of Object.keys(state.roomSlots) as import('../../types/board').RoomId[]) {
        const slots = state.roomSlots[roomId] ?? []
        for (const dieId of slots) {
          if (!dieId) continue
          const die = state.dice.find((d) => d.id === dieId)
          if (die) {
            die.location = 'spent'
            die.locked = true
            die.roomId = undefined
            die.slotIndex = undefined
          }
        }
        slots.fill(null)
      }
      break
    case 'safety-drill':
      for (const player of state.players) {
        player.position = getRoleStartingRoom(player.role)
      }
      break
    case 'evacuation': {
      const faceUp = state.cities.filter((c) => c.status === 'faceUpOnPath')
      let closest = state.planePosition
      let minDist = CITY_COUNT
      for (const c of faceUp) {
        const d = pathDistance(state.planePosition, c.cityIndex)
        if (d < minDist) {
          minDist = d
          closest = c.cityIndex
        }
      }
      const away =
        closest >= state.planePosition
          ? state.planePosition - 6
          : state.planePosition + 6
      state.planePosition = ((away % CITY_COUNT) + CITY_COUNT) % CITY_COUNT
      break
    }
    case 'supply-spill':
      break
    default:
      if (crisis.type === 'deliveryBlocker') {
        const faceUp = state.cities.filter((c) => c.status === 'faceUpOnPath')
        if (faceUp.length === 0) break
        let nearest = faceUp[0]
        let minD = pathDistance(state.planePosition, nearest.cityIndex)
        for (const c of faceUp) {
          const d = pathDistance(state.planePosition, c.cityIndex)
          if (d < minD) {
            minD = d
            nearest = c
          }
        }
        nearest.blockers.push(crisis)
      }
      break
  }
  return null
}

export function applySupplySpill(
  state: GameSnapshot,
  playerId: string,
  crateId: string
): string | null {
  if (state.activePlayerId !== playerId) return 'Not your turn'
  if (!transferOneCrateFromCargoToRoom(state, crateId)) return 'Invalid crate'
  return null
}

export function discardTemporaryCrises(state: GameSnapshot): void {
  for (const temp of state.activeTemporaryCrises) {
    if (temp.distractionDice) {
      for (const dieId of temp.distractionDice) {
        const die = state.dice.find((d) => d.id === dieId)
        if (die) {
          die.location = 'spent'
          die.locked = true
        }
      }
    }
  }
  state.activeTemporaryCrises = []
  state.turbulenceActive = false
  state.extremeWindsActive = false
}
