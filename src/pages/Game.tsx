import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { useMultiplayer, useHostActions } from '../hooks/useMultiplayer'
import { useTimer } from '../hooks/useTimer'
import { useBoardControls } from '../hooks/useBoardControls'
import { useGame } from '../hooks/useGame'
import { BoardView } from '../components/Board/BoardView'
import { CityCardPreview } from '../components/Modals/CityCardPreview'
import { RoleCardPreview } from '../components/Modals/RoleCardPreview'
import { CrisisModal } from '../components/Modals/CrisisModal'
import { GameEnd } from '../components/Modals/GameEnd'
import { GameShell } from '../components/layout/game/GameShell'
import { MissionHeader } from '../components/layout/game/MissionHeader'
import { PlayerRail } from '../components/layout/game/PlayerRail'
import { BoardStage } from '../components/layout/game/BoardStage'
import { MissionStatusPanel } from '../components/layout/game/MissionStatusPanel'
import { DiceHandBar } from '../components/game/DiceHandBar'
import { TimerExpiredOverlay } from '../components/Modals/TimerExpiredOverlay'
import { WasteRollOverlay } from '../components/Modals/WasteRollOverlay'
import { startGame, startGameLocal } from '../lib/firebase'
import { track } from '../lib/analytics'
import { assetManifest } from '../lib/assetManifest'
import type { PlayerView } from '../lib/engine/selectors'
import { Play, Copy } from 'lucide-react'
import { DIFFICULTY_CONFIG } from '../lib/constants'

