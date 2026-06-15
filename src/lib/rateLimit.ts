const STORAGE_KEY = 'prr_room_creates'
const MAX_CREATES = 10
const WINDOW_MS = 60 * 60 * 1000

interface CreateLog {
  timestamps: number[]
}

export function canCreateRoom(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const log: CreateLog = raw ? JSON.parse(raw) : { timestamps: [] }
    const now = Date.now()
    const recent = log.timestamps.filter((t) => now - t < WINDOW_MS)
    if (recent.length >= MAX_CREATES) return false
    recent.push(now)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ timestamps: recent }))
    return true
  } catch {
    return true
  }
}
