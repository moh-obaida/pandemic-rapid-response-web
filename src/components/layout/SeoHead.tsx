import { useEffect } from 'react'

interface SeoHeadProps {
  title: string
  description: string
  path?: string
}

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://prr-game.com'

export function SeoHead({ title, description, path = '' }: SeoHeadProps) {
  useEffect(() => {
    document.title = `${title} | PRR Online`
    const desc = document.querySelector('meta[name="description"]')
    if (desc) desc.setAttribute('content', description)
    else {
      const m = document.createElement('meta')
      m.name = 'description'
      m.content = description
      document.head.appendChild(m)
    }
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', title)
    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.setAttribute('content', description)
    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl) ogUrl.setAttribute('content', `${SITE_URL}${path}`)
  }, [title, description, path])

  return null
}
