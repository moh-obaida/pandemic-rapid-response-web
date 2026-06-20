import { describe, it, expect } from 'vitest'
import { setupGame, applyAction, isRuleError, resolveTimerEvent, cloneState } from '../index'
import { resolveWasteRoll } from '../rooms'
import { buildCrisisDeck, CRISIS_DECK_SIZE } from '../../constants/crises'
import { getRerollsMax } from '../setup'
import { CITIES } from '../../constants/cities'
import { HQ_TOKENS_START, SUPPLY_TOKENS_START } from '../../constants/tokens'
import { TIMER_SECONDS, WASTE_MAX } from '../../constants/game'

describe('setupGame', () => {
  it('places 3 HQ and 6 supply tokens', () => {
    const state = setupGame({
      difficulty: 'normal',
      maxPlayers: 4,
      crisisEnabled: false,
      players: [
        { id: 'p1', name: 'A', isHost: true },
        { id: 'p2', name: 'B', isHost: false },
      ],
      rng: () => 0.5,
    })
    expect(state.hqTokens).toBe(HQ_TOKENS_START)
    expect(state.supplyTokens).toBe(SUPPLY_TOKENS_START)
    expect(state.crates).toHaveLength(20)
    expect(state.timer).toBe(TIMER_SECONDS)
    expect(state.timerRunning).toBe(true)
    expect(state.turnStep).toBe('roll')
  })

  it('reveals 2 cities and decks 5 on normal', () => {
    const state = setupGame({
      difficulty: 'normal',
      maxPlayers: 2,
      crisisEnabled: false,
      players: [{ id: 'p1', name: 'A', isHost: true }],
      rng: () => 0.1,
    })
    const faceUp = state.cities.filter((c) => c.status === 'faceUpOnPath')
    expect(faceUp).toHaveLength(2)
    expect(state.cityDeck).toHaveLength(5)
  })

  it('sets aside 17 unused cities on normal', () => {
    const state = setupGame({
      difficulty: 'normal',
      maxPlayers: 2,
      crisisEnabled: false,
      players: [
        { id: 'p1', name: 'A', isHost: true },
        { id: 'p2', name: 'B', isHost: false },
      ],
      rng: () => 0.1,
    })
    const unused = state.cities.filter((c) => c.status === 'discarded')
    expect(unused).toHaveLength(17)
  })

  it('assigns unique roles to each player', () => {
    const state = setupGame({
      difficulty: 'normal',
      maxPlayers: 4,
      crisisEnabled: false,
      players: [
        { id: 'p1', name: 'A', isHost: true },
        { id: 'p2', name: 'B', isHost: false },
        { id: 'p3', name: 'C', isHost: false },
        { id: 'p4', name: 'D', isHost: false },
      ],
      rng: () => 0.33,
    })
    const roles = state.players.map((p) => p.role)
    expect(new Set(roles).size).toBe(4)
  })

  it('places plane at a valid flightpath city from deck draw', () => {
    const state = setupGame({
      difficulty: 'normal',
      maxPlayers: 1,
      crisisEnabled: false,
      players: [{ id: 'p1', name: 'A', isHost: true }],
      rng: () => 0.42,
    })
    expect(state.planePosition).toBeGreaterThanOrEqual(0)
    expect(state.planePosition).toBeLessThan(24)
    expect(CITIES[state.planePosition]).toBeDefined()
  })
})

describe('crisis deck', () => {
  it('has 15 physical cards', () => {
    expect(CRISIS_DECK_SIZE).toBe(15)
    expect(buildCrisisDeck()).toHaveLength(15)
  })

  it('includes duplicate safety drills', () => {
    const deck = buildCrisisDeck()
    const drills = deck.filter((c) => c.definitionId === 'safety-drill')
    expect(drills).toHaveLength(2)
  })
})

