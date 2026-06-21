import { useEffect, useRef, useState } from 'react'
import type { DieFace } from '../../lib/constants/dice'
import { DICE_FACES } from '../../lib/constants/dice'
import { dieImagePath } from '../../lib/assetManifest'
import { DICE_FACE_FLICKER_MS } from '../../lib/diceRollAnimation'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

interface DieProps {
  face: DieFace
  size?: number
  selected?: boolean
  locked?: boolean
  rolling?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const FACE_LABELS: Record<DieFace, string> = {
  plane: 'Plane',
  water: 'Water',
  food: 'Food',
  power: 'Power',
  vaccine: 'Vaccine',
  firstAid: 'First Aid',
}

export function Die({
  face: finalFace,
  size = 52,
  selected = false,
  locked = false,
  rolling = false,
  onClick,
}: DieProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const isAnimating = rolling && !prefersReducedMotion
  const [displayFace, setDisplayFace] = useState<DieFace>(finalFace)
  const [settled, setSettled] = useState(false)
  const wasRollingRef = useRef(false)

  useEffect(() => {
    if (!isAnimating) {
      setDisplayFace(finalFace)
      return
    }

    const interval = window.setInterval(() => {
      const randomFace = DICE_FACES[Math.floor(Math.random() * DICE_FACES.length)]
      setDisplayFace(randomFace)
    }, DICE_FACE_FLICKER_MS)

    return () => window.clearInterval(interval)
  }, [isAnimating, finalFace])

  useEffect(() => {
    if (!isAnimating) {
      setDisplayFace(finalFace)
    }
  }, [finalFace, isAnimating])

  useEffect(() => {
    if (wasRollingRef.current && !isAnimating) {
      setSettled(true)
      const timer = window.setTimeout(() => setSettled(false), 280)
      wasRollingRef.current = false
      return () => window.clearTimeout(timer)
    }
    wasRollingRef.current = isAnimating
  }, [isAnimating])

  const src = dieImagePath(displayFace)

  return (
    <button
      type="button"
      onClick={locked || isAnimating ? undefined : onClick}
      disabled={locked || isAnimating}
      aria-label={`${FACE_LABELS[finalFace]} die${locked ? ', locked' : ''}${selected ? ', selected' : ''}${isAnimating ? ', rolling' : ''}`}
      aria-pressed={selected}
      className={[
        'game-die',
        selected && !isAnimating ? 'game-die--selected' : '',
        locked ? 'game-die--locked' : '',
        isAnimating ? 'game-die--rolling' : '',
        settled ? 'game-die--settled' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width: size, height: size }}
      data-die-face={finalFace}
    >
      <img
        src={src}
        alt=""
        className="game-die__img"
        width={size}
        height={size}
        draggable={false}
      />
    </button>
  )
}
