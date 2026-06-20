import { Footer } from './Footer'
import { WebsiteHeader } from './WebsiteHeader'

interface SiteLayoutProps {
  children: React.ReactNode
}

export function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="site-page">
      <WebsiteHeader />
      <main className="site-page__main">{children}</main>
      <Footer />
    </div>
  )
}