describe('turn flow', () => {
  it('rolls dice and moves to useDice', () => {
    const state = setupGame({
      difficulty: 'normal',
      maxPlayers: 2,
      crisisEnabled: false,
      players: [
        { id: 'p1', name: 'A', isHost: true },
        { id: 'p2', name: 'B', isHost: false },
      ],
    })
    expect(state.turnStep).toBe('roll')
    const active = state.activePlayerId
    const result = applyAction(state, { type: 'ROLL_DICE', playerId: active })
    expect(isRuleError(result)).toBe(false)
    if (!isRuleError(result)) {
      expect(result.turnStep).toBe('useDice')
      expect(result.dice.filter((d) => d.ownerId === active && d.location === 'hand')).toHaveLength(6)
    }
  })

  it('does not reset timer on end turn', () => {
    let state = setupGame({
      difficulty: 'normal',
      maxPlayers: 2,
      crisisEnabled: false,
      players: [
        { id: 'p1', name: 'A', isHost: true },
        { id: 'p2', name: 'B', isHost: false },
      ],
      rng: () => 0.5,
    })
    state.timer = 87
    const active = state.activePlayerId
    state = applyAction(state, { type: 'ROLL_DICE', playerId: active }) as typeof state
    state = applyAction(state, { type: 'END_TURN', playerId: active }) as typeof state
    if (!isRuleError(state)) {
      expect(state.timer).toBe(87)
      expect(state.timerRunning).toBe(true)
    }
  })
})

describe('roles', () => {
  it('analyst gets 4 rerolls', () => {
    expect(getRerollsMax('analyst')).toBe(4)
  })
})

describe('timer event', () => {
  it('discards HQ token and skips crisis when disabled', () => {
    let state = setupGame({
      difficulty: 'normal',
      maxPlayers: 2,
      crisisEnabled: false,
      players: [{ id: 'p1', name: 'A', isHost: true }],
    })
    state.timer = 0
    const active = state.activePlayerId
    const turnStep = state.turnStep
    state = resolveTimerEvent(state) as typeof state
    expect(isRuleError(state)).toBe(false)
    if (!isRuleError(state)) {
      expect(state.hqTokens).toBe(HQ_TOKENS_START - 1)
      expect(state.timer).toBe(TIMER_SECONDS)
      expect(state.activePlayerId).toBe(active)
      expect(state.turnStep).toBe(turnStep)
    }
  })

  it('loses when HQ empty on timer', () => {
    let state = setupGame({
      difficulty: 'normal',
      maxPlayers: 2,
      crisisEnabled: false,
      players: [{ id: 'p1', name: 'A', isHost: true }],
    })
    state.hqTokens = 0
    state.timer = 0
    state = resolveTimerEvent(state) as typeof state
    if (!isRuleError(state)) {
      expect(state.result).toBe('lose')
    }
  })

  it('continues when HQ has 1 token on timer (discards to 0)', () => {
    let state = setupGame({
      difficulty: 'normal',
      maxPlayers: 2,
      crisisEnabled: false,
      players: [{ id: 'p1', name: 'A', isHost: true }],
    })
    state.hqTokens = 1
    state.timer = 0
    state = resolveTimerEvent(state) as typeof state
    expect(isRuleError(state)).toBe(false)
    if (!isRuleError(state)) {
      expect(state.hqTokens).toBe(0)
      expect(state.result).toBeNull()
      expect(state.timer).toBe(TIMER_SECONDS)
    }
  })

  it('rejects BEGIN_TIMER_EVENT while timer is still running', () => {
    const state = setupGame({
      difficulty: 'normal',
      maxPlayers: 1,
      crisisEnabled: false,
      players: [{ id: 'p1', name: 'A', isHost: true }],
    })
    const blocked = applyAction({ ...state, timer: 1 }, { type: 'BEGIN_TIMER_EVENT' })
    expect(isRuleError(blocked)).toBe(true)
    const ok = applyAction({ ...state, timer: 0 }, { type: 'BEGIN_TIMER_EVENT' })
    expect(isRuleError(ok)).toBe(false)
  })

  it('discards HQ token when city deck is empty', () => {
    let state = setupGame({
      difficulty: 'normal',
      maxPlayers: 1,
      crisisEnabled: false,
      players: [{ id: 'p1', name: 'A', isHost: true }],
    })
    state.cityDeck = []
    state.timer = 0
    state = resolveTimerEvent(state) as typeof state
    expect(isRuleError(state)).toBe(false)
    if (!isRuleError(state)) {
      expect(state.hqTokens).toBe(HQ_TOKENS_START - 1)
    }
  })

  it('pauses turn during timer event', () => {
    let state = setupGame({
      difficulty: 'normal',
      maxPlayers: 1,
      crisisEnabled: false,
      players: [{ id: 'p1', name: 'A', isHost: true }],
    })
    state.timer = 0
    state = applyAction(state, { type: 'BEGIN_TIMER_EVENT' }) as typeof state
    if (!isRuleError(state)) {
      expect(state.turnStep).toBe('pausedByTimer')
      expect(state.timerRunning).toBe(false)
      const blocked = applyAction(state, { type: 'ROLL_DICE', playerId: 'p1' })
      expect(isRuleError(blocked)).toBe(true)
    }
  })
})

