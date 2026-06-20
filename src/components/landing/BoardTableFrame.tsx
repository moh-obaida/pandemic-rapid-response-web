import type { ReactNode } from 'react'

interface BoardTableFrameProps {
  children?: ReactNode
  className?: string
  label?: string
}

/** Dark mission-table bezel — embeds board assets into the cockpit UI. */
export function BoardTableFrame({
  children,
  className = '',
  label = 'Mission table',
}: BoardTableFrameProps) {
  return (
    <div className={`mission-table ${className}`.trim()} aria-label={label}>
      <div className="mission-table__bezel">
        <span className="mission-table__corner mission-table__corner--tl" aria-hidden />
        <span className="mission-table__corner mission-table__corner--tr" aria-hidden />
        <span className="mission-table__corner mission-table__corner--bl" aria-hidden />
        <span className="mission-table__corner mission-table__corner--br" aria-hidden />
        <span className="mission-table__label">{label}</span>
      </div>
      <div className="mission-table__surface">{children}</div>
      <span className="mission-table__scanline" aria-hidden />
    </div>
  )
}

interface BoardTableImageProps {
  src: string
  alt: string
  className?: string
}

export function BoardTableImage({ src, alt, className = '' }: BoardTableImageProps) {
  return (
    <BoardTableFrame className={className} label={alt}>
      <img src={src} alt={alt} className="mission-table__board" draggable={false} />
    </BoardTableFrame>
  )
}
