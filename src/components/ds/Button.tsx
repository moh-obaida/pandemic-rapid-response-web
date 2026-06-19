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
  const variants: Record<Variant, { bg: string; fg: string; bd: string; hover: string }> = {
    primary: { bg: 'var(--accent)', fg: '#fff', bd: 'transparent', hover: 'var(--accent-deep)' },
    secondary: { bg: 'var(--bg-raised)', fg: 'var(--text)', bd: 'var(--line-strong)', hover: 'var(--line-strong)' },
    ghost: { bg: 'transparent', fg: 'var(--text-dim)', bd: 'transparent', hover: 'var(--bg-hover)' },
    success: { bg: 'var(--highlight)', fg: '#fff', bd: 'transparent', hover: 'var(--highlight)' },
  }
  let v = variants[variant]
  if (roomColor) v = { bg: roomColor, fg: 'var(--text-on-color)', bd: 'transparent', hover: roomColor }

  return (
    <button
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: HEIGHTS[size],
        padding: size === 'sm' ? '0 14px' : size === 'lg' ? '0 28px' : '0 20px',
        width: full ? '100%' : 'auto',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: size === 'sm' ? 13 : size === 'lg' ? 16 : 15,
        lineHeight: 1,
        letterSpacing: '0.02em',
        color: v.fg,
        background: v.bg,
        border: `2px solid ${v.bd}`,
        borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        boxShadow: variant === 'primary' ? '0 4px 12px rgba(220, 38, 38, 0.2)' : 'none',
        ...style,
      }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(0.98)'
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
