/**
 * DEV-ONLY snapshot seed builders for Playwright QA.
 * Imported only from qaBridge.dev.ts — never from production paths.
 */
import { setupGame, rollDiceForPlayer } from './engine/setup'
import { WASTE_MAX, TIMER_SECONDS } from './constants/game'
import { CARGO_MAX } from './constants/tokens'
import { CRISIS_DEFINITIONS } from './constants/crises'
import { CITIES } from './constants/cities'
import type { CrisisCardInstance, CrisisDefinitionId } from './constants/crises'
import type { GameSnapshot } from '../types/engine'
import type { PendingConfirm } from '../types/controls'
import type { RoomId } from '../types/board'
import type { DieFace } from './constants/dice'

export const QA_P1 = 'qa-p1'
export const QA_P2 = 'qa-p2'

export const QA_SEED_NAMES = [
  'initialGame',
  'rolledDice',
  'selectedDice',
  'pendingMove',
  'pendingAssign',
  'pendingFly',
  'pendingActivate',
  'nonActivePlayerWaiting',
  'cargoEmpty',
  'cargoPartial',
  'cargoFull',
  'deliveryReady',
  'missingCrates',
  'assignedDiceOnBoard',
  'spentDiceOnRole',
  'pawnsInMultipleRooms',
  'multiplePawnsSameRoom',
  'wasteMidTrack',
  'wasteDanger',
  'hqLow',
  'cityDeckLow',
  'cityDeckEmpty',
  'timerNormal',
  'timerWarning',
  'timerDanger',
  'timerExpired',
  'postTimerResume',
  'win',
  'loseWaste',
  'loseHQ',
  'cityCardPreview',
  'roleCardPreview',
  'crisisDisabledNormal',
  'crisisModal',
  'temporaryCrisisActive',
  'deliveryBlockerOnCity',
  'distractionDiceHeld',
  'supplySpillChoice',
] as const

export type QaSeedName = (typeof QA_SEED_NAMES)[number]

export interface QaSeedPayload {
  snapshot: GameSnapshot
  playerId: string
  selectedDieIds?: string[]
  pendingConfirm?: PendingConfirm | null
  modals?: { roomActivation?: boolean; crisis?: boolean; gameEnd?: boolean }
  status?: 'playing' | 'ended'
  qaDevPreview?: { cityId?: number; rolePlayerId?: string } | null
}

export type QaSeedResult =
  | { ok: true; payload: QaSeedPayload }
  | { ok: false; reason: string; notImplemented?: boolean }

function makeCrisisInstance(id: CrisisDefinitionId): CrisisCardInstance {
  const def = CRISIS_DEFINITIONS.find((d) => d.id === id)!
  return {
    instanceId: `qa-${id}`,
    definitionId: id,
    type: def.type,
    name: def.name,
    description: def.description,
    supplyType: def.supplyType,
  }
}

function baseSnapshot(crisisEnabled = false): GameSnapshot {
  return setupGame({
    difficulty: 'normal',
    maxPlayers: 4,
    crisisEnabled,
    players: [
      { id: QA_P1, name: 'QA Captain', isHost: true },
      { id: QA_P2, name: 'QA Mate', isHost: false },
    ],
  })
}

function rollForActive(snapshot: GameSnapshot): void {
  snapshot.turnStep = 'useDice'
  rollDiceForPlayer(snapshot, snapshot.activePlayerId)
}

function firstHandDie(snapshot: GameSnapshot, playerId = snapshot.activePlayerId): string | null {
  return snapshot.dice.find((d) => d.ownerId === playerId && d.location === 'hand')?.id ?? null
}

function addDie(
  snapshot: GameSnapshot,
  ownerId: string,
  face: DieFace,
  location: GameSnapshot['dice'][0]['location'] = 'hand',
  extra?: Partial<GameSnapshot['dice'][0]>,
): string {
  const id = `qa-die-${snapshot.dice.length + 1}`
  snapshot.dice.push({
    id,
    face,
    ownerId,
    location,
    locked: false,
    ...extra,
  })
  return id
}

function moveCratesToCargo(snapshot: GameSnapshot, count: number): void {
  let moved = 0
  for (const crate of snapshot.crates) {
    if (moved >= count) break
    if (crate.location !== 'cargo') {
      crate.location = 'cargo'
      moved++
    }
  }
}

function playingPayload(
  snapshot: GameSnapshot,
  extras: Partial<Omit<QaSeedPayload, 'snapshot'>> = {},
): QaSeedPayload {
  return {
    snapshot,
    playerId: extras.playerId ?? QA_P1,
    selectedDieIds: extras.selectedDieIds ?? [],
    pendingConfirm: extras.pendingConfirm ?? null,
    modals: extras.modals,
    status: extras.status ?? 'playing',
    qaDevPreview: extras.qaDevPreview ?? null,
  }
}

