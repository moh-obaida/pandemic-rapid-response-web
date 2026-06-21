import type { ReactNode } from 'react'
import { RouteMonitor } from '../../Board/RouteMonitor'
import { BoardTableFrame } from '../../landing/BoardTableFrame'

interface BoardStageProps {
  children: ReactNode
  onCityClick?: (cityId: number) => void
}

/** Center stage: vertical PRR board fills available height, route strip below. */
export function BoardStage({ children, onCityClick }: BoardStageProps) {
  return (
    <div className="board-stage-inner board-stage-inner--table">
      <div className="board-stage-inner__main">
        <BoardTableFrame className="mission-table--game" label="Live board">
          {children}
        </BoardTableFrame>
      </div>
      <RouteMonitor onCityClick={onCityClick} />
    </div>
  )
}
