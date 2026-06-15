import { useState, type ReactNode } from 'react'

interface TooltipProps {
  content: string
  children: ReactNode
}

export function Tooltip({ content, children }: TooltipProps) {
  const [show, setShow] = useState(false)

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            padding: '6px 10px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-900)',
            border: '1px solid var(--line)',
            boxShadow: 'var(--shadow-pop)',
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: 'var(--text-dim)',
            whiteSpace: 'normal',
            width: 'max-content',
            pointerEvents: 'none',
          }}
        >
          {content}
        </span>
      )}
    </span>
  )
}
