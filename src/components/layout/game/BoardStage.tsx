import type { ReactNode } from 'react'

interface BoardStageProps {
  children: ReactNode
}

export function BoardStage({ children }: BoardStageProps) {
  return <>{children}</>
}
