import type { RoomId } from '../types/board'

/** Percent positions for die slots on plane-board.png (585×1024). */
export type DieSlotPosition = { left: number; top: number }

/** Approximate slot grids per room — overlay ids map to engine slotIndex. */
export const DIE_SLOT_POSITIONS: Partial<
  Record<RoomId, Record<number, DieSlotPosition>>
> = {
  hq: {
    0: { left: 36, top: 9 },
    1: { left: 40, top: 9 },
    2: { left: 44, top: 9 },
    3: { left: 48, top: 9 },
    4: { left: 52, top: 9 },
    5: { left: 56, top: 9 },
  },
  firstAid: {
    0: { left: 12, top: 22 },
    1: { left: 16, top: 22 },
    2: { left: 20, top: 22 },
    3: { left: 24, top: 22 },
    4: { left: 28, top: 22 },
  },
  water: {
    0: { left: 68, top: 22 },
    1: { left: 72, top: 22 },
    2: { left: 76, top: 22 },
    3: { left: 80, top: 22 },
    4: { left: 84, top: 22 },
  },
  vaccine: {
    0: { left: 34, top: 35 },
    1: { left: 38, top: 35 },
    2: { left: 42, top: 35 },
    3: { left: 46, top: 35 },
    4: { left: 50, top: 35 },
  },
  food: {
    0: { left: 12, top: 50 },
    1: { left: 16, top: 50 },
    2: { left: 20, top: 50 },
    3: { left: 24, top: 50 },
    4: { left: 28, top: 50 },
  },
  power: {
    0: { left: 68, top: 50 },
    1: { left: 72, top: 50 },
    2: { left: 76, top: 50 },
    3: { left: 80, top: 50 },
    4: { left: 84, top: 50 },
  },
  recycling: {
    0: { left: 10, top: 66 },
    1: { left: 14, top: 66 },
    2: { left: 18, top: 66 },
    3: { left: 22, top: 66 },
    4: { left: 26, top: 66 },
  },
  cargo: {
    0: { left: 48, top: 82 },
  },
}
