import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROLES, DIFFICULTY_CONFIG } from '../../lib/constants'
import type { RoleId } from '../../types/board'
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
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  marginTop: 4,
  padding: '10px 12px',
  borderRadius: 'var(--radius-md)',
  background: 'var(--bg-900)',
  border: '1px solid var(--line)',
  color: 'var(--text)',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
}

export function LobbyModal({ onGameStart }: LobbyModalProps) {
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu')
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [role, setRole] = useState<RoleId>('analyst')
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
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
      }
      const { code, playerId } = useLocal
        ? await createRoomLocal(name.trim(), settings, role)
        : await createRoom(name.trim(), settings, role)
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
        ? await joinRoomLocal(roomCode.trim().toUpperCase(), name.trim(), role)
        : await joinRoom(roomCode.trim().toUpperCase(), name.trim(), role)
      setRoom(roomCode.trim().toUpperCase(), playerId)
      setPlayerName(name.trim())
      track('room_joined', { role })
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-app)',
        padding: 24,
      }}
    >
      <Panel style={{ width: 520, boxShadow: 'var(--shadow-modal)' }} padding={32}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/">
            <img src="/logos/prr-full.svg" alt="PRR" style={{ height: 48, marginBottom: 12 }} />
          </Link>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Button full size="lg" icon={<Plus size={18} />} onClick={() => setMode('create')}>
              Create Room
            </Button>
            <Button full size="lg" variant="secondary" icon={<LogIn size={18} />} onClick={() => setMode('join')}>
              Join Room
            </Button>
          </div>
        )}

        {(mode === 'create' || mode === 'join') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label>
              <span className="ds-label">Your Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                placeholder="Commander"
                maxLength={20}
              />
            </label>

            {mode === 'join' && (
              <label>
                <span className="ds-label">Room Code</span>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  style={{ ...inputStyle, fontFamily: 'var(--font-mono)', letterSpacing: '0.2em' }}
                  placeholder="ABC123"
                  maxLength={6}
                />
              </label>
            )}

            <div>
              <span className="ds-label">Role</span>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 4,
                  marginTop: 4,
                  maxHeight: 160,
                  overflowY: 'auto',
                }}
              >
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    style={{
                      padding: '8px',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'left',
                      fontSize: 12,
                      cursor: 'pointer',
                      background: role === r.id ? 'var(--accent-soft)' : 'var(--bg-900)',
                      border: role === r.id ? '1px solid var(--accent)' : '1px solid var(--line-soft)',
                      color: 'var(--text-dim)',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{r.name}</div>
                    <div style={{ fontSize: 10, opacity: 0.8 }}>{r.ability}</div>
                  </button>
                ))}
              </div>
            </div>

            {mode === 'create' && (
              <div>
                <span className="ds-label">Difficulty</span>
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 12,
                        cursor: 'pointer',
                        background: difficulty === d ? 'var(--accent)' : 'var(--bg-900)',
                        color: difficulty === d ? '#fff' : 'var(--text-dim)',
                        border: '1px solid var(--line-soft)',
                      }}
                    >
                      {DIFFICULTY_CONFIG[d].label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p style={{ color: 'var(--error)', fontSize: 14, margin: 0 }}>{error}</p>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" onClick={() => setMode('menu')}>
                Back
              </Button>
              <Button
                full
                onClick={mode === 'create' ? handleCreate : handleJoin}
                disabled={loading}
                icon={<Users size={14} />}
              >
                {loading ? 'Connecting...' : mode === 'create' ? 'Create & Enter' : 'Join Game'}
              </Button>
            </div>
          </div>
        )}
      </Panel>
    </div>
  )
}
