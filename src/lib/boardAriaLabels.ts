import type { DieFace } from './constants/dice'

const FACE_LABELS: Record<DieFace, string> = {
  plane: 'Plane',
  water: 'Water',
  food: 'Food',
  power: 'Power',
  vaccine: 'Vaccine',
  firstAid: 'First Aid',
}

export function buildRoomAriaLabel(
  roomName: string,
  opts: {
    validMove?: boolean
    validAssign?: boolean
    canActivate?: boolean
    deliveryReady?: boolean
    activeTurn?: boolean
    selected?: boolean
  }
): string {
  const parts = [`Select ${roomName} room`]
  if (opts.activeTurn) parts.push('your current location')
  if (opts.validMove) parts.push('valid move target')
  if (opts.validAssign) parts.push('valid dice assignment')
  if (opts.canActivate) parts.push('ready to activate')
  if (opts.deliveryReady) parts.push('delivery ready')
  if (opts.selected) parts.push('selected')
  return parts.join('. ')
}

export function buildDieSlotAriaLabel(
  roomName: string,
  slotIndex: number,
  opts: {
    filled?: boolean
    face?: DieFace
    locked?: boolean
    validTarget?: boolean
  }
): string {
  const slot = slotIndex + 1
  if (opts.filled && opts.face) {
    const faceLabel = FACE_LABELS[opts.face]
    return `${roomName} slot ${slot}, ${faceLabel} die${opts.locked ? ', locked' : ''}`
  }
  if (opts.validTarget) {
    return `Assign selected die to ${roomName} slot ${slot}`
  }
  return `${roomName} die slot ${slot}, empty`
}
