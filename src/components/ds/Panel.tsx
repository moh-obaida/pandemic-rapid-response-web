import type { CSSProperties, ReactNode } from 'react'

interface PanelProps {
  children: ReactNode
  label?: string
  accent?: string
  stripe?: 'left' | 'top'
  padding?: number
  style?: CSSProperties
}

export function Panel({
  children,
  label,
  accent,
  stripe = 'left',
  padding = 16,
  style,
}: PanelProps) {
  const stripeStyle = accent
    ? stripe === 'top'
      ? { borderTop: `3px solid ${accent}` }
      : { borderLeft: `3px solid ${accent}` }
    : {}

  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-panel)',
        overflow: 'hidden',
        ...stripeStyle,
        ...style,
      }}
    >
      {label && <div className="ds-label" style={{ padding: '10px 14px 0' }}>{label}</div>}
      <div style={{ padding }}>{children}</div>
    </div>
  )
}