export function GamePage() {
  const navigate = useNavigate()
  const roomCode = useGameStore((s) => s.roomCode)
  const status = useGameStore((s) => s.status)
  const lobbyPlayers = useGameStore((s) => s.lobbyPlayers)
  const playerId = useGameStore((s) => s.playerId)
  const settings = useGameStore((s) => s.settings)
  const modals = useGameStore((s) => s.modals)
  const snapshot = useGameStore((s) => s.snapshot)
  const localMode = useGameStore((s) => s.localMode)

  const controls = useBoardControls()
  const { playerViews } = useGame()

  useMultiplayer()
  useTimer()
  const { isHost } = useHostActions()

  const [previewCityId, setPreviewCityId] = useState<number | null>(null)
  const [previewPlayer, setPreviewPlayer] = useState<PlayerView | null>(null)
  const [codeCopied, setCodeCopied] = useState(false)

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
    track('game_started', {
      difficulty: settings.difficulty,
      player_count: lobbyPlayers.length,
    })
  }

  const copyCode = async () => {
    if (!roomCode) return
    await navigator.clipboard.writeText(roomCode)
    setCodeCopied(true)
    window.setTimeout(() => setCodeCopied(false), 2000)
  }

  if (!roomCode) return null

  if (status === 'lobby') {
    return (
      <div className="mission-waiting-room">
        <div className="mission-waiting-room__panel">
          <p className="mission-waiting-room__eyebrow">Mission Room</p>
          <h1 className="mission-waiting-room__title">Crew Briefing</h1>

          <div className="mission-waiting-room__launch-strip">
            <span className="mission-waiting-room__timer-chip">02:00</span>
            <span className="mission-waiting-room__badge mission-waiting-room__badge--online">
              {localMode ? 'Local mode' : 'Online'}
            </span>
          </div>

          <div className="mission-waiting-room__code-row">
            <span className="mission-waiting-room__code">{roomCode}</span>
            <button
              type="button"
              onClick={copyCode}
              aria-label="Copy room code"
              className={`mission-waiting-room__copy${codeCopied ? ' mission-waiting-room__copy--copied' : ''}`}
            >
              <Copy size={16} />
              {codeCopied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          <section className="mission-waiting-room__section">
            <h2>Connected crew</h2>
            <ul className="mission-waiting-room__crew mission-waiting-room__crew--cards">
              {lobbyPlayers.map((p) => (
                <li key={p.id} className="mission-waiting-room__crew-row">
                  <img
                    src={assetManifest.board.cityCardBack}
                    alt=""
                    className="mission-waiting-room__crew-back"
                    draggable={false}
                  />
                  <span>
                    {p.name}
                    {p.isHost && (
                      <span className="mission-waiting-room__badge mission-waiting-room__badge--host">
                        Host
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mission-waiting-room__roles-note">
              Roles are assigned randomly at launch — no role picker.
            </p>
          </section>

          <section className="mission-waiting-room__section">
            <h2>Mission settings</h2>
            <dl className="mission-waiting-room__settings">
              <div>
                <dt>Difficulty</dt>
                <dd>{DIFFICULTY_CONFIG[settings.difficulty].label}</dd>
              </div>
              <div>
                <dt>Crisis</dt>
                <dd>{settings.crisisEnabled ? 'On' : 'Off'}</dd>
              </div>
              <div>
                <dt>Timer</dt>
                <dd>2:00 continuous</dd>
              </div>
              <div>
                <dt>Crew size</dt>
                <dd>{lobbyPlayers.length} / 4</dd>
              </div>
            </dl>
          </section>

          <section className="mission-waiting-room__actions">
            {isHost ? (
              <button type="button" className="mission-waiting-room__start" onClick={handleStart}>
                <Play size={18} />
                Start Mission
              </button>
            ) : (
              <p className="mission-waiting-room__wait">Waiting for host to start mission…</p>
            )}
          </section>
        </div>
      </div>
    )
  }

  const activeName =
    snapshot?.players.find((p) => p.id === snapshot.activePlayerId)?.name ?? '—'

  return (
    <>
      <GameShell
        header={
          <MissionHeader
            roomCode={roomCode}
            activePlayer={activeName}
            turnStep={snapshot?.turnStep}
            difficulty={settings.difficulty}
            crisisEnabled={settings.crisisEnabled}
          />
        }
        rail={
          <PlayerRail
            players={playerViews}
            playerId={playerId}
            onRoleClick={setPreviewPlayer}
          />
        }
        board={
          <BoardStage onCityClick={setPreviewCityId}>
            <BoardView
              selectedDieIds={controls.selectedDieIds}
              selectedRoom={controls.selectedRoom}
              controlsFrozen={controls.controlsFrozen}
              onRoomClick={controls.handleRoomClick}
              onDieSlotClick={controls.handleDieSlotClick}
              onCityClick={setPreviewCityId}
              onFlyLeft={() => controls.handleFlyClick('left')}
              onFlyRight={() => controls.handleFlyClick('right')}
            />
          </BoardStage>
        }
        status={<MissionStatusPanel />}
        footer={
          <DiceHandBar
            selectedDieIds={controls.selectedDieIds}
            roleName={controls.roleName}
            playerName={controls.currentPlayer?.name}
            roleId={controls.currentPlayer?.role}
            playerId={playerId}
            controlsFrozen={controls.controlsFrozen}
            canAct={controls.canAct}
            turnStep={controls.turnStep}
            isMyTurn={controls.isMyTurn}
            rerollsRemaining={controls.rerollsRemaining}
            pendingConfirm={controls.pendingConfirm}
            dice={controls.selectableDice}
            onDieClick={controls.handleDieClick}
            onRoll={controls.rollDice}
            onRerollSelected={controls.handleRerollSelected}
            onEndTurn={controls.endTurn}
            onCancelSelection={controls.clearSelection}
            onConfirm={controls.confirmPending}
            onCancelConfirm={controls.cancelPending}
            onEngineerFlip={controls.handleEngineerFlip}
          />
        }
      />

      <TimerExpiredOverlay />
      <WasteRollOverlay />

      {previewCityId !== null && (
        <CityCardPreview cityId={previewCityId} onClose={() => setPreviewCityId(null)} />
      )}
      {previewPlayer && (
        <RoleCardPreview player={previewPlayer} onClose={() => setPreviewPlayer(null)} />
      )}
      {modals.crisis && <CrisisModal />}
      {modals.gameEnd && <GameEnd />}
    </>
  )
}
