import { RotateCcw } from 'lucide-react'

interface RerollButtonsProps {
  rerollsRemaining: number
  canReroll: boolean
  onRerollAll: () => void
  disabled?: boolean
}

export function RerollButtons({
  rerollsRemaining,
  canReroll,
  onRerollAll,
  disabled,
}: RerollButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onRerollAll}
        disabled={!canReroll || disabled}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-body
          transition-colors
          ${canReroll && !disabled
            ? 'bg-surface border border-white/20 text-text hover:bg-white/10 cursor-pointer'
            : 'bg-surface/50 text-muted cursor-not-allowed opacity-50'
          }
        `}
        aria-label={`Reroll all dice, ${rerollsRemaining} remaining`}
      >
        <RotateCcw size={14} />
        Reroll ({rerollsRemaining})
      </button>
    </div>
  )
}
