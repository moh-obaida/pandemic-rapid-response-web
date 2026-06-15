interface WasteMarkerProps {
  position: number
  max: number
}

export function WasteMarker({ position, max }: WasteMarkerProps) {
  const pct = Math.min(100, (position / max) * 100)
  const isDanger = pct >= 75

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 transition-all duration-150 animate-waste-slide"
      style={{ left: `calc(${pct}% - 8px)` }}
      aria-label={`Waste level ${position} of ${max}`}
    >
      <div
        className="w-4 h-4 rounded-full border-2 border-white"
        style={{ backgroundColor: isDanger ? '#F44336' : '#FF9800' }}
      />
    </div>
  )
}
