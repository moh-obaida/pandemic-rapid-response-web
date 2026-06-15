import type { RoomId } from './board'

export interface DieProps {
  value: string
  color: string
  selected?: boolean
  rolling?: boolean
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export interface RoomSelectorState {
  selectedDieId: string | null
  hoveredRoom: RoomId | null
}

export interface ModalState {
  roomActivation: boolean
  crisis: boolean
  gameEnd: boolean
}

export type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