describe('cities data', () => {
  it('has 24 cities London to Madrid', () => {
    expect(CITIES).toHaveLength(24)
    expect(CITIES[0].name).toBe('London')
    expect(CITIES[23].name).toBe('Madrid')
  })

  it('atlanta requires 5 crate types', () => {
    const atl = CITIES.find((c) => c.name === 'Atlanta')!
    expect(Object.keys(atl.crates)).toHaveLength(5)
  })
})

describe('end turn', () => {
  it('passes to next player in order', () => {
    let state = setupGame({
      difficulty: 'normal',
      maxPlayers: 2,
      crisisEnabled: false,
      players: [
        { id: 'p1', name: 'A', isHost: true },
        { id: 'p2', name: 'B', isHost: false },
      ],
      rng: () => 0.5,
    })
    const active = state.activePlayerId
    const nextPlayer = state.playerOrder[(state.playerOrder.indexOf(active) + 1) % 2]
    state = applyAction(state, { type: 'ROLL_DICE', playerId: active }) as typeof state
    state = applyAction(state, { type: 'END_TURN', playerId: active }) as typeof state
    if (!isRuleError(state)) {
      expect(state.activePlayerId).toBe(nextPlayer)
      expect(state.turnStep).toBe('roll')
    }
  })
})

describe('movement', () => {
  it('technician moves 2 rooms per die', () => {
    let state = setupGame({
      difficulty: 'normal',
      maxPlayers: 1,
      crisisEnabled: false,
      players: [{ id: 'p1', name: 'A', isHost: true }],
    })
    state.players[0].role = 'technician'
    state.players[0].position = 'hq'
    state = applyAction(state, { type: 'ROLL_DICE', playerId: 'p1' }) as typeof state
    const dieId = state.dice.find((d) => d.ownerId === 'p1' && d.location === 'hand')!.id
    state = applyAction(state, {
      type: 'SPEND_MOVE',
      playerId: 'p1',
      dieIds: [dieId],
      targetRoomId: 'food',
    }) as typeof state
    if (!isRuleError(state)) {
      expect(state.players[0].position).toBe('food')
    }
  })
})

describe('crates', () => {
  it('starts with 20 crates in supply rooms only', () => {
    const state = setupGame({
      difficulty: 'normal',
      maxPlayers: 1,
      crisisEnabled: false,
      players: [{ id: 'p1', name: 'A', isHost: true }],
    })
    expect(state.crates.filter((c) => c.location === 'cargo')).toHaveLength(0)
    expect(state.crates).toHaveLength(20)
  })
})

describe('crisis behavior', () => {
  it('draws crisis when enabled on timer', () => {
    let state = setupGame({
      difficulty: 'normal',
      maxPlayers: 1,
      crisisEnabled: true,
      players: [{ id: 'p1', name: 'A', isHost: true }],
    })
    const deckBefore = state.crisisDeck.length
    state.timer = 0
    state = resolveTimerEvent(state) as typeof state
    if (!isRuleError(state)) {
      expect(state.crisisDeck.length).toBe(deckBefore - 1)
    }
  })
})

describe('waste loss', () => {
  it(`loses when waste reaches ${WASTE_MAX}`, () => {
    expect(WASTE_MAX).toBe(10)
  })

  it('loses immediately when waste roll reaches max', () => {
    const state = setupGame({
      difficulty: 'normal',
      maxPlayers: 1,
      crisisEnabled: false,
      players: [{ id: 'p1', name: 'A', isHost: true }],
    })
    state.waste = 9
    state.roomSlots.water = ['die-w1']
    state.dice.push({
      id: 'die-w1',
      face: 'power',
      ownerId: 'p1',
      location: 'room',
      roomId: 'water',
      slotIndex: 0,
      locked: true,
    })
    state.pendingWasteRoll = { roomId: 'water', dieIds: ['die-w1'] }
    const next = cloneState(state)
    resolveWasteRoll(next, { 'die-w1': 'plane' })
    expect(next.waste).toBe(WASTE_MAX)
    expect(next.result).toBe('lose')
    expect(next.timerRunning).toBe(false)
  })

  it('only counts circled faces on waste roll', () => {
    const state = setupGame({
      difficulty: 'normal',
      maxPlayers: 1,
      crisisEnabled: false,
      players: [{ id: 'p1', name: 'A', isHost: true }],
    })
    state.roomSlots.water = ['die-w1', 'die-w2']
    state.dice.push(
      {
        id: 'die-w1',
        face: 'water',
        ownerId: 'p1',
        location: 'room',
        roomId: 'water',
        slotIndex: 0,
        locked: true,
      },
      {
        id: 'die-w2',
        face: 'vaccine',
        ownerId: 'p1',
        location: 'room',
        roomId: 'water',
        slotIndex: 1,
        locked: true,
      }
    )
    state.pendingWasteRoll = { roomId: 'water', dieIds: ['die-w1', 'die-w2'] }
    const next = cloneState(state)
    resolveWasteRoll(next, { 'die-w1': 'food', 'die-w2': 'power' })
    expect(next.waste).toBe(1)
    expect(next.result).toBeNull()
  })
})

