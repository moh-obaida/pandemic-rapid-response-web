export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header style={{ padding: '48px var(--gutter) 24px', maxWidth: 'var(--content-max)', margin: '0 auto' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: 40,
          color: 'var(--text)',
          margin: 0,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p style={{ fontSize: 16, color: 'var(--text-dim)', marginTop: 8 }}>{subtitle}</p>
      )}
    </header>
  )
}
