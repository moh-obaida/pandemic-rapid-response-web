import type { SupplyType } from '../../types/board'
import { shuffle } from './game'

export type CrisisType = 'temporary' | 'immediate' | 'deliveryBlocker'

export type CrisisDefinitionId =
  | 'distraction'
  | 'turbulence'
  | 'extreme-winds'
  | 'equipment-failure'
  | 'safety-drill'
  | 'evacuation'
  | 'supply-spill'
  | 'urgent-vaccine-delivery'
  | 'urgent-food-delivery'
  | 'urgent-power-delivery'
  | 'urgent-water-delivery'
  | 'urgent-first-aid-delivery'

export interface CrisisDefinition {
  id: CrisisDefinitionId
  type: CrisisType
  name: string
  description: string
  count: number
  /** Required crate type for delivery blocker cards. */
  supplyType?: SupplyType
}

export interface CrisisCardInstance {
  instanceId: string
  definitionId: CrisisDefinitionId
  type: CrisisType
  name: string
  description: string
  supplyType?: SupplyType
}

/** 15 physical cards, 12 unique effects (Part 1.6). */
export const CRISIS_DEFINITIONS: readonly CrisisDefinition[] = [
  {
    id: 'distraction',
    type: 'temporary',
    name: 'Distraction',
    description:
      'Each player places 1 unassigned die on this card. These dice cannot be used. When this card is discarded, place these dice on their owners\' role cards.',
    count: 1,
  },
  {
    id: 'turbulence',
    type: 'temporary',
    name: 'Turbulence',
    description: 'Players must spend 1 additional die to move.',
    count: 1,
  },
  {
    id: 'extreme-winds',
    type: 'temporary',
    name: 'Extreme Winds',
    description: 'Players must spend 1 additional plane result to fly.',
    count: 1,
  },
  {
    id: 'equipment-failure',
    type: 'immediate',
    name: 'Equipment Failure',
    description:
      'Take all dice from the board and place them on their owners\' role cards.',
    count: 1,
  },
  {
    id: 'safety-drill',
    type: 'immediate',
    name: 'Safety Drill',
    description: 'Move each pawn to its starting room.',
    count: 2,
  },
  {
    id: 'evacuation',
    type: 'immediate',
    name: 'Evacuation',
    description:
      'Move the plane 6 cities in the direction away from the closest city card.',
    count: 2,
  },
  {
    id: 'supply-spill',
    type: 'immediate',
    name: 'Supply Spill',
    description: 'Return any 1 crate from the cargo bay to its room.',
    count: 2,
  },
  {
    id: 'urgent-vaccine-delivery',
    type: 'deliveryBlocker',
    name: 'Urgent Vaccine Delivery',
    description:
      'Place this card on top of the closest city card. While this card is in play, you cannot discard the card below it.',
    count: 1,
    supplyType: 'vaccine',
  },
  {
    id: 'urgent-food-delivery',
    type: 'deliveryBlocker',
    name: 'Urgent Food Delivery',
    description:
      'Place this card on top of the closest city card. While this card is in play, you cannot discard the card below it.',
    count: 1,
    supplyType: 'food',
  },
  {
    id: 'urgent-power-delivery',
    type: 'deliveryBlocker',
    name: 'Urgent Power Delivery',
    description:
      'Place this card on top of the closest city card. While this card is in play, you cannot discard the card below it.',
    count: 1,
    supplyType: 'power',
  },
  {
    id: 'urgent-water-delivery',
    type: 'deliveryBlocker',
    name: 'Urgent Water Delivery',
    description:
      'Place this card on top of the closest city card. While this card is in play, you cannot discard the card below it.',
    count: 1,
    supplyType: 'water',
  },
  {
    id: 'urgent-first-aid-delivery',
    type: 'deliveryBlocker',
    name: 'Urgent First Aid Delivery',
    description:
      'Place this card on top of the closest city card. While this card is in play, you cannot discard the card below it.',
    count: 1,
    supplyType: 'firstAid',
  },
] as const

export const CRISIS_DECK_SIZE = CRISIS_DEFINITIONS.reduce(
  (sum, def) => sum + def.count,
  0
)

/** Expand definitions by count; optionally shuffle for game setup. */
export function buildCrisisDeck(shuffled = false): CrisisCardInstance[] {
  const deck: CrisisCardInstance[] = []
  const instanceCounts = new Map<CrisisDefinitionId, number>()

  for (const def of CRISIS_DEFINITIONS) {
    for (let i = 0; i < def.count; i++) {
      const ordinal = (instanceCounts.get(def.id) ?? 0) + 1
      instanceCounts.set(def.id, ordinal)
      const instanceId = def.count > 1 ? `${def.id}-${ordinal}` : def.id

      deck.push({
        instanceId,
        definitionId: def.id,
        type: def.type,
        name: def.name,
        description: def.description,
        supplyType: def.supplyType,
      })
    }
  }

  return shuffled ? shuffle(deck) : deck
}
