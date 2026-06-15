import { useCallback } from 'react'
import { useGameStore, getCurrentPlayer } from '../store/gameStore'
import {
  assignDieToRoom,
  unassignDie,
  loadSuppliesToCargo,
  activateRoomForPlayer,
} from '../lib/gameLogic'
import {
  calculateWaste,
  checkWinCondition,
  checkLoseCondition,
  deliverToCity,
  allPlayersSubmitted,
  createSupplyFromRoom,
  createDice,
} from '../lib/rules'
import type { RoomId } from '../types/board'
import {
  isFirebaseConfigured,
  syncFullRoom,
  syncFullRoomLocal,
  submitRoomAssignment,
} from '../lib/firebase'
import { TIMER_SECONDS } from '../lib/constants'
import { track } from '../lib/analytics'

export function useGame() {
  const store = useGameStore()
  const currentPlayer = getCurrentPlayer()

  const assignDice = useCallback(
    (dieId: string, roomId: RoomId) => {
      if (!currentPlayer) return
      const updated = assignDieToRoom(currentPlayer, dieId, roomId)
      if (!updated) return
      store.updateLocalPlayer(updated)
      store.selectDie(null)
    },
    [currentPlayer, store]
  )

  const removeAssignment = useCallback(
    (dieId: string) => {
      if (!currentPlayer) return
      store.updateLocalPlayer(unassignDie(currentPlayer, dieId))
    },
    [currentPlayer, store]
  )

  const activateRoom = useCallback(
    async (roomId: RoomId) => {
      if (!currentPlayer) return
      const { supplies } = activateRoomForPlayer(currentPlayer, roomId)
      const newSupplies = [...store.gameState.supplies, ...supplies]
      const gs = { ...store.gameState, supplies: newSupplies }
      useGameStore.setState({ gameState: gs })
      store.setModal('roomActivation', false)
    },
    [currentPlayer, store]
  )

  const submitAssignments = useCallback(async () => {
    if (!currentPlayer || !store.roomCode) return
    const submitted = { ...currentPlayer, submitted: true }
    store.updateLocalPlayer(submitted)

    if (store.localMode) {
      const players = store.players.map((p) =>
        p.id === submitted.id ? submitted : p
      )
      const allDone = allPlayersSubmitted(players)
      if (allDone) {
        await resolveRound(players)
      } else {
        await syncFullRoomLocal(store.roomCode, {
          players: Object.fromEntries(players.map((p) => [p.id, p])),
        })
      }
    } else {
      await submitRoomAssignment(store.roomCode, currentPlayer.id, submitted)
    }
  }, [currentPlayer, store])

  const deliver = useCallback(
    async (cityId: number) => {
      const { cities } = store.board
      const { supplies, timeTokens } = store.gameState
      const { cities: newCities, supplies: newSupplies } = deliverToCity(
        cityId,
        cities,
        supplies
      )
      const gs = {
        ...store.gameState,
        supplies: newSupplies,
        timeTokens: timeTokens - 1,
      }
      const board = { ...store.board, cities: newCities, planePosition: cityId }

      if (checkWinCondition(newCities)) {
        gs.result = 'win'
        useGameStore.setState({ status: 'ended', gameState: gs, board })
        store.setModal('gameEnd', true)
        track('game_ended', { result: 'win', rounds: gs.round, waste: gs.waste, cities_delivered: newCities.filter((c) => c.delivered).length })
      } else if (checkLoseCondition(gs)) {
        gs.result = 'lose'
        useGameStore.setState({ status: 'ended', gameState: gs, board })
        store.setModal('gameEnd', true)
        track('game_ended', { result: 'lose', rounds: gs.round, waste: gs.waste, cities_delivered: newCities.filter((c) => c.delivered).length })
      } else {
        useGameStore.setState({ gameState: gs, board })
      }

      if (store.roomCode) {
        const sync = store.localMode ? syncFullRoomLocal : syncFullRoom
        await sync(store.roomCode, { gameState: gs, board })
      }
    },
    [store]
  )

  const loadCargo = useCallback(
    (supplyIds: string[]) => {
      const supplies = loadSuppliesToCargo(store.gameState.supplies, supplyIds)
      useGameStore.setState({
        gameState: { ...store.gameState, supplies },
      })
    },
    [store]
  )

  const startNextRound = useCallback(async () => {
    const players = store.players.map((p) => ({
      ...p,
      dice: createDice(),
      submitted: false,
      rerollsUsed: 0,
    }))
    const gs = {
      ...store.gameState,
      round: store.gameState.round + 1,
      phase: 'assigning' as const,
      timer: TIMER_SECONDS,
      timerRunning: true,
    }
    useGameStore.setState({ players, gameState: gs })
    if (store.roomCode) {
      const sync = store.localMode ? syncFullRoomLocal : syncFullRoom
      await sync(store.roomCode, {
        players: Object.fromEntries(players.map((p) => [p.id, p])),
        gameState: gs,
      })
    }
  }, [store])

  return {
    ...store,
    currentPlayer,
    assignDice,
    removeAssignment,
    activateRoom,
    submitAssignments,
    deliver,
    loadCargo,
    startNextRound,
    isOnline: isFirebaseConfigured() && !store.localMode,
  }
}

async function resolveRound(
  players: ReturnType<typeof useGameStore.getState>['players']
) {
  const store = useGameStore.getState()
  let allSupplies = [...store.gameState.supplies]

  for (const player of players) {
    const rooms = new Set(
      player.dice.map((d) => d.assignedRoom).filter(Boolean) as RoomId[]
    )
    for (const roomId of rooms) {
      const matching = player.dice.filter((d) => d.assignedRoom === roomId)
      const created = createSupplyFromRoom(roomId, matching.length)
      allSupplies = [...allSupplies, ...created]
    }
  }

  const wasteAdded = calculateWaste(players)
  const gs = {
    ...store.gameState,
    supplies: allSupplies,
    waste: Math.min(
      store.gameState.wasteMax,
      store.gameState.waste + wasteAdded
    ),
    phase: 'delivering' as const,
    timerRunning: false,
  }

  if (checkLoseCondition(gs)) {
    gs.result = 'lose'
    useGameStore.setState({ status: 'ended', gameState: gs })
    store.setModal('gameEnd', true)
  } else if (checkWinCondition(store.board.cities)) {
    gs.result = 'win'
    useGameStore.setState({ status: 'ended', gameState: gs })
    store.setModal('gameEnd', true)
  } else {
    useGameStore.setState({ gameState: gs })
  }

  if (store.roomCode) {
    const sync = store.localMode ? syncFullRoomLocal : syncFullRoom
    await sync(store.roomCode, { gameState: gs })
  }
}
