import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  onValue,
  off,
  type Database,
} from 'firebase/database'
import { getAuth, signInAnonymously, type Auth } from 'firebase/auth'
import type { FirebaseRoom } from '../types/firebase'
import type { Player, GameState, GameSettings } from '../types/game'
import type { BoardState } from '../types/board'
import {
  generateRoomCode,
  TIMER_SECONDS,
} from './constants'
import { createInitialGameState, createInitialBoard, createDice, getRoleRerollMax } from './rules'
import type { RoleId } from '../types/board'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app: FirebaseApp | null = null
let db: Database | null = null
let auth: Auth | null = null

export function isFirebaseConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
      import.meta.env.VITE_FIREBASE_DATABASE_URL &&
      import.meta.env.VITE_FIREBASE_API_KEY !== 'your-api-key'
  )
}

export function initFirebase(): { app: FirebaseApp; db: Database; auth: Auth } {
  if (!app) {
    app = initializeApp(firebaseConfig)
    db = getDatabase(app)
    auth = getAuth(app)
  }
  return { app: app!, db: db!, auth: auth! }
}

export async function ensureAuth(): Promise<string> {
  const { auth: firebaseAuth } = initFirebase()
  if (!firebaseAuth.currentUser) {
    await signInAnonymously(firebaseAuth)
  }
  return firebaseAuth.currentUser!.uid
}

function roomRef(code: string) {
  const { db: database } = initFirebase()
  return ref(database, `rooms/${code}`)
}

export async function createRoom(
  hostName: string,
  settings: GameSettings,
  role: RoleId
): Promise<{ code: string; playerId: string }> {
  const playerId = await ensureAuth()
  let code = generateRoomCode()

  const { db: database } = initFirebase()
  let exists = true
  while (exists) {
    const snap = await get(ref(database, `rooms/${code}`))
    if (!snap.exists()) {
      exists = false
    } else {
      code = generateRoomCode()
    }
  }

  const player: Player = {
    id: playerId,
    name: hostName,
    role,
    dice: [],
    rerollsUsed: 0,
    rerollsMax: getRoleRerollMax(role),
    suppliesCarried: 0,
    missedTurns: 0,
    isHost: true,
    isReady: true,
    isConnected: true,
    submitted: false,
  }

  const room: FirebaseRoom = {
    code,
    status: 'lobby',
    players: { [playerId]: player },
    gameState: createInitialGameState(),
    board: createInitialBoard(),
    settings,
    hostId: playerId,
    createdAt: Date.now(),
    lastUpdated: Date.now(),
  }

  await set(roomRef(code), room)
  return { code, playerId }
}

export async function joinRoom(
  code: string,
  playerName: string,
  role: RoleId
): Promise<string> {
  const playerId = await ensureAuth()
  const snap = await get(roomRef(code))
  if (!snap.exists()) throw new Error('Room not found')

  const room = snap.val() as FirebaseRoom
  if (room.status !== 'lobby') throw new Error('Game already started')
  if (Object.keys(room.players).length >= room.settings.maxPlayers) {
    throw new Error('Room is full')
  }

  const player: Player = {
    id: playerId,
    name: playerName,
    role,
    dice: [],
    rerollsUsed: 0,
    rerollsMax: getRoleRerollMax(role),
    suppliesCarried: 0,
    missedTurns: 0,
    isHost: false,
    isReady: false,
    isConnected: true,
    submitted: false,
  }

  await update(roomRef(code), {
    [`players/${playerId}`]: player,
    lastUpdated: Date.now(),
  })

  return playerId
}

export function subscribeToRoom(
  code: string,
  callback: (room: FirebaseRoom | null) => void
): () => void {
  const r = roomRef(code)
  onValue(r, (snap) => {
    callback(snap.exists() ? (snap.val() as FirebaseRoom) : null)
  })
  return () => off(r)
}

export async function updatePlayer(
  code: string,
  playerId: string,
  data: Partial<Player>
): Promise<void> {
  await update(roomRef(code), {
    [`players/${playerId}`]: data,
    lastUpdated: Date.now(),
  })
}

export async function syncGameState(
  code: string,
  gameState: Partial<GameState>
): Promise<void> {
  const updates: Record<string, unknown> = { lastUpdated: Date.now() }
  for (const [key, val] of Object.entries(gameState)) {
    updates[`gameState/${key}`] = val
  }
  await update(roomRef(code), updates)
}

export async function syncBoard(
  code: string,
  board: Partial<BoardState>
): Promise<void> {
  const updates: Record<string, unknown> = { lastUpdated: Date.now() }
  for (const [key, val] of Object.entries(board)) {
    updates[`board/${key}`] = val
  }
  await update(roomRef(code), updates)
}