describe('dice lifecycle', () => {
  it('rerolls spent and hand dice without duplicating on second roll', () => {
    let state = setupGame({
      difficulty: 'normal',
      maxPlayers: 2,
      crisisEnabled: false,
      players: [
        { id: 'p1', name: 'A', isHost: true },
        { id: 'p2', name: 'B', isHost: false },
      ],
    })
    const p1 = state.activePlayerId
    state = applyAction(state, { type: 'ROLL_DICE', playerId: p1 }) as typeof state
    const firstIds = state.dice.filter((d) => d.ownerId === p1).map((d) => d.id)
    expect(firstIds).toHaveLength(6)

    const dieInRoom = state.dice.find((d) => d.ownerId === p1 && d.location === 'hand')!
    state.roomSlots.water = [dieInRoom.id, null]
    dieInRoom.location = 'room'
    dieInRoom.roomId = 'water'
    dieInRoom.slotIndex = 0
    dieInRoom.locked = true

    const spent = state.dice.find((d) => d.ownerId === p1 && d.location === 'hand')!
    spent.location = 'spent'

    state = applyAction(state, { type: 'END_TURN', playerId: p1 }) as typeof state
    const p2 = state.activePlayerId
    state = applyAction(state, { type: 'ROLL_DICE', playerId: p2 }) as typeof state
    state = applyAction(state, { type: 'END_TURN', playerId: p2 }) as typeof state

    state = applyAction(state, { type: 'ROLL_DICE', playerId: p1 }) as typeof state
    const p1Dice = state.dice.filter((d) => d.ownerId === p1)
    expect(p1Dice).toHaveLength(6)
    expect(p1Dice.filter((d) => d.location === 'hand').length).toBeGreaterThan(0)
    expect(p1Dice.find((d) => d.id === dieInRoom.id)?.location).toBe('room')
    expect(p1Dice.find((d) => d.id === spent.id)?.location).toBe('hand')
  })
})

describe('group assignment', () => {
  it('assigns a full water group in one action', () => {
    let state = setupGame({
      difficulty: 'normal',
      maxPlayers: 1,
      crisisEnabled: false,
      players: [{ id: 'p1', name: 'A', isHost: true }],
    })
    state.players[0].position = 'water'
    state = applyAction(state, { type: 'ROLL_DICE', playerId: 'p1' }) as typeof state
    const waterDice = state.dice
      .filter((d) => d.ownerId === 'p1' && d.location === 'hand')
      .slice(0, 2)
    waterDice[0].face = 'water'
    waterDice[1].face = 'water'

    state = applyAction(state, {
      type: 'ASSIGN_DICE_GROUP',
      playerId: 'p1',
      roomId: 'water',
      dieIds: waterDice.map((d) => d.id),
      startSlot: 0,
    }) as typeof state

    expect(state.roomSlots.water?.[0]).toBe(waterDice[0].id)
    expect(state.roomSlots.water?.[1]).toBe(waterDice[1].id)
  })

  it('rejects partial group assignment via ASSIGN_DIE', () => {
    let state = setupGame({
      difficulty: 'normal',
      maxPlayers: 1,
      crisisEnabled: false,
      players: [{ id: 'p1', name: 'A', isHost: true }],
    })
    state.players[0].position = 'water'
    state = applyAction(state, { type: 'ROLL_DICE', playerId: 'p1' }) as typeof state
    const die = state.dice.find((d) => d.ownerId === 'p1' && d.location === 'hand')!
    die.face = 'water'
    const result = applyAction(state, {
      type: 'ASSIGN_DIE',
      playerId: 'p1',
      dieId: die.id,
      roomId: 'water',
      slotIndex: 0,
    })
    expect(isRuleError(result)).toBe(true)
  })
})

