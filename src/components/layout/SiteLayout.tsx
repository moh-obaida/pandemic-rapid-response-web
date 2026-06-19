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
          padding: '12px var(--gutter)',
          borderBottom: '2px solid var(--line)',
          position: 'sticky',
          top: 0,
          background: 'var(--bg-app)',
          zIndex: 40,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(26, 31, 42, 0.95)',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <img src="/logos/prr-icon.svg" alt="" width={38} height={38} />
          <img src="/logos/prr-wordmark.svg" alt="Pandemic Rapid Response" height={26} />
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                fontWeight: pathname === item.to ? 700 : 400,
                color: pathname === item.to ? 'var(--accent)' : 'var(--text-dim)',
                textDecoration: 'none',
                transition: 'color 200ms ease',
                borderBottom: pathname === item.to ? '2px solid var(--accent)' : 'none',
                paddingBottom: pathname === item.to ? '4px' : '6px',
              }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/play"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 14,
              padding: '10px 22px',
              borderRadius: '8px',
              background: 'var(--accent)',
              color: '#fff',
              textDecoration: 'none',
              transition: 'all 200ms ease',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)',
              letterSpacing: '0.02em',
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
