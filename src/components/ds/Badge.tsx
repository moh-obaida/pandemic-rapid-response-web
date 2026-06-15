import type { CSSProperties, ReactNode } from 'react'

type Tone = 'neutral' | 'active' | 'valid' | 'critical' | 'plane'

interface BadgeProps {
  children: ReactNode
  tone?: Tone
  solid?: boolean
  style?: CSSProperties
}

export function Badge({ children, tone = 'neutral', solid = false, style }: BadgeProps) {
  const tones: Record<Tone, { fg: string; bg: string }> = {
    neutral: { fg: 'var(--text-dim)', bg: 'var(--bg-raised)' },
    active: { fg: 'var(--active)', bg: '#3a2f12' },
    valid: { fg: 'var(--highlight)', bg: '#1f3a22' },
    critical: { fg: 'var(--error)', bg: 'var(--accent-soft)' },
    plane: { fg: '#e3b6ec', bg: 'var(--plane-soft)' },
  }
  const t = tones[tone]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        padding: '4px 10px',
        borderRadius: 'var(--radius-pill)',
        color: solid ? 'var(--text-on-color)' : t.fg,
        background: solid ? t.fg : t.bg,
        ...style,
      }}
    >
      {children}
    </span>
  )
}
