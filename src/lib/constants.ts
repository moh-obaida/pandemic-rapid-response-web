/**
 * Backward-compatible barrel. Authoritative data lives in `./constants/`.
 */
export * from './constants/index'

import type { Room, SupplyType } from '../types/board'
import { theme } from '../styles/theme'
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
