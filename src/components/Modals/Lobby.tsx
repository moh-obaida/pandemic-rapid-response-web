import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DIFFICULTY_CONFIG } from '../../lib/constants'
import type { Difficulty } from '../../types/game'
import {
  isFirebaseConfigured,
  createRoom,
  joinRoom,
  createRoomLocal,
  joinRoomLocal,
} from '../../lib/firebase'
import { canCreateRoom } from '../../lib/rateLimit'
import { track } from '../../lib/analytics'
import { useGameStore } from '../../store/gameStore'
import { Button } from '../ds/Button'
import { Panel } from '../ds/Panel'
import { Badge } from '../ds/Badge'
import { Users, Plus, LogIn, Wifi, WifiOff } from 'lucide-react'

interface LobbyModalProps {
  onGameStart: () => void
  initialMode?: 'menu' | 'create' | 'join'
}

export function LobbyModal({ onGameStart, initialMode = 'menu' }: LobbyModalProps) {
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>(initialMode)
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const [crisisEnabled, setCrisisEnabled] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const setRoom = useGameStore((s) => s.setRoom)
  const setPlayerName = useGameStore((s) => s.setPlayerName)
  const setLocalMode = useGameStore((s) => s.setLocalMode)
  const firebaseReady = isFirebaseConfigured()

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Enter your callsign')
      return
    }
    if (!canCreateRoom()) {
      setError('Room creation limit reached. Try again in an hour.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const useLocal = !firebaseReady
      setLocalMode(useLocal)
      const settings = {
        difficulty,
        aiReplacement: false,
        maxPlayers: 4,
        crisisEnabled,
      }
      const { code, playerId } = useLocal
        ? await createRoomLocal(name.trim(), settings)
        : await createRoom(name.trim(), settings)
      setRoom(code, playerId)
      setPlayerName(name.trim())
      track('room_created', { difficulty, player_count: 1 })
      onGameStart()
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message === 'Room not found'
            ? 'Room not found — check the code'
            : e.message
          : 'Connection failed. Retrying may help.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!name.trim() || !roomCode.trim()) {
      setError('Enter name and room code')
      return
    }
    setLoading(true)
    setError('')
    try {
      const useLocal = !firebaseReady
      setLocalMode(useLocal)
      const playerId = useLocal
        ? await joinRoomLocal(roomCode.trim().toUpperCase(), name.trim())
        : await joinRoom(roomCode.trim().toUpperCase(), name.trim())
      setRoom(roomCode.trim().toUpperCase(), playerId)
      setPlayerName(name.trim())
      track('room_joined', {})
      onGameStart()
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      if (msg.includes('full')) setError('Room is full — max 4 players')
      else if (msg.includes('not found')) setError('Room not found — check the code')
      else if (msg.includes('already started')) setError('Game already in progress')
      else setError('Connection lost. Check network and retry.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mission-room" data-testid="lobby-room">
      <Panel className="mission-room__panel glass-panel glass-panel--accent-top" padding={32}>
        <div className="mission-room__header">
          <Link to="/">
            <img src="/logos/prr-full.svg" alt="Pandemic Rapid Response" style={{ height: 44 }} />
          </Link>
          <h1 className="mission-room__title">Mission Room Access</h1>
          <p className="mission-room__subtitle">Create or join a private crew briefing</p>
          <div className="mission-room__badge-row">
            {firebaseReady ? (
              <Badge tone="valid">
                <Wifi size={12} /> Online Ready
              </Badge>
            ) : (
              <Badge tone="active">
                <WifiOff size={12} /> Local Mode
              </Badge>
            )}
          </div>
        </div>

        {mode === 'menu' && (
          <div className="mission-room__stack">
            <Button full size="lg" icon={<Plus size={18} />} onClick={() => setMode('create')}>
              Start Mission
            </Button>
            <Button full size="lg" variant="secondary" icon={<LogIn size={18} />} onClick={() => setMode('join')}>
              Join Room
            </Button>
          </div>
        )}

        {(mode === 'create' || mode === 'join') && (
          <div className="mission-room__stack">
            <label className="mission-room__field">
              <span className="ds-label">Your callsign</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mission-room__input"
                placeholder="Commander"
                maxLength={20}
                data-testid="lobby-callsign-input"
              />
            </label>

            {mode === 'join' && (
              <label className="mission-room__field">
                <span className="ds-label">Room code</span>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="mission-room__input mission-room__input--code"
                  placeholder="ABC123"
                  maxLength={6}
                  data-testid="lobby-room-code-input"
                />
              </label>
            )}

            {mode === 'create' && (
              <>
                <div className="mission-room__field">
                  <span className="ds-label">Difficulty</span>
                  <div className="mission-room__diff-grid">
                    {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDifficulty(d)}
                        className={[
                          'mission-room__diff-btn',
                          difficulty === d ? 'mission-room__diff-btn--active' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {DIFFICULTY_CONFIG[d].label}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="mission-room__checkbox-row">
                  <input
                    type="checkbox"
                    checked={crisisEnabled}
                    onChange={(e) => setCrisisEnabled(e.target.checked)}
                  />
                  <span className="ds-label" style={{ margin: 0 }}>
                    Crisis cards enabled
                  </span>
                </label>
                <p className="mission-room__note">
                  All 7 crew roles are assigned randomly when the mission starts.
                </p>
              </>
            )}

            {error && <p className="mission-room__error">{error}</p>}

            <div className="mission-room__actions">
              <Button variant="ghost" onClick={() => setMode('menu')}>
                Back
              </Button>
              <Button
                full
                onClick={mode === 'create' ? handleCreate : handleJoin}
                disabled={loading}
                icon={<Users size={14} />}
                data-testid={mode === 'create' ? 'lobby-create-submit' : 'lobby-join-submit'}
              >
                {loading ? 'Connecting…' : mode === 'create' ? 'Create Room' : 'Join with Code'}
              </Button>
            </div>
          </div>
        )}
      </Panel>
    </div>
  )
}
