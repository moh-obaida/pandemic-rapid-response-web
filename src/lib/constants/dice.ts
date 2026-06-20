export type DieFace =
  | 'plane'
  | 'water'
  | 'food'
  | 'power'
  | 'vaccine'
  | 'firstAid'

/** Circled faces generate waste during supply-room waste rolls (Part 1.1). */
export const CIRCLED_FACES: readonly DieFace[] = ['plane', 'water', 'food'] as const

export const DICE_FACES: readonly DieFace[] = [
  'plane',
  'water',
  'food',
  'power',
  'vaccine',
  'firstAid',
] as const

export function isCircledFace(face: DieFace): boolean {
  return (CIRCLED_FACES as readonly string[]).includes(face)
}

export function rollDieFace(rng: () => number = Math.random): DieFace {
  return DICE_FACES[Math.floor(rng() * DICE_FACES.length)]
}
