import type { ReactNode } from 'react'

interface DocSectionProps {
  title: string
  children: ReactNode
}

export function DocSection({ title, children }: DocSectionProps) {
  return (
    <section className="mission-doc-section">
      <h2 className="mission-doc-section__title">{title}</h2>
      <div className="mission-doc-section__body">{children}</div>
    </section>
  )
}
