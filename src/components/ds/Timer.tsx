interface TimerProps {
  seconds?: number
  total?: number
  size?: 'sm' | 'md' | 'lg'
  label?: string
  flashing?: boolean
}

export function Timer({
  seconds = 120,
  total = 120,
  size = 'lg',
  label = 'Round Timer',
  flashing = false,
}: TimerProps) {
  const mm = Math.floor(Math.max(0, seconds) / 60)
  const ss = String(Math.max(0, seconds) % 60).padStart(2, '0')
  let zone = 'var(--timer-safe)'
  if (seconds <= 60) zone = 'var(--timer-warn)'
  if (seconds <= 30) zone = 'var(--timer-crit)'
  const pulsing = flashing || (seconds <= 5 && seconds > 0)
  const FS = { sm: 28, md: 44, lg: 64 }[size]
  const pct = Math.max(0, Math.min(1, seconds / total))

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        padding: '16px 20px',
        background: 'var(--bg-panel)',
        borderRadius: '12px',
        border: `2px solid ${zone}`,
        transition: 'border-color 200ms ease',
      }}
      aria-live="polite"
      aria-label={`${label}: ${mm}:${ss}`}
    >
      <span className="ds-label" style={{ letterSpacing: '0.12em' }}>
        {label}
      </span>
      <div
        className={pulsing ? 'animate-timer-flash' : ''}
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: FS,
          lineHeight: 1,
          color: zone,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em',
          textShadow: `0 0 12px ${zone}40`,
        }}
      >
        {mm}:{ss}
      </div>
      <div
        style={{
          width: FS * 3.2,
          height: 8,
          borderRadius: 999,
          background: 'var(--bg-raised)',
          overflow: 'hidden',
          border: `1px solid ${zone}40`,
        }}
      >
        <div
          style={{
            width: `${pct * 100}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${zone}, ${zone}cc)`,
            transition: 'width 1s linear, background 200ms ease',
            boxShadow: `0 0 8px ${zone}60`,
          }}
        />
      </div>
      {seconds <= 5 && seconds > 0 && (
        <span className="ds-label" style={{ color: 'var(--error)', letterSpacing: '0.12em' }}>
          Critical
        </span>
      )}
    </div>
  )
}
