import type { SupplyType } from '../../types/board'
import type { Difficulty } from '../../types/game'

export const TIMER_SECONDS = 120
export const DICE_PER_PLAYER = 6
export const BASE_REROLLS = 2
/** Loss triggers when waste reaches this value (skull / position 10+). */
export const WASTE_MAX = 10
export const MAX_PLAYERS = 4
export const MIN_PLAYERS = 2
export const AFK_KICK_THRESHOLD = 3

export const SUPPLY_TYPES: SupplyType[] = [
  'vaccine',
  'food',
  'power',
  'water',
  'firstAid',
]

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { citiesVisible: number; cityDeckSize: number; label: string }
> = {
  easy: { citiesVisible: 2, cityDeckSize: 3, label: 'Easy' },
  normal: { citiesVisible: 2, cityDeckSize: 5, label: 'Normal' },
  veteran: { citiesVisible: 3, cityDeckSize: 7, label: 'Veteran' },
  heroic: { citiesVisible: 4, cityDeckSize: 9, label: 'Heroic' },
}

export function shuffle<T>(arr: readonly T[], rng: () => number = Math.random): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}
