import { useEffect, useState } from 'react'
import { validateRequiredAssets } from '../lib/validateAssets'

interface AssetGateProps {
  children: React.ReactNode
  /** When false, skip validation (e.g. static marketing pages). */
  required?: boolean
}

export function AssetGate({ children, required = true }: AssetGateProps) {
  if (!required) {
    return <>{children}</>
  }

  return <AssetGateValidated>{children}</AssetGateValidated>
}

function AssetGateValidated({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<
    'loading' | 'ok' | { missing: string[]; checked: number }
  >('loading')

  useEffect(() => {
    let cancelled = false
    validateRequiredAssets().then((result) => {
      if (cancelled) return
      if (result.ok) setState('ok')
      else setState({ missing: result.missing, checked: result.checked })
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (state === 'loading') {
    return (
      <div className="asset-gate asset-gate--loading">
        <p className="asset-gate__title">Loading mission assets…</p>
      </div>
    )
  }

  if (state !== 'ok') {
    return (
      <div className="asset-gate asset-gate--error" data-testid="asset-gate-error">
        <h1 className="asset-gate__title">Missing required PRR assets</h1>
        <p className="asset-gate__lede">
          Gameplay requires all board, card, dice, crate, and token images under{' '}
          <code>public/assets/prr/</code>. {state.missing.length} of {state.checked}{' '}
          assets are missing.
        </p>
        <p className="asset-gate__hint">
          Run:{' '}
          <code>node scripts/copy-prr-assets.mjs && node scripts/reorganize-prr-assets.mjs</code>
        </p>
        <ul className="asset-gate__list">
          {state.missing.slice(0, 24).map((path) => (
            <li key={path}>
              <code>{path}</code>
            </li>
          ))}
          {state.missing.length > 24 && (
            <li>…and {state.missing.length - 24} more</li>
          )}
        </ul>
      </div>
    )
  }

  return <>{children}</>
}
