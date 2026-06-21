import { useEffect, useState } from 'react'
import { RotateCw, X } from 'lucide-react'
import { Button } from '../../ds/Button'

function isPortraitMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth <= 768 && window.innerHeight > window.innerWidth
}

/** Full-screen prompt when the mission table is too cramped in portrait. */
export function PortraitRotatePrompt() {
  const [visible, setVisible] = useState(isPortraitMobile)

  useEffect(() => {
    const onResize = () => setVisible(isPortraitMobile())
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [])

  useEffect(() => {
    if (!visible) return
    const timer = window.setTimeout(() => setVisible(false), 8000)
    return () => window.clearTimeout(timer)
  }, [visible])

  if (!visible) return null

  return (
    <div className="portrait-prompt" role="dialog" aria-labelledby="portrait-prompt-title">
      <div className="portrait-prompt__panel">
        <button
          type="button"
          className="portrait-prompt__close"
          onClick={() => setVisible(false)}
          aria-label="Dismiss rotate prompt"
        >
          <X size={18} />
        </button>
        <RotateCw size={32} className="portrait-prompt__icon" aria-hidden />
        <h2 id="portrait-prompt-title" className="portrait-prompt__title">
          Rotate for mission control
        </h2>
        <p className="portrait-prompt__desc">
          PRR is designed for landscape. Turn your device sideways for the full aircraft command
          table.
        </p>
        <Button variant="secondary" size="sm" onClick={() => setVisible(false)}>
          Continue anyway
        </Button>
      </div>
    </div>
  )
}
