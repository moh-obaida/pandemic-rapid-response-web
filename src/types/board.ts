export type SupplyType = 'vaccine' | 'food' | 'power' | 'water' | 'firstAid'
export type RegionColor = 'blue' | 'yellow' | 'red'
export type RoomId =
  | 'hq'
  | 'vaccine'
  | 'food'
  | 'power'
  | 'water'
  | 'firstAid'
  | 'recycling'
  | 'cargo'

export type RoleId =
  | 'analyst'
  | 'technician'
  | 'engineer'
  | 'flightPlanner'
  | 'director'
  | 'recycler'
  | 'supplySpecialist'

export type CrisisEffectType = 'waste' | 'dice' | 'timeToken' | 'delivery'

export interface Role {
  id: RoleId
  name: string
  description: string
  ability: string
  rerollBonus: number
}

export interface Room {
  id: RoomId
  name: string
  color: string
  supplyType: SupplyType | null
  icon: string
}

export interface City {
  id: number
  name: string
  region: RegionColor
  supplyNeeded: SupplyType
  delivered: boolean
  distance: number
}

export interface CrisisCard {
  id: string
  name: string
  description: string
  effectType: CrisisEffectType
  value: number
  immediate: boolean
}

export interface BoardState {
  planePosition: number
  cities: City[]
  currentCrisis: CrisisCard | null
  crisisDeck: CrisisCard[]
  cityDeckSize: number
}
