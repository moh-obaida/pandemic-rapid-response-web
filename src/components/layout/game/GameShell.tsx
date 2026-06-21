import type { ReactNode } from 'react'

interface GameShellProps {
  header: ReactNode
  rail: ReactNode
  board: ReactNode
  status: ReactNode
  footer: ReactNode
}

/** 16:9 aircraft command layout — board dominant, no page scroll. */
export function GameShell({ header, rail, board, status, footer }: GameShellProps) {
  return (
    <div className="game-viewport game-shell game-shell--command-table select-none" data-testid="game-shell">
      <div className="game-shell__ambient" aria-hidden />
      <header className="game-shell__header">{header}</header>
      <aside className="game-shell__rail" aria-label="Crew">{rail}</aside>
      <main className="game-shell__board" aria-label="Board stage">{board}</main>
      <aside className="game-shell__status" aria-label="Mission instruments">{status}</aside>
      <footer className="game-shell__footer" aria-label="Active player dock">{footer}</footer>
    </div>
  )
}
