import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="mission-footer">
      <div className="mission-footer__inner">
        <div>
          <img src="/logos/prr-wordmark.svg" alt="PRR" height={26} />
          <p className="mission-footer__note">
            Private fan prototype for playing Pandemic: Rapid Response online with friends. Not
            affiliated with Z-Man Games or any official publisher.
          </p>
        </div>
        <nav className="mission-footer__links">
          <FooterLink to="/rules">Rules</FooterLink>
          <FooterLink to="/roles">Roles</FooterLink>
          <FooterLink to="/how-to-play">How to Play</FooterLink>
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
