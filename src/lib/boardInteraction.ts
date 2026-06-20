import type { GameSnapshot } from '../types/engine'

export function getDieById(snapshot: GameSnapshot, dieId: string) {
  return snapshot.dice.find((d) => d.id === dieId)
}
