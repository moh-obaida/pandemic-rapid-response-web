import type { CSSProperties, ReactNode } from 'react'

interface PanelProps {
  children: ReactNode
  label?: string
  accent?: string
  stripe?: 'left' | 'top'
  padding?: number
  style?: CSSProperties
  className?: string
}

export function Panel({
  children,
  label,
  accent,
  stripe = 'left',
  padding = 16,
  style,
  className,
}: PanelProps) {
  const stripeStyle = accent
    ? stripe === 'top'
      ? { borderTop: `4px solid ${accent}` }
      : { borderLeft: `4px solid ${accent}` }
    : {}

  return (
    <div
      className={className}
      style={{
        background: 'var(--bg-glass)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-panel)',
        overflow: 'hidden',
        transition: 'border-color var(--dur-med)',
        backdropFilter: 'blur(12px)',
        ...stripeStyle,
        ...style,
      }}
    >
      {label && <div className="ds-label" style={{ padding: '12px 16px 0', letterSpacing: '0.12em' }}>{label}</div>}
      <div style={{ padding }}>{children}</div>
    </div>
  )
}
