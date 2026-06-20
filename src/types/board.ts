export type SupplyType = 'vaccine' | 'food' | 'power' | 'water' | 'firstAid'

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
