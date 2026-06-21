import { useCallback } from 'react'
import { useGameStore, isHost } from '../store/gameStore'
import {
  getCurrentPlayerView,
  getPlayerViews,
  getSelectableDice,
} from '../lib/engine/selectors'
import { getRerollsRemaining } from '../lib/engine/getLegalActions'
import { getRerollsMax } from '../lib/engine/setup'
import type { RoomId } from '../types/board'
import type { DieFace } from '../lib/constants/dice'
import {
  isFirebaseConfigured,
  syncSnapshot,
  syncSnapshotLocal,
  submitPendingAction,
} from '../lib/firebase'
import { track } from '../lib/analytics'
import { friendlyError } from '../lib/userErrors'

export function useGame() {
  const store = useGameStore()
  const snapshot = store.snapshot
  const playerId = store.playerId
  const currentPlayer = snapshot && playerId
    ? getCurrentPlayerView(snapshot, playerId)
    : undefined
  const playerViews = snapshot ? getPlayerViews(snapshot) : []

  const syncAfterDispatch = useCallback(async () => {
    const { roomCode, localMode, snapshot: snap, status } = useGameStore.getState()
    if (!roomCode || !snap || status !== 'playing') return
    if (localMode) {
      await syncSnapshotLocal(roomCode, snap)
    } else if (isHost()) {
      await syncSnapshot(roomCode, snap)
    }
  }, [])

  const dispatchAndSync = useCallback(
    async (action: Parameters<typeof store.dispatch>[0]) => {
      const { roomCode, localMode, playerId: pid, setActionPending } = useGameStore.getState()

      setActionPending(true)
      try {
        if (!localMode && isFirebaseConfigured() && !isHost()) {
          if (!roomCode || !pid) return null
          await submitPendingAction(roomCode, pid, action)
          return null
        }

        const result = store.dispatch(action)
        if (result) {
          await syncAfterDispatch()
          if (result.result) {
            track('game_ended', {
              result: result.result,
              waste: result.waste,
              cities_delivered: result.cities.filter((c) => c.status === 'delivered')
                .length,
            })
          }
        }
        return result
      } catch (e) {
        useGameStore.setState({
          lastError: friendlyError(
            e instanceof Error ? e.message : 'Connection failed. Try again.'
          ),
        })
        return null
      } finally {
        useGameStore.getState().setActionPending(false)
      }
    },
    [store, syncAfterDispatch]
  )

  const rollDice = useCallback(async () => {
    if (!playerId) return
    await dispatchAndSync({ type: 'ROLL_DICE', playerId })
  }, [playerId, dispatchAndSync])

  const assignDie = useCallback(
    async (dieId: string, roomId: RoomId, slotIndex: number) => {
      if (!playerId) return
      await dispatchAndSync({
        type: 'ASSIGN_DIE',
        playerId,
        dieId,
        roomId,
        slotIndex,
      })
      store.clearSelection()
    },
    [playerId, dispatchAndSync, store]
  )

  const assignDiceGroup = useCallback(
    async (dieIds: string[], roomId: RoomId, startSlot: number) => {
      if (!playerId) return
      if (dieIds.length === 1) {
        await assignDie(dieIds[0], roomId, startSlot)
        return
      }
      await dispatchAndSync({
        type: 'ASSIGN_DICE_GROUP',
        playerId,
        roomId,
        dieIds,
        startSlot,
      })
      store.clearSelection()
    },
    [playerId, dispatchAndSync, store, assignDie]
  )

  const resolveWasteRollAction = useCallback(
    async (dieRolls: Record<string, import('../lib/constants/dice').DieFace>, excludedDieId?: string) => {
      await dispatchAndSync({ type: 'RESOLVE_WASTE_ROLL', dieRolls, excludedDieId })
    },
    [dispatchAndSync]
  )

  const assignDieToFirstSlot = useCallback(
    async (dieId: string, roomId: RoomId) => {
      const snap = useGameStore.getState().snapshot
      if (!snap) return
      const slots = snap.roomSlots[roomId] ?? []
      const slotIndex = slots.findIndex((s) => s === null)
      if (slotIndex === -1) return
      await assignDie(dieId, roomId, slotIndex)
    },
    [assignDie]
  )

  const activateRoomAction = useCallback(
    async (roomId: RoomId) => {
      if (!playerId) return
      await dispatchAndSync({ type: 'ACTIVATE_ROOM', playerId, roomId })
      store.setModal('roomActivation', false)
    },
    [playerId, dispatchAndSync, store]
  )

  const endTurn = useCallback(async () => {
    if (!playerId) return
    await dispatchAndSync({ type: 'END_TURN', playerId })
  }, [playerId, dispatchAndSync])

  const rerollDice = useCallback(
    async (dieIds: string[]) => {
      if (!playerId) return
      await dispatchAndSync({ type: 'REROLL', playerId, dieIds })
    },
    [playerId, dispatchAndSync]
  )

  const moveToRoom = useCallback(
    async (dieIds: string[], targetRoomId: RoomId) => {
      if (!playerId) return
      await dispatchAndSync({
        type: 'SPEND_MOVE',
        playerId,
        dieIds,
        targetRoomId,
      })
    },
    [playerId, dispatchAndSync]
  )

  const flyPlane = useCallback(
    async (dieIds: string[], direction: 'left' | 'right') => {
      if (!playerId) return
      await dispatchAndSync({ type: 'SPEND_FLY', playerId, dieIds, direction })
    },
    [playerId, dispatchAndSync]
  )

  const engineerFlip = useCallback(
    async (dieId: string, targetFace: DieFace) => {
      if (!playerId) return
      await dispatchAndSync({ type: 'ENGINEER_FLIP', playerId, dieId, targetFace })
    },
    [playerId, dispatchAndSync]
  )

  const rerollsRemaining = snapshot && playerId
    ? getRerollsRemaining(snapshot, playerId)
    : 0
  const rerollsMax = currentPlayer ? getRerollsMax(currentPlayer.role) : 0
  const selectableDice =
    snapshot && playerId ? getSelectableDice(snapshot, playerId) : []

  return {
    ...store,
    selectedDieId: store.selectedDieIds[0] ?? null,
    snapshot,
    currentPlayer,
    playerViews,
    selectableDice,
    rollDice,
    assignDie,
    assignDiceGroup,
    resolveWasteRoll: resolveWasteRollAction,
    assignDieToFirstSlot,
    activateRoom: activateRoomAction,
    endTurn,
    rerollDice,
    moveToRoom,
    flyPlane,
    engineerFlip,
    rerollsRemaining,
    rerollsMax,
    isOnline: isFirebaseConfigured() && !store.localMode,
    isMyTurn: snapshot?.activePlayerId === playerId,
    turnStep: snapshot?.turnStep ?? 'roll',
    isPausedByTimer: snapshot?.turnStep === 'pausedByTimer',
    selectDie: (dieId: string | null) => {
      if (!dieId) store.clearSelection()
      else store.setSelectedDice([dieId])
    },
  }
}
