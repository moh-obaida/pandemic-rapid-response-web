import { CITIES } from './constants/cities'

/** City name → asset filename slug (matches cards/cities/*.png). */
export function citySlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
}

export const CITY_SLUGS = CITIES.map((c) => citySlug(c.name)) as readonly string[]

export type CitySlug = (typeof CITY_SLUGS)[number]

export function citySlugById(cityId: number): CitySlug {
  const city = CITIES.find((c) => c.cityId === cityId)
  if (!city) throw new Error(`Unknown cityId: ${cityId}`)
  return citySlug(city.name) as CitySlug
}

export function cityIdBySlug(slug: string): number {
  const city = CITIES.find((c) => citySlug(c.name) === slug)
  if (!city) throw new Error(`Unknown city slug: ${slug}`)
  return city.cityId
}
