import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'success'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  iconRight?: ReactNode
  full?: boolean
  roomColor?: string
}

const HEIGHTS: Record<Size, string> = {
  sm: 'var(--control-h-sm)',
  md: 'var(--control-h-md)',
  lg: 'var(--control-h-lg)',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  disabled = false,
  full = false,
  roomColor,
  style,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  ...rest
}: ButtonProps) {
  const variants: Record<Variant, { bg: string; fg: string; bd: string }> = {
    primary: { bg: 'var(--accent)', fg: '#fff', bd: 'transparent' },
    secondary: { bg: 'var(--bg-raised)', fg: 'var(--text)', bd: 'var(--line-strong)' },
    ghost: { bg: 'transparent', fg: 'var(--text-dim)', bd: 'transparent' },
    success: { bg: 'var(--highlight)', fg: '#0f2a12', bd: 'transparent' },
  }
  let v = variants[variant]
  if (roomColor) v = { bg: roomColor, fg: 'var(--text-on-color)', bd: 'transparent' }

  return (
    <button
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: HEIGHTS[size],
        padding: size === 'sm' ? '0 14px' : size === 'lg' ? '0 24px' : '0 18px',
        width: full ? '100%' : 'auto',
        fontFamily: 'var(--font-body)',
        fontWeight: 700,
        fontSize: size === 'sm' ? 13 : size === 'lg' ? 17 : 15,
        lineHeight: 1,
        letterSpacing: '0.01em',
        color: v.fg,
        background: v.bg,
        border: `1.5px solid ${v.bd}`,
        borderRadius: 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'transform var(--dur-fast) var(--ease-snap), filter var(--dur-fast)',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        ...style,
      }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'
        onMouseDown?.(e)
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        onMouseUp?.(e)
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        onMouseLeave?.(e)
      }}
      {...rest}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  )
}
