import { TIMER_SECONDS } from '../constants/game'
import type { GameSnapshot } from '../../types/engine'
import { resolveCrisisDraw } from './crisis'

/** Runs timer event after BEGIN_TIMER_EVENT paused the turn. */
export function runTimerEvent(state: GameSnapshot): string | null {
  if (state.result) return null

  const resumeStep =
    state.timerResumeStep ?? (state.turnStep === 'roll' ? 'roll' : 'useDice')

  if (state.hqTokens <= 0) {
    state.result = 'lose'
    state.timerRunning = false
    state.turnStep = resumeStep
    state.timerResumeStep = undefined
    return null
  }

  state.hqTokens -= 1

  if (state.settings.crisisEnabled && state.crisisDeck.length > 0) {
    const crisis = state.crisisDeck.shift()!
    const err = resolveCrisisDraw(state, crisis)
    if (err) return err
  }

  if (state.cityDeck.length > 0) {
    const cityIndex = state.cityDeck.shift()!
    const city = state.cities.find((c) => c.cityIndex === cityIndex)
    if (city) city.status = 'faceUpOnPath'
  }

  state.timer = TIMER_SECONDS
  state.timerRunning = true
  state.turnStep = resumeStep
  state.timerResumeStep = undefined
  return null
}
