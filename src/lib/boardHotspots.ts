import type { RoomId } from '../types/board'

/** Percent-based hit targets on plane-board.png (585×1024 reference art). */
export interface BoardHotspot {
  roomId: RoomId
  label: string
  left: number
  top: number
  width: number
  height: number
}

export const BOARD_HOTSPOTS: BoardHotspot[] = [
  { roomId: 'hq', label: 'HQ', left: 38, top: 6, width: 24, height: 10 },
  { roomId: 'firstAid', label: 'First Aid', left: 8, top: 18, width: 28, height: 14 },
  { roomId: 'water', label: 'Water', left: 64, top: 18, width: 28, height: 14 },
  { roomId: 'vaccine', label: 'Vaccine', left: 30, top: 32, width: 40, height: 12 },
  { roomId: 'food', label: 'Food', left: 8, top: 46, width: 28, height: 14 },
  { roomId: 'power', label: 'Power', left: 64, top: 46, width: 28, height: 14 },
  { roomId: 'recycling', label: 'Recycling', left: 6, top: 62, width: 30, height: 16 },
  { roomId: 'cargo', label: 'Cargo', left: 28, top: 78, width: 44, height: 14 },
]

/** City tab positions around board perimeter (cityIndex 0–23 clockwise). */
export const FLIGHTPATH_TAB_POSITIONS: Record<number, { left: number; top: number }> = {
  0: { left: 50, top: 0 },
  1: { left: 62, top: 1 },
  2: { left: 74, top: 3 },
  3: { left: 86, top: 6 },
  4: { left: 94, top: 12 },
  5: { left: 98, top: 22 },
  6: { left: 98, top: 34 },
  7: { left: 94, top: 44 },
  8: { left: 88, top: 54 },
  9: { left: 80, top: 62 },
  10: { left: 70, top: 68 },
  11: { left: 58, top: 72 },
  12: { left: 42, top: 72 },
  13: { left: 30, top: 68 },
  14: { left: 20, top: 62 },
  15: { left: 12, top: 54 },
  16: { left: 6, top: 44 },
  17: { left: 2, top: 34 },
  18: { left: 2, top: 22 },
  19: { left: 6, top: 12 },
  20: { left: 14, top: 6 },
  21: { left: 26, top: 3 },
  22: { left: 38, top: 1 },
  23: { left: 50, top: 2.5 },
}
