import { useGameStore } from '../../store/gameStore'
import { Trophy, Skull, RotateCcw, Home } from 'lucide-react'
import { Button } from '../ds/Button'
import { DIFFICULTY_CONFIG } from '../../lib/constants'
import { TOKEN_DISPLAY } from '../../lib/engine/selectors'
import { WASTE_MAX } from '../../lib/constants/game'

function lossReason(waste: number, hqTokens: number): string {
  if (waste >= WASTE_MAX) {
    return 'Waste overflow — the recycling track hit critical.'
  }
  if (hqTokens <= 0) {
    return 'HQ time exhausted — no emergency tokens remained.'
  }
  return 'Mission parameters exceeded safe limits.'
}

export function GameEnd() {
  const open = useGameStore((s) => s.modals.gameEnd)
  const snapshot = useGameStore((s) => s.snapshot)
  const settings = useGameStore((s) => s.settings)
  const reset = useGameStore((s) => s.reset)

  if (!open || !snapshot?.result) return null

  const delivered = snapshot.cities.filter((c) => c.status === 'delivered').length
  const isWin = snapshot.result === 'win'
  const diffLabel = DIFFICULTY_CONFIG[settings.difficulty].label

  return (
    <div className="game-end-backdrop" role="dialog" aria-label={isWin ? 'Mission success' : 'Mission failed'}>
      <div className={`game-end-panel${isWin ? ' game-end-panel--win' : ' game-end-panel--lose'}`}>
        {isWin ? (
          <Trophy size={48} className="game-end-panel__icon game-end-panel__icon--win" />
        ) : (
          <Skull size={48} className="game-end-panel__icon game-end-panel__icon--lose" />
        )}

        <h2 className={`game-end-panel__title${isWin ? ' game-end-panel__title--win' : ' game-end-panel__title--lose'}`}>
          {isWin ? 'Mission Success' : 'Mission Failed'}
        </h2>

        <p className="game-end-panel__reason">
          {isWin
            ? 'All cities cleared. Supplies delivered. The crew pulled it off.'
            : lossReason(snapshot.waste, snapshot.hqTokens)}
        </p>

        <div className="game-end-panel__stats">
          <div className="game-end-stat">
            <div className="game-end-stat__value">{delivered}/24</div>
            <div className="game-end-stat__label">Cities delivered</div>
          </div>
          <div className="game-end-stat">
            <div className="game-end-stat__value">{diffLabel}</div>
            <div className="game-end-stat__label">Difficulty</div>
          </div>
          <div className="game-end-stat">
            <div className="game-end-stat__value">{snapshot.waste}/{TOKEN_DISPLAY.wasteMax}</div>
            <div className="game-end-stat__label">Waste level</div>
          </div>
          <div className="game-end-stat">
            <div className="game-end-stat__value">{snapshot.hqTokens}</div>
            <div className="game-end-stat__label">HQ tokens left</div>
          </div>
          <div className="game-end-stat">
            <div className="game-end-stat__value">{settings.crisisEnabled ? 'On' : 'Off'}</div>
            <div className="game-end-stat__label">Crisis mode</div>
          </div>
          <div className="game-end-stat">
            <div className="game-end-stat__value">{snapshot.cityDeck.length}</div>
            <div className="game-end-stat__label">Cards in deck</div>
          </div>
        </div>

        <div className="game-end-panel__actions">
          <Button
            onClick={() => {
              reset()
              window.location.href = '/play'
            }}
            icon={<RotateCcw size={16} />}
          >
            Return to Lobby
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              reset()
              window.location.href = '/'
            }}
            icon={<Home size={16} />}
          >
            Mission Briefing
          </Button>
        </div>
      </div>
    </div>
  )
}
