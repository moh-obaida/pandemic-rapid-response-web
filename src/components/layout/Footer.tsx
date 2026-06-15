import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--line)',
        padding: '32px var(--gutter)',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--content-max)',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 24,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <img src="/logos/prr-wordmark.svg" alt="PRR" height={28} />
          <p
            style={{
              fontSize: 12,
              color: 'var(--text-faint)',
              marginTop: 8,
              maxWidth: 320,
            }}
          >
            Fan-made online companion for Pandemic: Rapid Response. Not affiliated
            with Z-Man Games.
          </p>
        </div>
        <nav style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <FooterLink to="/rules">Rules</FooterLink>
          <FooterLink to="/roles">Roles</FooterLink>
          <FooterLink to="/faq">FAQ</FooterLink>
          <FooterLink to="/about">About</FooterLink>
          <FooterLink to="/privacy">Privacy</FooterLink>
          <a
            href="mailto:feedback@prr-game.com"
            style={{ color: 'var(--text-dim)', fontSize: 14, textDecoration: 'none' }}
          >
            Contact
          </a>
        </nav>
      </div>
    </footer>
  )
}

function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      style={{
        color: 'var(--text-dim)',
        fontSize: 14,
        textDecoration: 'none',
        fontFamily: 'var(--font-body)',
      }}
    >
      {children}
    </Link>
  )
}
