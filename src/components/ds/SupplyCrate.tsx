import type { SupplyType } from '../../types/board'
import { crateImagePath } from '../../lib/assetManifest'

interface SupplyCrateProps {
  type: SupplyType | string
  size?: number
  count?: number
  inCargo?: boolean
  onClick?: () => void
}

export function SupplyCrate({
  type,
  size = 44,
  count,
  inCargo,
  onClick,
}: SupplyCrateProps) {
  const key = (type === 'firstAid' ? 'firstAid' : type) as SupplyType
  const src = crateImagePath(key)

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className="game-crate-img"
      style={{
        position: 'relative',
        display: 'inline-block',
        width: size,
        height: size,
        outline: inCargo ? '2px solid var(--highlight)' : undefined,
        cursor: onClick ? 'pointer' : 'default',
      }}
      aria-label={`${key} crate`}
    >
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className="game-crate-img__art"
        draggable={false}
      />
      {count != null && (
        <span className="game-crate-img__count">{count}</span>
      )}
    </div>
  )
}
