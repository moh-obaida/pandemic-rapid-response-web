import { describe, it, expect } from 'vitest'
import {
  checkWinCondition,
  checkLoseCondition,
  getRoleRerollMax,
  createDice,
  calculateWaste,
  deliverToCity,
} from '../rules'
import { createCities } from '../constants'
import type { Player } from '../../types/game'
import type { RoomId } from '../../types/board'

describe('rules', () => {
  it('checkWinCondition when all cities delivered', () => {
    const cities = createCities().map((c) => ({ ...c, delivered: true }))
    expect(checkWinCondition(cities)).toBe(true)
  })

  it('checkLoseCondition when waste max reached', () => {
    expect(
      checkLoseCondition({
        round: 1,
        phase: 'assigning',
        timer: 60,
        timerRunning: true,
        waste: 12,
        wasteMax: 12,
        timeTokens: 5,
        timeTokensMax: 9,
        supplies: [],
        result: null,
      })
    ).toBe(true)
  })

  it('analyst gets 3 rerolls', () => {
    expect(getRoleRerollMax('analyst')).toBe(3)
  })

  it('creates 6 dice per player', () => {
    expect(createDice()).toHaveLength(6)
  })

  it('deliverToCity removes supply and marks city', () => {
    const cities = createCities()
    const city = cities[0]
    const supplies = [
      {
        id: 's1',
        type: city.supplyNeeded,
        room: 'cargo' as RoomId,
        inCargo: true,
      },
    ]
    const result = deliverToCity(city.id, cities, supplies)
    expect(result.cities.find((c) => c.id === city.id)?.delivered).toBe(true)
    expect(result.supplies).toHaveLength(0)
  })

  it('calculateWaste counts unassigned dice', () => {
    const player: Player = {
      id: '1',
      name: 'Test',
      role: 'analyst',
      dice: createDice().map((d) => ({ ...d, assignedRoom: null })),
      rerollsUsed: 0,
      rerollsMax: 3,
      suppliesCarried: 0,
      missedTurns: 0,
      isHost: true,
      isReady: true,
      isConnected: true,
      submitted: false,
    }
    expect(calculateWaste([player])).toBe(6)
  })
})
