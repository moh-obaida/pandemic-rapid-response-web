import type { Role, Room, City, CrisisCard, SupplyType } from '../types/board'
import type { Difficulty } from '../types/game'
import { theme } from '../styles/theme'

export const TIMER_SECONDS = 120
export const DICE_PER_PLAYER = 6
export const BASE_REROLLS = 2
export const TIME_TOKENS_START = 9
export const WASTE_MAX = 12
export const MAX_PLAYERS = 4
export const MIN_PLAYERS = 2
export const AFK_KICK_THRESHOLD = 3

export const SUPPLY_TYPES: SupplyType[] = [
  'vaccine',
  'food',
  'power',
  'water',
  'firstAid',
]

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

export const ROLES: Role[] = [
  {
    id: 'analyst',
    name: 'Analyst',
    description: 'Data-driven strategist',
    ability: '+1 reroll power (3 total rerolls)',
    rerollBonus: 1,
  },
  {
    id: 'technician',
    name: 'Technician',
    description: 'Precision operator',
    ability: '+1 die movement (move result +1)',
    rerollBonus: 0,
  },
  {
    id: 'engineer',
    name: 'Engineer',
    description: 'Systems modifier',
    ability: 'Can modify dice results (reroll shows lower value)',
    rerollBonus: 0,
  },
  {
    id: 'flightPlanner',
    name: 'Flight Planner',
    description: 'Route optimizer',
    ability: '+1 fly operation (deliver to 2 cities per token)',
    rerollBonus: 0,
  },
  {
    id: 'director',
    name: 'Director',
    description: 'Command authority',
    ability: 'HQ die acts as wildcard for any color',
    rerollBonus: 0,
  },
  {
    id: 'recycler',
    name: 'Recycler',
    description: 'Waste reducer',
    ability: '-1 waste die (one unmatched die ignored)',
    rerollBonus: 0,
  },
  {
    id: 'supplySpecialist',
    name: 'Supply Specialist',
    description: 'Logistics expert',
    ability: 'Out-of-order supply assignment',
    rerollBonus: 0,
  },
]

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

const CITY_NAMES = [
  'Atlanta', 'Boston', 'Chicago', 'Dallas', 'Denver', 'Detroit',
  'Houston', 'Las Vegas', 'Los Angeles', 'Miami', 'Minneapolis', 'Nashville',
  'New Orleans', 'New York', 'Orlando', 'Philadelphia', 'Phoenix', 'Portland',
  'San Diego', 'San Francisco', 'Seattle', 'St. Louis', 'Tampa', 'Washington',
]

const REGIONS: Array<'blue' | 'yellow' | 'red'> = ['blue', 'yellow', 'red']
const REGION_SUPPLIES: Record<'blue' | 'yellow' | 'red', SupplyType[]> = {
  blue: ['vaccine', 'water', 'firstAid'],
  yellow: ['food', 'power', 'water'],
  red: ['power', 'firstAid', 'food'],
}

export function createCities(): City[] {
  return CITY_NAMES.map((name, i) => {
    const region = REGIONS[i % 3]
    const supplies = REGION_SUPPLIES[region]
    return {
      id: i,
      name,
      region,
      supplyNeeded: supplies[i % supplies.length],
      delivered: false,
      distance: Math.floor(i / 3) + 1,
    }
  })
}

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

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { citiesVisible: number; cityDeckSize: number; label: string }
> = {
  easy: { citiesVisible: 2, cityDeckSize: 3, label: 'Easy' },
  normal: { citiesVisible: 2, cityDeckSize: 5, label: 'Normal' },
  veteran: { citiesVisible: 3, cityDeckSize: 7, label: 'Veteran' },
  heroic: { citiesVisible: 4, cityDeckSize: 9, label: 'Heroic' },
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}
