import type { ReactNode } from 'react'

interface GameShellProps {
  header: ReactNode
  rail: ReactNode
  board: ReactNode
  status: ReactNode
  flight: ReactNode
}

export function GameShell({ header, rail, board, status, flight }: GameShellProps) {
  return (
    <div className="game-viewport game-shell game-shell--portrait-hint select-none">
      <header className="game-shell__header">{header}</header>
      <aside className="game-shell__rail" aria-label="Players">{rail}</aside>
      <main className="game-shell__board" aria-label="Aircraft board">{board}</main>
      <aside className="game-shell__status" aria-label="Mission status">{status}</aside>
      <section className="game-shell__flight" aria-label="Flight path">{flight}</section>
    </div>
  )
}
