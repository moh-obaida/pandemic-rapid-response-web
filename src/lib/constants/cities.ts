import type { SupplyType } from '../../types/board'

export interface CityRequirement {
  cityId: number
  name: string
  crates: Partial<Record<SupplyType, number>>
}

/** Clockwise flightpath order: London (0) → Madrid (23), wraps to London. */
export const CITIES: readonly CityRequirement[] = [
  {
    cityId: 0,
    name: 'London',
    crates: { food: 1, water: 1, firstAid: 1, vaccine: 1 },
  },
  {
    cityId: 1,
    name: 'Paris',
    crates: { power: 1, food: 1, water: 1, firstAid: 1 },
  },
  {
    cityId: 2,
    name: 'Essen',
    crates: { vaccine: 1, power: 1, food: 1, water: 1 },
  },
  {
    cityId: 3,
    name: 'Moscow',
    crates: { water: 3, power: 1 },
  },
  {
    cityId: 4,
    name: 'Istanbul',
    crates: { vaccine: 3, firstAid: 1 },
  },
  {
    cityId: 5,
    name: 'Cairo',
    crates: { water: 3, vaccine: 1 },
  },
  {
    cityId: 6,
    name: 'Riyadh',
    crates: { firstAid: 3, power: 1 },
  },
  {
    cityId: 7,
    name: 'Karachi',
    crates: { food: 3, water: 1 },
  },
  {
    cityId: 8,
    name: 'Delhi',
    crates: { power: 3, food: 1 },
  },
  {
    cityId: 9,
    name: 'Bangkok',
    crates: { power: 2, firstAid: 2 },
  },
  {
    cityId: 10,
    name: 'Hong Kong',
    crates: { water: 2, food: 2 },
  },
  {
    cityId: 11,
    name: 'Seoul',
    crates: { food: 2, power: 2 },
  },
  {
    cityId: 12,
    name: 'Tokyo',
    crates: { firstAid: 2, food: 2 },
  },
  {
    cityId: 13,
    name: 'Manila',
    crates: { vaccine: 2, water: 2 },
  },
  {
    cityId: 14,
    name: 'Sydney',
    crates: { firstAid: 2, vaccine: 2 },
  },
  {
    cityId: 15,
    name: 'Johannesburg',
    crates: { vaccine: 2, food: 1, power: 1 },
  },
  {
    cityId: 16,
    name: 'Lagos',
    crates: { food: 2, power: 1, water: 1 },
  },
  {
    cityId: 17,
    name: 'São Paulo',
    crates: { power: 2, firstAid: 1, food: 1 },
  },
  {
    cityId: 18,
    name: 'Bogotá',
    crates: { water: 2, food: 1, vaccine: 1 },
  },
  {
    cityId: 19,
    name: 'Mexico City',
    crates: { firstAid: 2, vaccine: 1, power: 1 },
  },
  {
    cityId: 20,
    name: 'Los Angeles',
    crates: { vaccine: 2, water: 1, firstAid: 1 },
  },
  {
    cityId: 21,
    name: 'Atlanta',
    crates: { firstAid: 1, water: 1, food: 1, power: 1, vaccine: 1 },
  },
  {
    cityId: 22,
    name: 'Montréal',
    crates: { firstAid: 1, vaccine: 1, power: 1, food: 1 },
  },
  {
    cityId: 23,
    name: 'Madrid',
    crates: { water: 1, firstAid: 1, vaccine: 1, power: 1 },
  },
] as const

export const CITY_COUNT = CITIES.length

export function getCityById(cityId: number): CityRequirement | undefined {
  return CITIES.find((c) => c.cityId === cityId)
}

export function getCityByName(name: string): CityRequirement | undefined {
  return CITIES.find((c) => c.name === name)
}

/** Total crates required for delivery to this city. */
export function totalCratesRequired(city: CityRequirement): number {
  return Object.values(city.crates).reduce((sum, n) => sum + (n ?? 0), 0)
}
