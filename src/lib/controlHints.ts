import type { DieFace } from './constants/dice'
import { ROLES } from './constants'
import type { GameSnapshot } from '../types/engine'
import type { RoleId } from '../types/board'
import {
  getValidMoveRooms,
  getValidFlyDirections,
  getValidAssignSlots,
  canRoomActivate,
  isDeliveryReady,
} from './boardTargets'
import { getDieById } from './boardInteraction'

const FACE_LABEL: Record<DieFace, string> = {
  plane: 'Plane',
  water: 'Water',
  food: 'Food',
  power: 'Power',
  vaccine: 'Vaccine',
  firstAid: 'First Aid',
}

export function getContextualHints(
  snapshot: GameSnapshot,
  playerId: string,
  selectedDieIds: string[],
  roleId: RoleId
): string[] {
  const hints: string[] = []
  const role = ROLES.find((r) => r.id === roleId)

  if (selectedDieIds.length === 0) {
    hints.push('Select dice from your hand, then click glowing board targets.')
    const player = snapshot.players.find((p) => p.id === playerId)
    if (player && canRoomActivate(snapshot, playerId, player.position)) {
      hints.push(`Activate ${player.position} — click the glowing room.`)
    }
    return hints
  }

  const faces = selectedDieIds
    .map((id) => getDieById(snapshot, id)?.face)
    .filter(Boolean) as DieFace[]

  const faceSummary =
    faces.length === 1
      ? FACE_LABEL[faces[0]]
      : `${faces.length} dice selected`

  hints.push(`Selected: ${faceSummary}`)

  const moveRooms = getValidMoveRooms(snapshot, playerId, selectedDieIds)
  if (moveRooms.length > 0) {
    hints.push('Click a glowing room to move.')
  }

  const assignSlots = getValidAssignSlots(snapshot, playerId, selectedDieIds)
  if (assignSlots.length > 0) {
    hints.push('Click a glowing die slot to assign.')
  }

  const flyDirs = getValidFlyDirections(snapshot, playerId, selectedDieIds)
  if (flyDirs.length > 0) {
    hints.push('Click ← or → arrows on the flightpath to fly.')
  }

  if (faces.includes('plane') && roleId === 'engineer') {
    hints.push('Engineer: pick a flip target beside the plane die.')
  }

  if (role?.id === 'technician') {
    hints.push('Technician: move up to 2 rooms per die.')
  }
  if (role?.id === 'flightPlanner' && faces.includes('plane')) {
    hints.push('Flight Planner: fly up to 2 cities per plane die.')
  }

  if (isDeliveryReady(snapshot, playerId)) {
    hints.push('Delivery ready — activate Cargo Bay.')
  }

  hints.push('Reroll uses selected dice only.')

  return hints
}
