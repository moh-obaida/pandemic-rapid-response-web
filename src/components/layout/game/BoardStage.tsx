import type { ReactNode } from 'react'
import { RouteMonitor } from '../../Board/RouteMonitor'

interface BoardStageProps {
  children: ReactNode
  onCityClick?: (cityId: number) => void
}

/** Center table: large board image + optional route monitor strip. */
export function BoardStage({ children, onCityClick }: BoardStageProps) {
  return (
    <div className="board-stage-inner board-stage-inner--table">
      <div className="board-stage-inner__main">{children}</div>
      <RouteMonitor onCityClick={onCityClick} />
    </div>
  )
}
