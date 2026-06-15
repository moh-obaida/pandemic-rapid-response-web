import { Link, useLocation } from 'react-router-dom'
import { Footer } from './Footer'

const NAV = [
  { to: '/how-to-play', label: 'How to Play' },
  { to: '/rules', label: 'Rules' },
  { to: '/roles', label: 'Roles' },
  { to: '/faq', label: 'FAQ' },
  { to: '/about', label: 'About' },
]

interface SiteLayoutProps {
  children: React.ReactNode
}

export function SiteLayout({ children }: SiteLayoutProps) {
  const { pathname } = useLocation()

  return (
    <div className="site-page" style={{ display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px var(--gutter)',
          borderBottom: '1px solid var(--line)',
          position: 'sticky',
          top: 0,
          background: 'var(--bg-app)',
          zIndex: 40,
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <img src="/logos/prr-icon.svg" alt="" width={36} height={36} />
          <img src="/logos/prr-wordmark.svg" alt="Pandemic Rapid Response" height={24} />
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                fontWeight: pathname === item.to ? 600 : 400,
                color: pathname === item.to ? 'var(--text)' : 'var(--text-dim)',
                textDecoration: 'none',
              }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/play"
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: 14,
              padding: '8px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent)',
              color: '#fff',
              textDecoration: 'none',
            }}
          >
            Play Now
          </Link>
        </nav>
      </header>
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  )
}
