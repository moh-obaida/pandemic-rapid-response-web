import type { RoomId } from './board'
import type { DieFace } from '../lib/constants/dice'

export type PendingConfirm =
  | { type: 'move'; dieIds: string[]; targetRoom: RoomId; label: string }
  | { type: 'fly'; dieIds: string[]; direction: 'left' | 'right'; label: string }
  | {
      type: 'assign'
      dieIds: string[]
      roomId: RoomId
      slotIndex: number
      label: string
    }
  | { type: 'activate'; roomId: RoomId; label: string }
  | { type: 'engineerFlip'; dieId: string; targetFace: DieFace; label: string }
