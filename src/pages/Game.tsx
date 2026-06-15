import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { useGame } from '../hooks/useGame'
import { useMultiplayer, useHostActions } from '../hooks/useMultiplayer'
import { useTimer } from '../hooks/useTimer'
import { PlaneBoard } from '../components/Board/PlaneBoard'
import { Flightpath } from '../components/Board/Flightpath'
import { WasteTrack } from '../components/Board/WasteTrack'
import { TimeTokens } from '../components/Board/TimeTokens'
import { TurnTimer } from '../components/Board/TurnTimer'
import { CrisisDisplay } from '../components/Board/CrisisDisplay'
import { PlayerSeat } from '../components/Players/PlayerSeat'
import { ActionPanel } from '../components/Actions/ActionPanel'
import { RoomActivation } from '../components/Modals/RoomActivation'
import { CrisisModal } from '../components/Modals/CrisisModal'
import { GameEnd } from '../components/Modals/GameEnd'
import { startGame, startGameLocal } from '../lib/firebase'
import { track } from '../lib/analytics'
import type { Corner } from '../types/ui'
import type { RoomId } from '../types/board'
import { Play, Copy } from 'lucide-react'
import { DIFFICULTY_CONFIG } from '../lib/constants'

const CORNERS: Corner[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
]

export function GamePage() {
  const navigate = useNavigate()
  const roomCode = useGameStore((s) => s.roomCode)
  const status = useGameStore((s) => s.status)
  const players = useGameStore((s) => s.players)
  const playerId = useGameStore((s) => s.playerId)
  const settings = useGameStore((s) => s.settings)
  const round = useGameStore((s) => s.gameState.round)
  const selectedDieId = useGameStore((s) => s.selectedDieId)
  const modals = useGameStore((s) => s.modals)

  const {
    selectDie,
    selectRoom,
    selectedRoom,
    assignDice,
    activateRoom,
    deliver,
    localMode,
  } = useGame()

  useMultiplayer()
  useTimer()
  const { isHost } = useHostActions()

  const [activationRoom, setActivationRoom] = useState<RoomId | null>(null)

  useEffect(() => {
    if (!roomCode) navigate('/play')
  }, [roomCode, navigate])

  const handleStart = async () => {
    if (!roomCode) return
    if (localMode) {
      await startGameLocal(roomCode)
    } else {
      await startGame(roomCode)
    }
    track('game_started', { difficulty: settings.difficulty, player_count: players.length })
  }

  const handleRoomClick = (roomId: RoomId) => {
    if (selectedDieId) {
      assignDice(selectedDieId, roomId)
      selectRoom(null)
    } else {
      selectRoom(roomId)
      setActivationRoom(roomId)
    }
  }

  const handleDieClick = (dieId: string) => {
    selectDie(selectedDieId === dieId ? null : dieId)
  }

  const copyCode = () => {
    if (roomCode) navigator.clipboard.writeText(roomCode)
  }

  if (!roomCode) return null

  if (status === 'lobby') {
    return (
      <div className="game-viewport flex flex-col items-center justify-center bg-canvas">
        <div className="w-[480px] rounded-2xl bg-surface border border-white/10 p-8">
          <h2 className="font-display font-bold text-2xl text-text mb-2 text-center">
            Waiting Room
          </h2>
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="font-mono text-2xl tracking-widest text-primary">
              {roomCode}
            </span>
            <button type="button" onClick={copyCode} aria-label="Copy room code">
              <Copy size={16} className="text-muted hover:text-text" />
            </button>
          </div>

          <p className="text-center text-sm text-muted font-body mb-4">
            {DIFFICULTY_CONFIG[settings.difficulty].label} ·{' '}
            {players.length}/{settings.maxPlayers} players
          </p>

          <div className="space-y-2 mb-6">
            {players.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-canvas"
              >
                <span className="font-body text-sm text-text">
                  {p.name}
                  {p.isHost && ' (Host)'}
                </span>
                <span className="text-xs text-muted capitalize">
                  {p.role.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
            ))}
          </div>

          {isHost ? (
            <button
              type="button"
              onClick={handleStart}
              disabled={players.length < 1}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-body font-medium hover:bg-primary/80 disabled:opacity-50"
            >
              <Play size={18} />
              Start Game
            </button>
          ) : (
            <p className="text-center text-muted font-body text-sm">
              Waiting for host to start...
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="game-viewport relative bg-canvas overflow-hidden select-none">
      <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 z-10">
        <div className="flex items-center gap-3">
          <h1 className="font-display font-bold text-sm text-text">
            PRR Online
          </h1>
          <span className="font-mono text-xs text-primary tracking-wider">
            {roomCode}
          </span>
        </div>
        <div className="text-xs text-muted font-body">
          Round {round} · {DIFFICULTY_CONFIG[settings.difficulty].label}
        </div>
      </header>

      {players.slice(0, 4).map((player, i) => (
        <PlayerSeat
          key={player.id}
          player={player}
          corner={CORNERS[i]}
          isSelf={player.id === playerId}
          selectedDieId={selectedDieId}
          onDieClick={handleDieClick}
        />
      ))}

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
        <PlaneBoard
          onRoomClick={handleRoomClick}
          selectedRoom={selectedRoom}
        />
        <ActionPanel />
      </div>

      <div className="absolute bottom-14 left-4 right-4">
        <Flightpath onDeliver={deliver} />
      </div>

      <footer className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 py-3 bg-surface/90 border-t border-white/10">
        <WasteTrack />
        <TurnTimer />
        <TimeTokens />
        <CrisisDisplay />
      </footer>

      {activationRoom && (
        <RoomActivation
          roomId={activationRoom}
          onConfirm={() => {
            activateRoom(activationRoom)
            setActivationRoom(null)
          }}
          onClose={() => setActivationRoom(null)}
        />
      )}
      {modals.crisis && <CrisisModal />}
      {modals.gameEnd && <GameEnd />}
    </div>
  )
}
