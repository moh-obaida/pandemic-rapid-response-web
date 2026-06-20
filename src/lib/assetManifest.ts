import type { CrisisDefinitionId } from './constants/crises'
import type { DieFace } from './constants/dice'
import { CITIES } from './constants/cities'
import type { RoleId, SupplyType } from '../types/board'
import { CITY_SLUGS, citySlug, type CitySlug } from './cityAssets'

const BASE = '/assets/prr'

const ROLE_FILES: Record<RoleId, string> = {
  analyst: 'analyst',
  technician: 'technician',
  engineer: 'engineer',
  flightPlanner: 'flight-planner',
  director: 'director',
  recycler: 'recycler',
  supplySpecialist: 'supply-specialist',
}

const DICE_FILES: Record<DieFace, string> = {
  plane: 'plane',
  water: 'water',
  food: 'food',
  power: 'power',
  vaccine: 'vaccine',
  firstAid: 'first-aid',
}

const CRATE_FILES: Record<SupplyType, string> = {
  water: 'water',
  food: 'food',
  power: 'power',
  vaccine: 'vaccine',
  firstAid: 'first-aid',
}

const CRISIS_IDS = [
  'distraction',
  'turbulence',
  'extreme-winds',
  'equipment-failure',
  'safety-drill',
  'evacuation',
  'supply-spill',
  'urgent-vaccine-delivery',
  'urgent-food-delivery',
  'urgent-power-delivery',
  'urgent-water-delivery',
  'urgent-first-aid-delivery',
] as const satisfies readonly CrisisDefinitionId[]

function cityPaths() {
  return Object.fromEntries(
    CITY_SLUGS.map((slug) => [slug, `${BASE}/cards/cities/${slug}.png`])
  ) as Record<CitySlug, string>
}

function rolePaths() {
  return Object.fromEntries(
    (Object.keys(ROLE_FILES) as RoleId[]).map((id) => [
      id,
      `${BASE}/cards/roles/${ROLE_FILES[id]}.png`,
    ])
  ) as Record<RoleId, string>
}

function dicePaths() {
  return Object.fromEntries(
    (Object.keys(DICE_FILES) as DieFace[]).map((face) => [
      face,
      `${BASE}/dice/${DICE_FILES[face]}.png`,
    ])
  ) as Record<DieFace, string>
}

function cratePaths() {
  return Object.fromEntries(
    (Object.keys(CRATE_FILES) as SupplyType[]).map((type) => [
      type,
      `${BASE}/crates/${CRATE_FILES[type]}.png`,
    ])
  ) as Record<SupplyType, string>
}

function crisisPaths() {
  return Object.fromEntries(
    CRISIS_IDS.map((id) => [id, `${BASE}/crises/${id}.png`])
  ) as Record<CrisisDefinitionId, string>
}

/** Strict PRR asset manifest — every path is required for gameplay UI. */
export const assetManifest = {
  board: {
    planeBoard: `${BASE}/board/plane-board.png`,
    cityCardBack: `${BASE}/board/city-card-back.png`,
    controlPanel: `${BASE}/board/control-panel.png`,
    turnReference: `${BASE}/board/turn-reference.png`,
    radar: `${BASE}/board/radar.png`,
    hqBadge: `${BASE}/board/hq-badge.png`,
    cratesSprite: `${BASE}/board/crates-sprite.png`,
  },
  cards: {
    cities: cityPaths(),
    roles: rolePaths(),
  },
  crises: crisisPaths(),
  dice: dicePaths(),
  crates: cratePaths(),
  tokens: {
    timeToken: `${BASE}/tokens/time-token.png`,
    wasteMarker: `${BASE}/tokens/waste-marker.png`,
  },
} as const

/** Flat list of every required asset URL (for validation). */
export function allRequiredAssetPaths(): string[] {
  const paths: string[] = []
  const walk = (node: unknown) => {
    if (typeof node === 'string') paths.push(node)
    else if (node && typeof node === 'object')
      Object.values(node).forEach(walk)
  }
  walk(assetManifest)
  return paths
}

export function cityImagePathById(cityId: number): string {
  const city = CITIES.find((c) => c.cityId === cityId)
  if (!city) throw new Error(`Unknown cityId: ${cityId}`)
  const slug = citySlug(city.name) as CitySlug
  return assetManifest.cards.cities[slug]
}

/** @deprecated prefer cityImagePathById */
export function cityImagePath(cityId: number): string {
  return cityImagePathById(cityId)
}

export function cityImagePathBySlug(slug: CitySlug): string {
  return assetManifest.cards.cities[slug]
}

export function roleImagePath(roleId: RoleId): string {
  return assetManifest.cards.roles[roleId]
}

export function crisisImagePath(id: CrisisDefinitionId): string {
  return assetManifest.crises[id]
}

export function dieImagePath(face: DieFace): string {
  return assetManifest.dice[face]
}

export function crateImagePath(type: SupplyType): string {
  return assetManifest.crates[type]
}
