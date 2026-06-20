interface PageHeaderProps {
  title: string
  subtitle?: string
  eyebrow?: string
}

export function PageHeader({ title, subtitle, eyebrow }: PageHeaderProps) {
  return (
    <header className="mission-page-header">
      {eyebrow && <p className="mission-page-header__eyebrow">{eyebrow}</p>}
      <h1 className="mission-page-header__title">{title}</h1>
      {subtitle && <p className="mission-page-header__subtitle">{subtitle}</p>}
    </header>
  )
}
