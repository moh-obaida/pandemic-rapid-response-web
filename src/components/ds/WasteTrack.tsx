interface WasteTrackProps {
  value?: number
  max?: number
}

export function WasteTrack({ value = 0, max = 12 }: WasteTrackProps) {
  const cells = Array.from({ length: max }, (_, i) => i + 1)
  const colorFor = (i: number) => {
    if (i > value) return 'var(--bg-raised)'
    const frac = i / max
    if (frac >= 0.85) return 'var(--waste-end)'
    if (frac >= 0.66) return 'var(--waste-high)'
    if (frac >= 0.4) return 'var(--waste-mid)'
    return 'var(--waste-low)'
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minWidth: 220,
        padding: '16px 20px',
        background: 'var(--bg-panel)',
        borderRadius: '12px',
        border: `2px solid ${value >= max * 0.85 ? 'var(--error)' : 'var(--line)'}`,
        transition: 'border-color 200ms ease',
      }}
      aria-label={`Waste level ${value} of ${max}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
        <span className="ds-label" style={{ letterSpacing: '0.12em' }}>
          Operational Waste
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: 14,
            color: value >= max * 0.85 ? 'var(--error)' : 'var(--text-dim)',
          }}
        >
          {value}/{max}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 3 }}>
        {cells.map((i) => (
          <div
            key={i}
            className={i === value ? 'animate-waste-slide' : ''}
            style={{
              flex: 1,
              height: 16,
              borderRadius: 4,
              background: colorFor(i),
              transition: 'background 200ms ease',
              border: `1px solid ${colorFor(i) === 'var(--bg-raised)' ? 'var(--line-soft)' : 'transparent'}`,
              boxShadow: i === value ? `0 0 12px ${value >= max * 0.85 ? 'var(--error)' : 'var(--accent)'}60` : 'none',
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text-faint)',
          letterSpacing: '0.05em',
        }}
      >
        <span>Safe</span>
        <span>Critical</span>
      </div>
    </div>
  )
}
