/**
 * Mission table layout targets landscape ~16:9. In portrait, tablets (e.g. iPad 1024px wide)
 * still letterbox the game shell into an unusable strip — prompt before that happens.
 */
export const PORTRAIT_PROMPT_MAX_WIDTH = 1100

export function shouldShowPortraitPrompt(): boolean {
  if (typeof window === 'undefined') return false
  const portrait = window.innerHeight > window.innerWidth
  const tooNarrowForMissionTable = window.innerWidth <= PORTRAIT_PROMPT_MAX_WIDTH
  return portrait && tooNarrowForMissionTable
}
