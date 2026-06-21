import { Wifi, WifiOff } from 'lucide-react'
import { DIFFICULTY_CONFIG } from '../../../lib/constants'
import { TIMER_SECONDS, WASTE_MAX } from '../../../lib/constants/game'
import { HQ_TOKENS_START, SUPPLY_TOKENS_START } from '../../../lib/constants/tokens'
import type { Difficulty } from '../../../types/game'
import type { TurnStep } from '../../../types/engine'
import { useGameStore } from '../../../store/gameStore'

interface MissionHeaderProps {
  roomCode: string
  activePlayer: string
  turnStep?: TurnStep
  difficulty: Difficulty
  crisisEnabled: boolean
}

const STEP_LABEL: Record<TurnStep, string> = {
  roll: 'Roll Dice',
  useDice: 'Use Dice',
  pausedByTimer: 'Timer Event',
}

function TokenDots({
  label,
  count,
  max,
  tone,
}: {
  label: string
  count: number
  max: number
  tone: 'hq' | 'supply'
}) {
  return (
    <span className={`mission-bar__tokens mission-bar__tokens--${tone}`} title={`${label}: ${count}/${max}`}>
      <span className="mission-bar__tokens-label">{label}</span>
      <span className="mission-bar__dots" aria-hidden>
        {Array.from({ length: max }, (_, i) => (
          <span
            key={i}
            className={`mission-bar__dot${i < count ? ' mission-bar__dot--on' : ''}`}
          />
        ))}
      </span>
    </span>
  )
}

export function MissionHeader({
  roomCode,
  activePlayer,
  turnStep = 'roll',
  difficulty,
  crisisEnabled,
}: MissionHeaderProps) {
  const timer = useGameStore((s) => s.snapshot?.timer ?? TIMER_SECONDS)
  const timerRunning = useGameStore((s) => s.snapshot?.timerRunning ?? false)
  const cityDeck = useGameStore((s) => s.snapshot?.cityDeck.length ?? 0)
  const waste = useGameStore((s) => s.snapshot?.waste ?? 0)
  const hqTokens = useGameStore((s) => s.snapshot?.hqTokens ?? HQ_TOKENS_START)
  const supplyTokens = useGameStore((s) => s.snapshot?.supplyTokens ?? SUPPLY_TOKENS_START)
  const localMode = useGameStore((s) => s.localMode)
  const isTimerEvent = turnStep === 'pausedByTimer'

  const mm = Math.floor(Math.max(0, timer) / 60)
  const ss = String(Math.max(0, timer) % 60).padStart(2, '0')

  let timerClass = 'mission-bar__timer'
  if (timer <= 30 && timerRunning) timerClass += ' mission-bar__timer--warn'
  if (timer <= 10 && timerRunning) timerClass += ' mission-bar__timer--crit'
  if (isTimerEvent) timerClass += ' mission-bar__timer--event'

  return (
    <div className="mission-bar mission-bar--control" role="status" aria-label="Mission status" data-testid="mission-header">
      <div className="mission-bar__left">
        <img
          src="/logos/prr-icon.svg"
          alt=""
          width={22}
          height={22}
          className="mission-bar__logo"
        />
        <div className="mission-bar__identity">
          <span className="mission-bar__brand">PRR Mission</span>
          <span className="mission-bar__meta">
            <span className="mission-bar__code">Room {roomCode}</span>
            <span className="mission-bar__sep" aria-hidden>
              ·
            </span>
            <span>{DIFFICULTY_CONFIG[difficulty].label}</span>
            <span className="mission-bar__sep" aria-hidden>
              ·
            </span>
            <span className={crisisEnabled ? 'mission-bar__crisis--on' : 'mission-bar__crisis--off'}>
              Crisis {crisisEnabled ? 'On' : 'Off'}
            </span>
          </span>
        </div>
      </div>

      <div className="mission-bar__center">
        <div className="mission-bar__turn-block">
          <span className="mission-bar__player">{activePlayer}&apos;s Turn</span>
          <span className="mission-bar__phase">{STEP_LABEL[turnStep]}</span>
        </div>
        <div className={timerClass} aria-live="polite" aria-label={`Mission clock ${mm}:${ss}`}>
          <span className="mission-bar__timer-value">{mm}:{ss}</span>
        </div>
      </div>

      <div className="mission-bar__right">
        <TokenDots label="HQ" count={hqTokens} max={HQ_TOKENS_START} tone="hq" />
        <TokenDots label="Supply" count={supplyTokens} max={SUPPLY_TOKENS_START} tone="supply" />
        <span className="mission-bar__chip mission-bar__chip--deck">Deck {cityDeck}</span>
        <span
          className={`mission-bar__chip mission-bar__chip--waste${waste >= WASTE_MAX - 2 ? ' mission-bar__chip--danger' : ''}`}
        >
          Waste {waste}/{WASTE_MAX}
        </span>
        <span
          className={`mission-bar__conn${localMode ? ' mission-bar__conn--local' : ''}`}
          title={localMode ? 'Local mode' : 'Online'}
          aria-label={localMode ? 'Local mode — not connected to server' : 'Online — connected to server'}
        >
          {localMode ? <WifiOff size={12} /> : <Wifi size={12} />}
        </span>
      </div>
    </div>
  )
}
