type EventName =
  | 'room_created'
  | 'room_joined'
  | 'game_started'
  | 'game_ended'
  | 'role_selected'
  | 'crisis_drawn'
  | 'player_disconnected'

type EventParams = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function track(event: EventName, params?: EventParams): void {
  if (import.meta.env.DEV) {
    console.debug('[analytics]', event, params)
  }
  if (typeof window.gtag === 'function' && import.meta.env.VITE_GA_ID) {
    window.gtag('event', event, params)
  }
}

export function initAnalytics(): void {
  const id = import.meta.env.VITE_GA_ID
  if (!id || typeof document === 'undefined') return
  if (document.getElementById('ga-script')) return

  const script = document.createElement('script')
  script.id = 'ga-script'
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
  document.head.appendChild(script)

  window.gtag = function gtag(...args: unknown[]) {
    ;(window as unknown as { dataLayer: unknown[] }).dataLayer =
      (window as unknown as { dataLayer?: unknown[] }).dataLayer || []
    ;(window as unknown as { dataLayer: unknown[] }).dataLayer.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', id, { anonymize_ip: true })
}
