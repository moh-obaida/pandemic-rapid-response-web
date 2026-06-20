import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ROLES } from '../../lib/constants'
import { assetManifest } from '../../lib/assetManifest'

export function RoleDeckShowcase() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = ROLES[selectedIndex]

  return (
    <div className="role-deck">
      <div className="role-deck__stage" role="listbox" aria-label="Crew roles">
        {ROLES.map((role, index) => {
          const offset = index - selectedIndex
          const isActive = index === selectedIndex
          return (
            <button
              key={role.id}
              type="button"
              role="option"
              aria-selected={isActive}
              className={[
                'role-deck__card',
                isActive ? 'role-deck__card--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={
                {
                  '--deck-offset': offset,
                  '--deck-abs': Math.abs(offset),
                } as CSSProperties
              }
              onClick={() => setSelectedIndex(index)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <img
                src={assetManifest.cards.roles[role.id]}
                alt={role.name}
                className="role-deck__img"
                draggable={false}
              />
            </button>
          )
        })}
      </div>
      <div className="role-deck__info glass-panel">
        <p className="role-deck__eyebrow">Assigned at launch</p>
        <h3 className="role-deck__name">{selected.name}</h3>
        <p className="role-deck__ability">{selected.ability}</p>
        <Link to="/roles" className="role-deck__link">
          View all crew roles →
        </Link>
      </div>
    </div>
  )
}
