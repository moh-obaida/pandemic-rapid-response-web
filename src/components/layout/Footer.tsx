import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="mission-footer">
      <div className="mission-footer__inner">
        <div className="mission-footer__brand">
          <Link to="/" className="mission-footer__brand-link">
            <img src="/logos/prr-icon.svg" alt="" width={28} height={28} />
            <span>
              <span className="mission-footer__title">PRR Mission Control</span>
              <span className="mission-footer__tagline">Rapid response mission board game</span>
            </span>
          </Link>
          <p className="mission-footer__note">
            Private fan prototype — not affiliated with Z-Man Games or any official publisher.
          </p>
        </div>
        <nav className="mission-footer__links" aria-label="Footer">
          <FooterLink to="/how-to-play">Mission Guide</FooterLink>
          <FooterLink to="/roles">Crew Roles</FooterLink>
          <FooterLink to="/cards">City Cards</FooterLink>
          <FooterLink to="/rules">Mission Rules</FooterLink>
          <FooterLink to="/about">About</FooterLink>
          <FooterLink to="/privacy">Privacy</FooterLink>
        </nav>
      </div>
    </footer>
  )
}

function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="mission-footer__link">
      {children}
    </Link>
  )
}