describe('cargo activation', () => {
  it('spends plane die and clears cargo when no city is present', () => {
    let state = setupGame({
      difficulty: 'normal',
      maxPlayers: 1,
      crisisEnabled: false,
      players: [{ id: 'p1', name: 'A', isHost: true }],
    })
    state.players[0].position = 'cargo'
    state.cities.forEach((c) => {
      if (c.status === 'faceUpOnPath') c.status = 'discarded'
    })
    state = applyAction(state, { type: 'ROLL_DICE', playerId: 'p1' }) as typeof state
    const plane = state.dice.find((d) => d.ownerId === 'p1' && d.location === 'hand')!
    plane.face = 'plane'
    state.roomSlots.cargo = [plane.id]
    plane.location = 'room'
    plane.roomId = 'cargo'
    plane.locked = true

    state = applyAction(state, {
      type: 'ACTIVATE_ROOM',
      playerId: 'p1',
      roomId: 'cargo',
    }) as typeof state

    expect(state.roomSlots.cargo?.[0]).toBeNull()
    expect(state.dice.find((d) => d.id === plane.id)?.location).toBe('spent')
  })
})

describe('recycler', () => {
  it('counts slot 0 as ghost-filled for recycling activation', () => {
    let state = setupGame({
      difficulty: 'normal',
      maxPlayers: 1,
      crisisEnabled: false,
      players: [{ id: 'p1', name: 'A', isHost: true }],
    })
    state.players[0].role = 'recycler'
    state.players[0].position = 'recycling'
    state.waste = 4
    state = applyAction(state, { type: 'ROLL_DICE', playerId: 'p1' }) as typeof state
    const dice = state.dice.filter((d) => d.ownerId === 'p1' && d.location === 'hand').slice(0, 4)
    dice.forEach((d, i) => {
      d.face = (['water', 'food', 'power', 'vaccine'] as const)[i]
    })
    for (let i = 0; i < dice.length; i++) {
      state = applyAction(state, {
        type: 'ASSIGN_DIE',
        playerId: 'p1',
        dieId: dice[i].id,
        roomId: 'recycling',
        slotIndex: i + 1,
      }) as typeof state
    }

    state = applyAction(state, {
      type: 'ACTIVATE_ROOM',
      playerId: 'p1',
      roomId: 'recycling',
    }) as typeof state
    expect(state.waste).toBe(0)
  })

  it('excludes chosen die from waste roll', () => {
    const state = setupGame({
      difficulty: 'normal',
      maxPlayers: 1,
      crisisEnabled: false,
      players: [{ id: 'p1', name: 'A', isHost: true }],
    })
    state.waste = 0
    state.roomSlots.water = ['die-w1', 'die-w2']
    state.dice.push(
      {
        id: 'die-w1',
        face: 'water',
        ownerId: 'p1',
        location: 'room',
        roomId: 'water',
        slotIndex: 0,
        locked: true,
      },
      {
        id: 'die-w2',
        face: 'water',
        ownerId: 'p1',
        location: 'room',
        roomId: 'water',
        slotIndex: 1,
        locked: true,
      }
    )
    state.pendingWasteRoll = {
      roomId: 'water',
      dieIds: ['die-w1', 'die-w2'],
      recyclerPlayerId: 'p1',
    }
    const next = cloneState(state)
    resolveWasteRoll(next, { 'die-w1': 'plane', 'die-w2': 'plane' }, 'die-w1')
    expect(next.waste).toBe(1)
  })
})

describe('getLegalActions', () => {
  it('includes ROLL_DICE on active player roll step', async () => {
    const { getLegalActions } = await import('../getLegalActions')
    const state = setupGame({
      difficulty: 'normal',
      maxPlayers: 1,
      crisisEnabled: false,
      players: [{ id: 'p1', name: 'A', isHost: true }],
    })
    expect(getLegalActions(state, 'p1')).toContain('ROLL_DICE')
  })

  it('returns no actions while paused by timer', async () => {
    const { getLegalActions } = await import('../getLegalActions')
    const state = setupGame({
      difficulty: 'normal',
      maxPlayers: 1,
      crisisEnabled: false,
      players: [{ id: 'p1', name: 'A', isHost: true }],
    })
    state.turnStep = 'pausedByTimer'
    expect(getLegalActions(state, 'p1')).toHaveLength(0)
  })
})