export function buildQaSeed(name: QaSeedName): QaSeedResult {
  try {
    switch (name) {
      case 'initialGame': {
        const snapshot = baseSnapshot()
        return { ok: true, payload: playingPayload(snapshot) }
      }

      case 'rolledDice': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        return { ok: true, payload: playingPayload(snapshot) }
      }

      case 'selectedDice': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        const dieId = firstHandDie(snapshot)
        return {
          ok: true,
          payload: playingPayload(snapshot, {
            selectedDieIds: dieId ? [dieId] : [],
          }),
        }
      }

      case 'pendingMove': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        const dieId = firstHandDie(snapshot) ?? addDie(snapshot, QA_P1, 'firstAid')
        return {
          ok: true,
          payload: playingPayload(snapshot, {
            selectedDieIds: [dieId],
            pendingConfirm: {
              type: 'move',
              dieIds: [dieId],
              targetRoom: 'food',
              label: 'Move to Food?',
            },
          }),
        }
      }

      case 'pendingAssign': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        const dieId = firstHandDie(snapshot) ?? addDie(snapshot, QA_P1, 'food')
        return {
          ok: true,
          payload: playingPayload(snapshot, {
            selectedDieIds: [dieId],
            pendingConfirm: {
              type: 'assign',
              dieIds: [dieId],
              roomId: 'food',
              slotIndex: 0,
              label: 'Assign 1 die(s) to Food?',
            },
          }),
        }
      }

      case 'pendingFly': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        const dieId = addDie(snapshot, QA_P1, 'plane')
        return {
          ok: true,
          payload: playingPayload(snapshot, {
            selectedDieIds: [dieId],
            pendingConfirm: {
              type: 'fly',
              dieIds: [dieId],
              direction: 'right',
              label: 'Fly right?',
            },
          }),
        }
      }

      case 'pendingActivate': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        snapshot.players.find((p) => p.id === QA_P1)!.position = 'food'
        return {
          ok: true,
          payload: playingPayload(snapshot, {
            pendingConfirm: {
              type: 'activate',
              roomId: 'food',
              label: 'Activate Food?',
            },
          }),
        }
      }

      case 'nonActivePlayerWaiting': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        return {
          ok: true,
          payload: playingPayload(snapshot, { playerId: QA_P2 }),
        }
      }

      case 'cargoEmpty': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        snapshot.crates.forEach((c) => {
          if (c.location === 'cargo') {
            c.location = 'food'
          }
        })
        return { ok: true, payload: playingPayload(snapshot) }
      }

      case 'cargoPartial': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        moveCratesToCargo(snapshot, Math.floor(CARGO_MAX / 3))
        return { ok: true, payload: playingPayload(snapshot) }
      }

      case 'cargoFull': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        moveCratesToCargo(snapshot, CARGO_MAX)
        return { ok: true, payload: playingPayload(snapshot) }
      }

      case 'deliveryReady': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        const city = snapshot.cities.find((c) => c.status === 'faceUpOnPath')
        if (!city) return { ok: false, reason: 'No face-up city on path' }
        snapshot.planePosition = city.cityIndex
        const req = CITIES[city.cityIndex]?.crates ?? {}
        for (const [type, n] of Object.entries(req)) {
          let placed = 0
          for (const crate of snapshot.crates) {
            if (placed >= (n ?? 0)) break
            if (crate.type === type && crate.location !== 'cargo') {
              crate.location = 'cargo'
              placed++
            }
          }
        }
        return { ok: true, payload: playingPayload(snapshot) }
      }

      case 'missingCrates': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        const city = snapshot.cities.find((c) => c.status === 'faceUpOnPath')
        if (!city) return { ok: false, reason: 'No face-up city on path' }
        snapshot.planePosition = city.cityIndex
        snapshot.crates.forEach((c) => {
          if (c.location === 'cargo') c.location = 'food'
        })
        return { ok: true, payload: playingPayload(snapshot) }
      }

      case 'assignedDiceOnBoard': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        const dieId = addDie(snapshot, QA_P1, 'food', 'room', { roomId: 'food', slotIndex: 0 })
        if (snapshot.roomSlots.food) snapshot.roomSlots.food[0] = dieId
        return { ok: true, payload: playingPayload(snapshot) }
      }

      case 'spentDiceOnRole': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        addDie(snapshot, QA_P1, 'firstAid', 'spent')
        return { ok: true, payload: playingPayload(snapshot) }
      }

      case 'pawnsInMultipleRooms': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        const rooms: RoomId[] = ['hq', 'food', 'water', 'cargo']
        snapshot.players.forEach((p, i) => {
          p.position = rooms[i % rooms.length]!
        })
        return { ok: true, payload: playingPayload(snapshot) }
      }

      case 'multiplePawnsSameRoom': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        snapshot.players.forEach((p) => {
          p.position = 'hq'
        })
        return { ok: true, payload: playingPayload(snapshot) }
      }

      case 'wasteMidTrack': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        snapshot.waste = Math.floor(WASTE_MAX / 2)
        return { ok: true, payload: playingPayload(snapshot) }
      }

      case 'wasteDanger': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        snapshot.waste = WASTE_MAX - 1
        return { ok: true, payload: playingPayload(snapshot) }
      }

      case 'hqLow': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        snapshot.hqTokens = 1
        return { ok: true, payload: playingPayload(snapshot) }
      }

      case 'cityDeckLow': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        snapshot.cityDeck = snapshot.cityDeck.slice(0, 2)
        return { ok: true, payload: playingPayload(snapshot) }
      }

      case 'cityDeckEmpty': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        snapshot.cityDeck = []
        return { ok: true, payload: playingPayload(snapshot) }
      }

      case 'timerNormal': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        snapshot.timer = 90
        snapshot.timerRunning = true
        return { ok: true, payload: playingPayload(snapshot) }
      }

      case 'timerWarning': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        snapshot.timer = 25
        snapshot.timerRunning = true
        return { ok: true, payload: playingPayload(snapshot) }
      }

      case 'timerDanger': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        snapshot.timer = 8
        snapshot.timerRunning = true
        return { ok: true, payload: playingPayload(snapshot) }
      }

      case 'timerExpired': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        snapshot.timer = 0
        snapshot.timerRunning = false
        snapshot.timerResumeStep = 'useDice'
        snapshot.turnStep = 'pausedByTimer'
        return { ok: true, payload: playingPayload(snapshot) }
      }

      case 'postTimerResume': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        snapshot.timer = TIMER_SECONDS
        snapshot.timerRunning = true
        snapshot.turnStep = 'useDice'
        snapshot.timerResumeStep = undefined
        return { ok: true, payload: playingPayload(snapshot) }
      }

      case 'win': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        snapshot.result = 'win'
        return {
          ok: true,
          payload: playingPayload(snapshot, {
            status: 'ended',
            modals: { gameEnd: true },
          }),
        }
      }

      case 'loseWaste': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        snapshot.waste = WASTE_MAX
        snapshot.result = 'lose'
        return {
          ok: true,
          payload: playingPayload(snapshot, {
            status: 'ended',
            modals: { gameEnd: true },
          }),
        }
      }

      case 'loseHQ': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        snapshot.hqTokens = 0
        snapshot.result = 'lose'
        return {
          ok: true,
          payload: playingPayload(snapshot, {
            status: 'ended',
            modals: { gameEnd: true },
          }),
        }
      }

      case 'cityCardPreview': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        const city = snapshot.cities.find((c) => c.status === 'faceUpOnPath')
        if (!city) return { ok: false, reason: 'No face-up city for preview' }
        return {
          ok: true,
          payload: playingPayload(snapshot, {
            qaDevPreview: { cityId: city.cityIndex },
          }),
        }
      }

      case 'roleCardPreview': {
        const snapshot = baseSnapshot()
        rollForActive(snapshot)
        return {
          ok: true,
          payload: playingPayload(snapshot, {
            qaDevPreview: { rolePlayerId: QA_P1 },
          }),
        }
      }

      case 'crisisDisabledNormal': {
        const snapshot = baseSnapshot(false)
        rollForActive(snapshot)
        return { ok: true, payload: playingPayload(snapshot) }
      }

      case 'crisisModal': {
        const snapshot = baseSnapshot(true)
        rollForActive(snapshot)
        snapshot.crisisDeck = [makeCrisisInstance('distraction')]
        return {
          ok: true,
          payload: playingPayload(snapshot, {
            modals: { crisis: true },
          }),
        }
      }

      case 'temporaryCrisisActive': {
        const snapshot = baseSnapshot(true)
        rollForActive(snapshot)
        const instance = makeCrisisInstance('distraction')
        snapshot.activeTemporaryCrises = [{ instance, distractionDice: [] }]
        return { ok: true, payload: playingPayload(snapshot) }
      }

      case 'deliveryBlockerOnCity': {
        const snapshot = baseSnapshot(true)
        rollForActive(snapshot)
        const city = snapshot.cities.find((c) => c.status === 'faceUpOnPath')
        if (!city) return { ok: false, reason: 'No face-up city for blocker' }
        city.blockers.push(makeCrisisInstance('urgent-food-delivery'))
        snapshot.planePosition = city.cityIndex
        return { ok: true, payload: playingPayload(snapshot) }
      }

      case 'distractionDiceHeld': {
        const snapshot = baseSnapshot(true)
        rollForActive(snapshot)
        const dieId = addDie(snapshot, QA_P1, 'firstAid', 'distraction')
        const instance = makeCrisisInstance('distraction')
        snapshot.activeTemporaryCrises = [{ instance, distractionDice: [dieId] }]
        return { ok: true, payload: playingPayload(snapshot) }
      }

      case 'supplySpillChoice': {
        return {
          ok: false,
          reason: 'Supply spill choice UI requires in-progress crisis resolution flow',
          notImplemented: true,
        }
      }

      default:
        return { ok: false, reason: `Unknown seed: ${name}` }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, reason: msg }
  }
}
