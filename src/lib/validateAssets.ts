import { allRequiredAssetPaths } from './assetManifest'

export interface AssetValidationResult {
  ok: boolean
  missing: string[]
  checked: number
}

/** HEAD-check each required asset URL. Run before gameplay UI mounts. */
export async function validateRequiredAssets(): Promise<AssetValidationResult> {
  const paths = allRequiredAssetPaths()
  const missing: string[] = []

  await Promise.all(
    paths.map(async (path) => {
      try {
        const res = await fetch(path, { method: 'HEAD' })
        if (!res.ok) missing.push(path)
      } catch {
        missing.push(path)
      }
    })
  )

  return {
    ok: missing.length === 0,
    missing: missing.sort(),
    checked: paths.length,
  }
}
