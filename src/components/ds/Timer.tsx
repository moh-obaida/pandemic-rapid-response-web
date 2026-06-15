interface TimerProps {
  seconds?: number
  total?: number
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export function Timer({
  seconds = 120,
  total = 120,
  size = 'lg',
  label = 'Round Timer',
}: TimerProps) {
  const mm = Math.floor(Math.max(0, seconds) / 60)
  const ss = String(Math.max(0, seconds) % 60).padStart(2, '0')
  let zone = 'var(--timer-safe)'
  if (seconds <= 60) zone = 'var(--timer-warn)'
  if (seconds <= 30) zone = 'var(--timer-crit)'
  const pulsing = seconds <= 5 && seconds > 0
  const FS = { sm: 28, md: 44, lg: 64 }[size]
  const pct = Math.max(0, Math.min(1, seconds / total))

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
      aria-live="polite"
      aria-label={`${label}: ${mm}:${ss}`}
    >
      <span className="ds-label">{label}</span>
      <div
        className={pulsing ? 'animate-timer-flash' : ''}
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: FS,
          lineHeight: 1,
          color: zone,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '0.01em',
        }}
      >
        {mm}:{ss}
      </div>
      <div
        style={{
          width: FS * 3,
          height: 6,
          borderRadius: 999,
          background: 'var(--bg-raised)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct * 100}%`,
            height: '100%',
            background: zone,
            transition: 'width 1s linear, background var(--dur-slow)',
          }}
        />
      </div>
      {seconds <= 5 && seconds > 0 && (
        <span className="ds-label" style={{ color: 'var(--error)' }}>
          Timer Low
        </span>
      )}
    </div>
  )
}