export async function syncFullRoom(
  code: string,
  data: Partial<FirebaseRoom>
): Promise<void> {
  await update(roomRef(code), { ...data, lastUpdated: Date.now() })
}

export async function startGame(code: string): Promise<void> {
  const snap = await get(roomRef(code))
  if (!snap.exists()) return
  const room = snap.val() as FirebaseRoom

  const players: Record<string, Player> = {}
  for (const [id, p] of Object.entries(room.players)) {
    players[id] = {
      ...p,
      dice: createDice(),
      submitted: false,
      rerollsUsed: 0,
    }
  }

  await update(roomRef(code), {
    status: 'playing',
    players,
    'gameState/phase': 'assigning',
    'gameState/timer': TIMER_SECONDS,
    'gameState/timerRunning': true,
    lastUpdated: Date.now(),
  })
}

export async function submitRoomAssignment(
  code: string,
  playerId: string,
  player: Player
): Promise<void> {
  await update(roomRef(code), {
    [`players/${playerId}`]: { ...player, submitted: true },
    lastUpdated: Date.now(),
  })
}

export async function leaveRoom(code: string, playerId: string): Promise<void> {
  const snap = await get(roomRef(code))
  if (!snap.exists()) return
  const room = snap.val() as FirebaseRoom
  const { [playerId]: _, ...remaining } = room.players
  if (Object.keys(remaining).length === 0) {
    await set(roomRef(code), null)
  } else {
    await update(roomRef(code), {
      [`players/${playerId}`]: null,
      lastUpdated: Date.now(),
    })
  }
}

// Local-only mock for development without Firebase
const localRooms = new Map<string, FirebaseRoom>()
const localListeners = new Map<string, Set<(room: FirebaseRoom | null) => void>>()

function notifyLocal(code: string) {
  const room = localRooms.get(code) ?? null
  localListeners.get(code)?.forEach((cb) => cb(room))
}

export async function createRoomLocal(
  hostName: string,
  settings: GameSettings,
  role: RoleId
): Promise<{ code: string; playerId: string }> {
  const playerId = crypto.randomUUID()
  const code = generateRoomCode()

  const player: Player = {
    id: playerId,
    name: hostName,
    role,
    dice: [],
    rerollsUsed: 0,
    rerollsMax: getRoleRerollMax(role),
    suppliesCarried: 0,
    missedTurns: 0,
    isHost: true,
    isReady: true,
    isConnected: true,
    submitted: false,
  }

  const room: FirebaseRoom = {
    code,
    status: 'lobby',
    players: { [playerId]: player },
    gameState: createInitialGameState(),
    board: createInitialBoard(),
    settings,
    hostId: playerId,
    createdAt: Date.now(),
    lastUpdated: Date.now(),
  }

  localRooms.set(code, room)
  notifyLocal(code)
  return { code, playerId }
}

export async function joinRoomLocal(
  code: string,
  playerName: string,
  role: RoleId
): Promise<string> {
  const room = localRooms.get(code)
  if (!room) throw new Error('Room not found')
  if (room.status !== 'lobby') throw new Error('Game already started')

  const playerId = crypto.randomUUID()
  const player: Player = {
    id: playerId,
    name: playerName,
    role,
    dice: [],
    rerollsUsed: 0,
    rerollsMax: getRoleRerollMax(role),
    suppliesCarried: 0,
    missedTurns: 0,
    isHost: false,
    isReady: false,
    isConnected: true,
    submitted: false,
  }

  room.players[playerId] = player
  room.lastUpdated = Date.now()
  notifyLocal(code)
  return playerId
}

export function subscribeToRoomLocal(
  code: string,
  callback: (room: FirebaseRoom | null) => void
): () => void {
  if (!localListeners.has(code)) localListeners.set(code, new Set())
  localListeners.get(code)!.add(callback)
  callback(localRooms.get(code) ?? null)
  return () => localListeners.get(code)?.delete(callback)
}

export async function syncFullRoomLocal(
  code: string,
  data: Partial<FirebaseRoom>
): Promise<void> {
  const room = localRooms.get(code)
  if (!room) return
  Object.assign(room, data, { lastUpdated: Date.now() })
  notifyLocal(code)
}

export async function startGameLocal(code: string): Promise<void> {
  const room = localRooms.get(code)
  if (!room) return
  for (const p of Object.values(room.players)) {
    p.dice = createDice()
    p.submitted = false
    p.rerollsUsed = 0
  }
  room.status = 'playing'
  room.gameState.phase = 'assigning'
  room.gameState.timer = TIMER_SECONDS
  room.gameState.timerRunning = true
  room.lastUpdated = Date.now()
  notifyLocal(code)
}
