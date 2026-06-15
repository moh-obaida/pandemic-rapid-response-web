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
      style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 200 }}
      aria-label={`Waste level ${value} of ${max}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="ds-label">Waste</span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: 14,
            color: value >= max * 0.85 ? 'var(--error)' : 'var(--text-dim)',
          }}
        >
          {value} / {max}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {cells.map((i) => (
          <div
            key={i}
            className={i === value ? 'animate-waste-slide' : ''}
            style={{
              flex: 1,
              height: 14,
              borderRadius: 3,
              background: colorFor(i),
              transition: 'background var(--dur-med)',
              boxShadow: i === value ? '0 0 8px -1px var(--error)' : 'none',
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
        }}
      >
        <span>0</span>
        <span>END</span>
      </div>
    </div>
  )
}
