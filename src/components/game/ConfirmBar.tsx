import { Button } from '../ds/Button'
import type { PendingConfirm } from '../../types/controls'

interface ConfirmBarProps {
  pending: PendingConfirm | null
  onConfirm: () => void
  onCancel: () => void
}

function confirmButtonLabel(pending: PendingConfirm): string {
  switch (pending.type) {
    case 'move':
      return 'Confirm Move'
    case 'fly':
      return 'Confirm Fly'
    case 'assign':
      return 'Confirm Assignment'
    case 'activate':
      return 'Activate Room'
    case 'engineerFlip':
      return 'Confirm Flip'
    default:
      return 'Confirm'
  }
}

export function ConfirmBar({ pending, onConfirm, onCancel }: ConfirmBarProps) {
  if (!pending) return null

  return (
    <div className="confirm-bar" role="dialog" aria-label="Confirm action">
      <p className="confirm-bar__label">{pending.label}</p>
      <div className="confirm-bar__actions">
        <Button size="sm" onClick={onConfirm} data-testid="confirm-action">
          {confirmButtonLabel(pending)}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} data-testid="confirm-cancel">
          Cancel
        </Button>
      </div>
    </div>
  )
}
