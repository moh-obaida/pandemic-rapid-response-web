/**
 * Backward-compatible barrel. Authoritative data lives in `./constants/`.
 */
export * from './constants/index'

import type { City, CrisisCard, Room, SupplyType } from '../types/board'
import { theme } from '../styles/theme'
import { CITIES } from './constants/cities'
import { HQ_TOKENS_START, SUPPLY_TOKENS_START } from './constants/tokens'

export const SUPPLY_LABELS: Record<SupplyType, string> = {
  vaccine: 'Vaccine',
  food: 'Food',
  power: 'Power',
  water: 'Water',
  firstAid: 'First Aid',
}

export const SUPPLY_COLORS: Record<SupplyType, string> = {
  vaccine: theme.colors.rooms.vaccine,
  food: theme.colors.rooms.food,
  power: theme.colors.rooms.power,
  water: theme.colors.rooms.water,
  firstAid: theme.colors.rooms.firstAid,
}

export const REGION_TO_SUPPLY: Record<string, SupplyType> = {
  blue: 'vaccine',
  yellow: 'food',
  red: 'power',
}

export const ROOMS: Room[] = [
  { id: 'hq', name: 'HQ', color: theme.colors.rooms.hq, supplyType: null, icon: 'building-2' },
  { id: 'vaccine', name: 'Vaccine', color: theme.colors.rooms.vaccine, supplyType: 'vaccine', icon: 'syringe' },
  { id: 'food', name: 'Food', color: theme.colors.rooms.food, supplyType: 'food', icon: 'apple' },
  { id: 'power', name: 'Power', color: theme.colors.rooms.power, supplyType: 'power', icon: 'zap' },
  { id: 'water', name: 'Water', color: theme.colors.rooms.water, supplyType: 'water', icon: 'droplets' },
  { id: 'firstAid', name: 'First Aid', color: theme.colors.rooms.firstAid, supplyType: 'firstAid', icon: 'heart-pulse' },
  { id: 'recycling', name: 'Recycling', color: theme.colors.rooms.recycling, supplyType: null, icon: 'recycle' },
  { id: 'cargo', name: 'Cargo', color: theme.colors.rooms.cargo, supplyType: null, icon: 'package' },
]

/** @deprecated Use HQ_TOKENS_START + SUPPLY_TOKENS_START from `./constants/tokens`. */
export const TIME_TOKENS_START = HQ_TOKENS_START + SUPPLY_TOKENS_START

/**
 * @deprecated Use `CITIES` from `./constants/cities` for authoritative multi-crate requirements.
 */
export function createCities(): City[] {
  return CITIES.map((city) => {
    const supplyTypes = Object.keys(city.crates) as SupplyType[]
    return {
      id: city.cityId,
      name: city.name,
      region: 'blue',
      supplyNeeded: supplyTypes[0],
      delivered: false,
      distance: Math.floor(city.cityId / 3) + 1,
    }
  })
}

/** @deprecated Use `buildCrisisDeck()` from `./constants/crises`. */
export const CRISIS_CARDS: CrisisCard[] = [
  { id: 'c1', name: 'Supply Shortage', description: 'Waste increases by 2', effectType: 'waste', value: 2, immediate: true },
  { id: 'c2', name: 'Equipment Failure', description: 'Waste increases by 1', effectType: 'waste', value: 1, immediate: true },
  { id: 'c3', name: 'Contamination', description: 'Waste increases by 3', effectType: 'waste', value: 3, immediate: true },
  { id: 'c4', name: 'Power Outage', description: 'Lose 1 die this round', effectType: 'dice', value: 1, immediate: true },
  { id: 'c5', name: 'Staff Shortage', description: 'Lose 2 dice this round', effectType: 'dice', value: 2, immediate: true },
  { id: 'c6', name: 'Fuel Crisis', description: 'Lose 1 time token', effectType: 'timeToken', value: 1, immediate: true },
  { id: 'c7', name: 'Runway Closure', description: 'Lose 2 time tokens', effectType: 'timeToken', value: 2, immediate: true },
  { id: 'c8', name: 'Storm Delay', description: 'Waste +1, lose 1 token', effectType: 'waste', value: 1, immediate: true },
  { id: 'c9', name: 'Quarantine', description: 'Waste +2, lose 1 die', effectType: 'waste', value: 2, immediate: true },
  { id: 'c10', name: 'Infrastructure Collapse', description: 'Waste +3', effectType: 'waste', value: 3, immediate: true },
  { id: 'c11', name: 'Budget Cut', description: 'Lose 1 time token', effectType: 'timeToken', value: 1, immediate: true },
  { id: 'c12', name: 'Miscommunication', description: 'Waste +1', effectType: 'waste', value: 1, immediate: true },
  { id: 'c13', name: 'Cargo Spill', description: 'Waste +2', effectType: 'waste', value: 2, immediate: true },
  { id: 'c14', name: 'Emergency Redirect', description: 'Delivery requirement changes', effectType: 'delivery', value: 1, immediate: true },
  { id: 'c15', name: 'System Overload', description: 'Lose 2 time tokens', effectType: 'timeToken', value: 2, immediate: true },
]
