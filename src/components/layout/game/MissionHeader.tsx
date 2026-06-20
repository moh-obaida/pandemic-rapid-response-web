import { DIFFICULTY_CONFIG } from '../../../lib/constants'
import type { Difficulty } from '../../../types/game'

interface MissionHeaderProps {
  roomCode: string
  round: number
  difficulty: Difficulty
}

export function MissionHeader({ roomCode, round, difficulty }: MissionHeaderProps) {
  return (
    <>
      <div className="mission-header__brand">
        <h1 className="mission-header__title">PRR Online</h1>
        <span className="mission-header__code">{roomCode}</span>
      </div>
      <div className="mission-header__meta">
        Round {round} · {DIFFICULTY_CONFIG[difficulty].label}
      </div>
    </>
  )
}
