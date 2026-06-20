import { Link, useLocation } from 'react-router-dom'

const NAV = [
  { to: '/how-to-play', label: 'Mission Guide' },
  { to: '/roles', label: 'Crew Roles' },
  { to: '/cards', label: 'City Cards' },
  { to: '/rules', label: 'Mission Rules' },
  { to: '/about', label: 'About' },
] as const

export function WebsiteHeader() {
  const { pathname } = useLocation()

  return (
    <header className="site-header">
      <Link to="/" className="site-header__brand">
        <img src="/logos/prr-icon.svg" alt="" width={32} height={32} />
        <span className="site-header__brand-text">
          <span className="site-header__title">PRR Mission Control</span>
          <span className="site-header__subtitle">Rapid response mission board game</span>
        </span>
      </Link>

      <nav className="site-header__nav" aria-label="Site">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={[
              'site-header__link',
              pathname === item.to ? 'site-header__link--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="site-header__actions">
        <Link to="/play?join=1" className="site-header__join">
          Join Room
        </Link>
        <Link to="/play" className="site-header__cta">
          Start Mission
        </Link>
      </div>
    </header>
  )
}
