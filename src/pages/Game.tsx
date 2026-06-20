import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { useGame } from '../hooks/useGame'
import { useMultiplayer, useHostActions } from '../hooks/useMultiplayer'
import { useTimer } from '../hooks/useTimer'
import { PlaneBoard } from '../components/Board/PlaneBoard'
import { ActionPanel } from '../components/Actions/ActionPanel'
import { RoomActivation } from '../components/Modals/RoomActivation'
import { CrisisModal } from '../components/Modals/CrisisModal'
import { GameEnd } from '../components/Modals/GameEnd'
import { GameShell } from '../components/layout/game/GameShell'
import { MissionHeader } from '../components/layout/game/MissionHeader'
import { PlayerRail } from '../components/layout/game/PlayerRail'
import { BoardStage } from '../components/layout/game/BoardStage'
import { MissionStatusPanel } from '../components/layout/game/MissionStatusPanel'
import { FlightPathDock } from '../components/layout/game/FlightPathDock'
import { startGame, startGameLocal } from '../lib/firebase'
import { track } from '../lib/analytics'
import type { RoomId } from '../types/board'
import { Play, Copy } from 'lucide-react'
import { DIFFICULTY_CONFIG } from '../lib/constants'

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
    <>
      <GameShell
        header={
          <MissionHeader
            roomCode={roomCode}
            round={round}
            difficulty={settings.difficulty}
          />
        }
        rail={
          <PlayerRail
            players={players}
            playerId={playerId}
            selectedDieId={selectedDieId}
            onDieClick={handleDieClick}
          />
        }
        board={
          <BoardStage>
            <PlaneBoard
              onRoomClick={handleRoomClick}
              selectedRoom={selectedRoom}
            />
            <ActionPanel />
          </BoardStage>
        }
        status={<MissionStatusPanel />}
        flight={<FlightPathDock onDeliver={deliver} />}
      />

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
    </>
  )
}
