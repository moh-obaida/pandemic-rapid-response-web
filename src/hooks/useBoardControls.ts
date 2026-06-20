import { useCallback, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { useGame } from './useGame'
import { ROLES } from '../lib/constants'
import {
  getValidAssignSlots,
  canRoomActivate,
  isSlotValidTarget,
  roomAcceptsMove,
  roomAcceptsAssign,
} from '../lib/boardTargets'
import type { RoomId } from '../types/board'
import type { DieFace } from '../lib/constants/dice'
import { getDieById } from '../lib/boardInteraction'

function roomLabel(roomId: RoomId): string {
  return roomId === 'firstAid' ? 'First Aid' : roomId.charAt(0).toUpperCase() + roomId.slice(1)
}

export function useBoardControls() {
  const {
    snapshot,
    playerId,
    currentPlayer,
    isMyTurn,
    turnStep,
    assignDiceGroup,
    moveToRoom,
    flyPlane,
    activateRoom,
    engineerFlip,
    rollDice,
    endTurn,
    rerollDice,
    rerollsRemaining,
    selectableDice,
  } = useGame()

  const selectedDieIds = useGameStore((s) => s.selectedDieIds)
  const selectedRoom = useGameStore((s) => s.selectedRoom)
  const pendingConfirm = useGameStore((s) => s.pendingConfirm)
  const toggleDieSelection = useGameStore((s) => s.toggleDieSelection)
  const clearSelection = useGameStore((s) => s.clearSelection)
  const setPendingConfirm = useGameStore((s) => s.setPendingConfirm)
  const selectRoom = useGameStore((s) => s.selectRoom)

  const controlsFrozen = !isMyTurn || turnStep === 'pausedByTimer'
  const canAct =
    isMyTurn &&
    turnStep === 'useDice' &&
    !pendingConfirm &&
    !snapshot?.pendingWasteRoll

  useEffect(() => {
    if (turnStep === 'pausedByTimer') {
      clearSelection()
      setPendingConfirm(null)
    }
  }, [turnStep, clearSelection, setPendingConfirm])

  const handleDieClick = useCallback(
    (dieId: string, additive = false) => {
      if (controlsFrozen || turnStep !== 'useDice') return
      if (pendingConfirm) return
      toggleDieSelection(dieId, additive)
    },
    [controlsFrozen, turnStep, pendingConfirm, toggleDieSelection]
  )

  const assignDiceToGroup = useCallback(
    async (dieIds: string[], roomId: RoomId, startSlot: number) => {
      await assignDiceGroup(dieIds, roomId, startSlot)
    },
    [assignDiceGroup]
  )

  const confirmPending = useCallback(async () => {
    const pending = useGameStore.getState().pendingConfirm
    if (!pending || !playerId) return

    setPendingConfirm(null)

    switch (pending.type) {
      case 'move':
        await moveToRoom(pending.dieIds, pending.targetRoom)
        break
      case 'fly':
        await flyPlane(pending.dieIds, pending.direction)
        break
      case 'assign':
        await assignDiceToGroup(
          pending.dieIds,
          pending.roomId,
          pending.slotIndex
        )
        break
      case 'activate':
        await activateRoom(pending.roomId)
        break
      case 'engineerFlip':
        await engineerFlip(pending.dieId, pending.targetFace)
        break
    }
    clearSelection()
    selectRoom(null)
  }, [
    playerId,
    moveToRoom,
    flyPlane,
    assignDiceToGroup,
    activateRoom,
    engineerFlip,
    clearSelection,
    selectRoom,
    setPendingConfirm,
  ])

  const cancelPending = useCallback(() => {
    setPendingConfirm(null)
  }, [setPendingConfirm])

  const handleRoomClick = useCallback(
    (roomId: RoomId) => {
      if (!snapshot || !playerId) return

      if (controlsFrozen) return

      if (canAct && selectedDieIds.length > 0) {
        if (roomAcceptsAssign(snapshot, playerId, selectedDieIds, roomId)) {
          const slots = getValidAssignSlots(snapshot, playerId, selectedDieIds)
          const target = slots.find((s) => s.roomId === roomId)
          if (target) {
            setPendingConfirm({
              type: 'assign',
              dieIds: [...selectedDieIds],
              roomId,
              slotIndex: target.slotIndex,
              label: `Assign ${selectedDieIds.length} die(s) to ${roomLabel(roomId)}?`,
            })
            return
          }
        }

        if (roomAcceptsMove(snapshot, playerId, selectedDieIds, roomId)) {
          setPendingConfirm({
            type: 'move',
            dieIds: [...selectedDieIds],
            targetRoom: roomId,
            label: `Move to ${roomLabel(roomId)}?`,
          })
          return
        }
      }

      if (canAct && selectedDieIds.length === 0 && canRoomActivate(snapshot, playerId, roomId)) {
        setPendingConfirm({
          type: 'activate',
          roomId,
          label: `Activate ${roomLabel(roomId)}?`,
        })
        return
      }

      selectRoom(roomId)
    },
    [
      snapshot,
      playerId,
      controlsFrozen,
      canAct,
      selectedDieIds,
      setPendingConfirm,
      selectRoom,
    ]
  )

  const handleDieSlotClick = useCallback(
    (roomId: RoomId, slotIndex: number) => {
      if (!snapshot || !playerId || !canAct || selectedDieIds.length === 0) return

      if (!isSlotValidTarget(snapshot, playerId, selectedDieIds, roomId, slotIndex)) {
        return
      }

      setPendingConfirm({
        type: 'assign',
        dieIds: [...selectedDieIds],
        roomId,
        slotIndex,
        label: `Assign ${selectedDieIds.length} die(s) to slot?`,
      })
    },
    [snapshot, playerId, canAct, selectedDieIds, setPendingConfirm]
  )

  const handleFlyClick = useCallback(
    (direction: 'left' | 'right') => {
      if (!snapshot || !playerId || !canAct || selectedDieIds.length === 0) return

      const planeIds = selectedDieIds.filter(
        (id) => getDieById(snapshot, id)?.face === 'plane'
      )
      if (planeIds.length === 0) return

      setPendingConfirm({
        type: 'fly',
        dieIds: planeIds,
        direction,
        label: `Fly ${direction === 'left' ? 'left' : 'right'}?`,
      })
    },
    [snapshot, playerId, canAct, selectedDieIds, setPendingConfirm]
  )

  const handleEngineerFlip = useCallback(
    (targetFace: DieFace) => {
      if (!snapshot || !canAct) return
      const planeDie = selectedDieIds.find(
        (id) => getDieById(snapshot, id)?.face === 'plane'
      )
      if (!planeDie) return

      setPendingConfirm({
        type: 'engineerFlip',
        dieId: planeDie,
        targetFace,
        label: `Flip plane die to ${targetFace}?`,
      })
    },
    [snapshot, canAct, selectedDieIds, setPendingConfirm]
  )

  const handleRerollSelected = useCallback(async () => {
    if (!canAct || selectedDieIds.length === 0 || rerollsRemaining <= 0) return
    await rerollDice([...selectedDieIds])
    clearSelection()
  }, [canAct, selectedDieIds, rerollsRemaining, rerollDice, clearSelection])

  const roleName = currentPlayer
    ? ROLES.find((r) => r.id === currentPlayer.role)?.name
    : undefined

  return {
    selectedDieIds,
    selectedRoom,
    pendingConfirm,
    controlsFrozen,
    canAct,
    isMyTurn,
    turnStep,
    currentPlayer,
    roleName,
    rerollsRemaining,
    selectableDice,
    handleDieClick,
    handleRoomClick,
    handleDieSlotClick,
    handleFlyClick,
    handleEngineerFlip,
    handleRerollSelected,
    confirmPending,
    cancelPending,
    clearSelection,
    rollDice,
    endTurn,
  }
}
