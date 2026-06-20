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
import type { FirebaseRoom, LobbyPlayer } from '../types/firebase'
import type { GameSettings } from '../types/game'
import type { GameSnapshot, GameAction } from '../types/engine'
import { generateRoomCode } from './constants'
import { setupGame } from './engine'

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

function defaultSettings(settings: Partial<GameSettings>): GameSettings {
  return {
    difficulty: settings.difficulty ?? 'normal',
    aiReplacement: settings.aiReplacement ?? false,
    maxPlayers: settings.maxPlayers ?? 4,
    crisisEnabled: settings.crisisEnabled ?? false,
  }
}

export async function createRoom(
  hostName: string,
  settings: GameSettings
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

  const player: LobbyPlayer = {
    id: playerId,
    name: hostName,
    isHost: true,
    isReady: true,
    isConnected: true,
  }

  const room: FirebaseRoom = {
    code,
    status: 'lobby',
    lobbyPlayers: { [playerId]: player },
    snapshot: null,
    settings: defaultSettings(settings),
    hostId: playerId,
    pendingAction: null,
    createdAt: Date.now(),
    lastUpdated: Date.now(),
  }

  await set(roomRef(code), room)
  return { code, playerId }
}

export async function joinRoom(
  code: string,
  playerName: string
): Promise<string> {
  const playerId = await ensureAuth()
  const snap = await get(roomRef(code))
  if (!snap.exists()) throw new Error('Room not found')

  const room = snap.val() as FirebaseRoom
  if (room.status !== 'lobby') throw new Error('Game already started')
  if (Object.keys(room.lobbyPlayers).length >= room.settings.maxPlayers) {
    throw new Error('Room is full')
  }

  const player: LobbyPlayer = {
    id: playerId,
    name: playerName,
    isHost: false,
    isReady: false,
    isConnected: true,
  }

  await update(roomRef(code), {
    [`lobbyPlayers/${playerId}`]: player,
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

export async function syncSnapshot(
  code: string,
  snapshot: GameSnapshot
): Promise<void> {
  await update(roomRef(code), {
    snapshot,
    lastUpdated: Date.now(),
  })
}

export async function submitPendingAction(
  code: string,
  playerId: string,
  action: GameAction
): Promise<void> {
  const id = crypto.randomUUID()
  await update(roomRef(code), {
    pendingAction: { id, playerId, action, at: Date.now() },
    lastUpdated: Date.now(),
  })
}

export async function clearPendingAction(
  code: string,
  localMode = false
): Promise<void> {
  if (localMode) {
    await syncFullRoomLocal(code, { pendingAction: null })
    return
  }
  await update(roomRef(code), {
    pendingAction: null,
    lastUpdated: Date.now(),
  })
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

  const players = Object.values(room.lobbyPlayers).map((p) => ({
    id: p.id,
    name: p.name,
    isHost: p.isHost,
  }))

  const snapshot = setupGame({
    difficulty: room.settings.difficulty,
    maxPlayers: room.settings.maxPlayers,
    crisisEnabled: room.settings.crisisEnabled,
    players,
  })

  await update(roomRef(code), {
    status: 'playing',
    snapshot,
    lastUpdated: Date.now(),
  })
}

export async function leaveRoom(code: string, playerId: string): Promise<void> {
  const snap = await get(roomRef(code))
  if (!snap.exists()) return
  const room = snap.val() as FirebaseRoom
  const remaining = { ...room.lobbyPlayers }
  delete remaining[playerId]
  if (Object.keys(remaining).length === 0) {
    await set(roomRef(code), null)
  } else {
    await update(roomRef(code), {
      [`lobbyPlayers/${playerId}`]: null,
      lastUpdated: Date.now(),
    })
  }
}

const localRooms = new Map<string, FirebaseRoom>()
const localListeners = new Map<string, Set<(room: FirebaseRoom | null) => void>>()

function notifyLocal(code: string) {
  const room = localRooms.get(code) ?? null
  localListeners.get(code)?.forEach((cb) => cb(room))
}

export async function createRoomLocal(
  hostName: string,
  settings: GameSettings
): Promise<{ code: string; playerId: string }> {
  const playerId = crypto.randomUUID()
  const code = generateRoomCode()

  const player: LobbyPlayer = {
    id: playerId,
    name: hostName,
    isHost: true,
    isReady: true,
    isConnected: true,
  }

  const room: FirebaseRoom = {
    code,
    status: 'lobby',
    lobbyPlayers: { [playerId]: player },
    snapshot: null,
    settings: defaultSettings(settings),
    hostId: playerId,
    pendingAction: null,
    createdAt: Date.now(),
    lastUpdated: Date.now(),
  }

  localRooms.set(code, room)
  notifyLocal(code)
  return { code, playerId }
}

export async function joinRoomLocal(
  code: string,
  playerName: string
): Promise<string> {
  const room = localRooms.get(code)
  if (!room) throw new Error('Room not found')
  if (room.status !== 'lobby') throw new Error('Game already started')

  const playerId = crypto.randomUUID()
  const player: LobbyPlayer = {
    id: playerId,
    name: playerName,
    isHost: false,
    isReady: false,
    isConnected: true,
  }

  room.lobbyPlayers[playerId] = player
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

  const players = Object.values(room.lobbyPlayers).map((p) => ({
    id: p.id,
    name: p.name,
    isHost: p.isHost,
  }))

  room.snapshot = setupGame({
    difficulty: room.settings.difficulty,
    maxPlayers: room.settings.maxPlayers,
    crisisEnabled: room.settings.crisisEnabled,
    players,
  })
  room.status = 'playing'
  room.lastUpdated = Date.now()
  notifyLocal(code)
}

export async function syncSnapshotLocal(
  code: string,
  snapshot: GameSnapshot
): Promise<void> {
  await syncFullRoomLocal(code, { snapshot })
}
