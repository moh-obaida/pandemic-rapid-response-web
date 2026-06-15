import { useGameStore } from '../../store/gameStore'
import { WasteTrack as DSWasteTrack } from '../ds/WasteTrack'
import { Tooltip } from '../layout/Tooltip'

export function WasteTrack() {
  const waste = useGameStore((s) => s.gameState.waste)
  const wasteMax = useGameStore((s) => s.gameState.wasteMax)

  return (
    <Tooltip content="Waste rises from unmatched dice. If waste reaches END, mission fails">
      <DSWasteTrack value={waste} max={wasteMax} />
    </Tooltip>
  )
}
