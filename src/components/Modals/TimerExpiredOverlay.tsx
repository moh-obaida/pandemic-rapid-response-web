import { useGameStore } from '../../store/gameStore'

const STEPS = [
  { id: 'expired', label: 'Timer expired' },
  { id: 'hq', label: 'HQ token lost' },
  { id: 'crisis', label: 'Crisis card revealed' },
  { id: 'city', label: 'New city detected' },
  { id: 'resume', label: 'Mission resumes — same player continues' },
] as const

export function TimerExpiredOverlay() {
  const turnStep = useGameStore((s) => s.snapshot?.turnStep)
  const crisisEnabled = useGameStore((s) => s.settings.crisisEnabled)
  const cityDeckCount = useGameStore((s) => s.snapshot?.cityDeck.length ?? 0)

  if (turnStep !== 'pausedByTimer') return null

  const steps = STEPS.filter((step) => {
    if (step.id === 'crisis') return crisisEnabled
    if (step.id === 'city') return cityDeckCount > 0
    if (step.id === 'resume') return false
    return true
  })

  const resumeDelay = steps.length * 0.35 + 0.25

  return (
    <div className="timer-expired-overlay" role="alertdialog" aria-label="Timer expired">
      <div className="timer-expired-overlay__panel">
        <p className="timer-expired-overlay__eyebrow">Mission interruption</p>
        <h2 className="timer-expired-overlay__title">Timer Expired</h2>
        <ol className="timer-expired-overlay__steps">
          {steps.map((step, i) => (
            <li
              key={step.id}
              className="timer-expired-overlay__step timer-expired-overlay__step--animate"
              style={{ animationDelay: `${i * 0.35}s` }}
            >
              <span className="timer-expired-overlay__step-num">{i + 1}</span>
              <span>{step.label}</span>
            </li>
          ))}
        </ol>
        <p
          className="timer-expired-overlay__resume timer-expired-overlay__step--animate"
          style={{ animationDelay: `${resumeDelay}s` }}
        >
          Continue your turn
        </p>
        <div className="timer-expired-overlay__pulse" aria-hidden />
      </div>
    </div>
  )
}
