import { Footer } from './Footer'
import { WebsiteHeader } from './WebsiteHeader'

interface SiteLayoutProps {
  children: React.ReactNode
}

export function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="site-page" style={{ display: 'flex', flexDirection: 'column' }}>
      <WebsiteHeader />
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>{children}</main>
      <Footer />
    </div>
  )
}
