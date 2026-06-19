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
      ? { borderTop: `4px solid ${accent}` }
      : { borderLeft: `4px solid ${accent}` }
    : {}

  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        border: '2px solid var(--line)',
        borderRadius: '12px',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        transition: 'all 200ms ease',
        ...stripeStyle,
        ...style,
      }}
    >
      {label && <div className="ds-label" style={{ padding: '12px 16px 0', letterSpacing: '0.12em' }}>{label}</div>}
      <div style={{ padding }}>{children}</div>
    </div>
  )
}
