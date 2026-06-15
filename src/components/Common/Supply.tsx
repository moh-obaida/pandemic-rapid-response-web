import type { SupplyType } from '../../types/board'
import { SupplyCrate } from '../ds/SupplyCrate'

interface SupplyProps {
  type: SupplyType
  inCargo?: boolean
  size?: 'sm' | 'md'
}

export function Supply({ type, inCargo, size = 'md' }: SupplyProps) {
  return (
    <SupplyCrate
      type={type}
      size={size === 'sm' ? 28 : 36}
      inCargo={inCargo}
    />
  )
}
