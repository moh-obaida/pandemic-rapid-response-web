#!/usr/bin/env node
/**
 * PRR — Playwright screenshot QA (Teacher CV Hub structure, PRR board-game coverage)
 *
 * Prerequisite: dev server at http://localhost:5173
 *   npm run dev
 *
 * Run:
 *   npm install && npx playwright install chromium
 *   npm run qa:screenshots
 *
 * Optional env:
 *   PRR_QA_WORKERS=1,2,3
 *   PRR_QA_GLOBAL_TIMEOUT_MS=300000
 *   PRR_QA_WORKER_TIMEOUT_MS=180000
 *   PRR_QA_SCENARIO_TIMEOUT_MS=15000
 */

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const BASE_URL = process.env.PRR_QA_BASE_URL ?? 'http://localhost:5173'

const GLOBAL_TIMEOUT_MS = Number(process.env.PRR_QA_GLOBAL_TIMEOUT_MS ?? 5 * 60 * 1000)
const WORKER_TIMEOUT_MS = Number(process.env.PRR_QA_WORKER_TIMEOUT_MS ?? 180 * 1000)
const SCENARIO_TIMEOUT_MS = Number(process.env.PRR_QA_SCENARIO_TIMEOUT_MS ?? 15 * 1000)
const FOCUS_SCENARIO_TIMEOUT_MS = Number(process.env.PRR_QA_FOCUS_SCENARIO_TIMEOUT_MS ?? 30 * 1000)
const SCREENSHOT_TIMEOUT_MS = Number(process.env.PRR_QA_SCREENSHOT_TIMEOUT_MS ?? 10_000)
const NAV_TIMEOUT_MS = Number(process.env.PRR_QA_NAV_TIMEOUT_MS ?? 15_000)
const HEARTBEAT_MS = 10_000

/** @typedef {'top' | 'middle' | 'bottom'} ScrollPosition */
/** @typedef {{ width: number, height: number, portrait?: boolean }} ViewportDef */

/** @type {Record<string, ViewportDef>} */
const VIEWPORTS = {
  'desktop-1920x1080': { width: 1920, height: 1080 },
  'laptop-1440x900': { width: 1440, height: 900 },
  'ipad-landscape-1366x1024': { width: 1366, height: 1024 },
  'ipad-portrait-1024x1366': { width: 1024, height: 1366, portrait: true },
  'iphone-12-portrait-390x844': { width: 390, height: 844, portrait: true },
  'iphone-12-landscape-844x390': { width: 844, height: 390 },
}

const PUBLIC_LOBBY_VIEWPORTS = {
  'desktop-1920x1080': VIEWPORTS['desktop-1920x1080'],
  'laptop-1440x900': VIEWPORTS['laptop-1440x900'],
  'iphone-12-landscape-844x390': VIEWPORTS['iphone-12-landscape-844x390'],
}

const GAME_SEED_VIEWPORT = VIEWPORTS['desktop-1920x1080']

const RESPONSIVE_A11Y_VIEWPORTS = { ...VIEWPORTS }

const PUBLIC_ROUTES = [
  { path: '/', state: 'home' },
  { path: '/how-to-play', state: 'how-to-play' },
  { path: '/rules', state: 'rules' },
  { path: '/roles', state: 'roles' },
  { path: '/cards', state: 'cards' },
  { path: '/faq', state: 'faq' },
  { path: '/about', state: 'about' },
  { path: '/privacy', state: 'privacy' },
]

/** @type {{ id: string, seed: string }[]} */
const GAME_STATE_SCENARIOS = [
  { id: 'game-initial-roll-step', seed: 'initialGame' },
  { id: 'active-player-roll-ready', seed: 'initialGame' },
  { id: 'active-player-dice-in-hand', seed: 'rolledDice' },
  { id: 'dice-selected-valid-targets', seed: 'selectedDice' },
  { id: 'pending-confirm-move', seed: 'pendingMove' },
  { id: 'pending-confirm-assign', seed: 'pendingAssign' },
  { id: 'pending-confirm-fly', seed: 'pendingFly' },
  { id: 'pending-confirm-activate', seed: 'pendingActivate' },
  { id: 'non-active-player-waiting', seed: 'nonActivePlayerWaiting' },
  { id: 'error-toast-visible', seed: 'rolledDice' },
  { id: 'cargo-empty', seed: 'cargoEmpty' },
  { id: 'cargo-partial', seed: 'cargoPartial' },
  { id: 'cargo-full', seed: 'cargoFull' },
  { id: 'delivery-ready', seed: 'deliveryReady' },
  { id: 'delivery-missing-crates', seed: 'missingCrates' },
  { id: 'city-card-preview', seed: 'cityCardPreview' },
  { id: 'role-card-preview', seed: 'roleCardPreview' },
  { id: 'assigned-dice-on-board', seed: 'assignedDiceOnBoard' },
  { id: 'spent-dice-on-role-card', seed: 'spentDiceOnRole' },
  { id: 'pawns-in-multiple-rooms', seed: 'pawnsInMultipleRooms' },
  { id: 'multiple-pawns-same-room', seed: 'multiplePawnsSameRoom' },
  { id: 'waste-mid-track', seed: 'wasteMidTrack' },
  { id: 'waste-danger', seed: 'wasteDanger' },
  { id: 'HQ-low-tokens', seed: 'hqLow' },
  { id: 'city-deck-low', seed: 'cityDeckLow' },
  { id: 'city-deck-empty', seed: 'cityDeckEmpty' },
  { id: 'timer-normal', seed: 'timerNormal' },
  { id: 'timer-warning-under-30', seed: 'timerWarning' },
  { id: 'timer-danger-under-10', seed: 'timerDanger' },
  { id: 'timer-expired-overlay', seed: 'timerExpired', expectTimerOverlay: true },
  { id: 'paused-by-timer', seed: 'timerExpired', expectTimerOverlay: true },
  { id: 'post-timer-resume', seed: 'postTimerResume' },
  { id: 'victory-screen', seed: 'win' },
  { id: 'loss-waste-screen', seed: 'loseWaste' },
  { id: 'loss-HQ-screen', seed: 'loseHQ' },
  { id: 'crisis-disabled-normal', seed: 'crisisDisabledNormal' },
  { id: 'crisis-modal', seed: 'crisisModal' },
  { id: 'temporary-crisis-active', seed: 'temporaryCrisisActive' },
  { id: 'delivery-blocker-on-city', seed: 'deliveryBlockerOnCity' },
  { id: 'supply-spill-choice', seed: 'supplySpillChoice' },
  { id: 'distraction-dice-held', seed: 'distractionDiceHeld' },
]

const WORKER_FOLDERS = {
  publicLobby: 'public-lobby',
  gameStates: 'game-states',
  responsiveA11y: 'responsive-a11y',
}

/** @type {Record<string, string>} */
const WORKER_NAME_TO_FOLDER = {
  'public-lobby': WORKER_FOLDERS.publicLobby,
  'game-states': WORKER_FOLDERS.gameStates,
  'responsive-a11y': WORKER_FOLDERS.responsiveA11y,
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function makeRunFolderName() {
  const d = new Date()
  return `prr-phase-1-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}-${pad(d.getMinutes())}`
}

function gitInfo() {
  try {
    return {
      branch: execSync('git rev-parse --abbrev-ref HEAD', { cwd: ROOT }).toString().trim(),
      commit: execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim(),
    }
  } catch {
    return { branch: 'unknown', commit: 'unknown' }
  }
}

function shotPath(outDir, groupFolder, stateName, viewportName, suffix) {
  return path.join(outDir, groupFolder, `${stateName}_${viewportName}_${suffix}.png`)
}

function relShot(groupFolder, stateName, viewportName, suffix) {
  return `${groupFolder}/${stateName}_${viewportName}_${suffix}.png`
}

/**
 * @param {Promise<T>} promise
 * @param {number} ms
 * @param {string} label
 * @returns {Promise<T>}
 * @template T
 */
function withTimeout(promise, ms, label) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function formatDuration(ms) {
  return `${(ms / 1000).toFixed(1)}s`
}

class RunState {
  constructor() {
    /** @type {Set<string>} */
    this.activeWorkers = new Set()
    /** @type {string[]} */
    this.failures = []
    /** @type {NodeJS.Timeout | null} */
    this.heartbeat = null
    this.globalTimedOut = false
  }

  startHeartbeat() {
    this.heartbeat = setInterval(() => {
      const active = [...this.activeWorkers].join(', ') || 'none'
      console.log(`[QA] still running… active workers: ${active}`)
    }, HEARTBEAT_MS)
  }

  stopHeartbeat() {
    if (this.heartbeat) {
      clearInterval(this.heartbeat)
      this.heartbeat = null
    }
  }
}

class WorkerGroup {
  /**
   * @param {string} title
   * @param {string} folder
   */
  constructor(title, folder) {
    this.title = title
    this.folder = folder
    this.status = 'pending'
    this.startedAt = Date.now()
    /** @type {string[]} */
    this.captured = []
    /** @type {string[]} */
    this.skipped = []
    /** @type {string[]} */
    this.skippedScroll = []
    /** @type {string[]} */
    this.flakyList = []
    /** @type {string[]} */
    this.failures = []
    /** @type {string[]} */
    this.assumptions = []
    /** @type {string[]} */
    this.notImplemented = []
    /** @type {string[]} */
    this.consoleErrors = []
    /** @type {string[]} */
    this.pageErrors = []
    /** @type {string[]} */
    this.notes = []
    /** @type {string[]} */
    this.viewportsUsed = []
    this.attempted = 0
    this.failedCaptures = 0
    this.qaBridgeStatus = 'unknown'
    /** @type {string[]} */
    this.missingAssets = []
    this.validBoardCaptures = 0
    /** @type {string} */
    this.qaBridgeDetails = ''
  }

  mark(relPath) {
    this.captured.push(relPath)
  }

  skip(relPath, note) {
    this.skipped.push(`- \`${relPath}\` — ${note}`)
  }

  skipScroll(stateName, viewportName, note) {
    this.skippedScroll.push(`- \`${stateName}_${viewportName}\` middle/bottom — ${note}`)
  }

  markFlaky(relPath, note) {
    this.flakyList.push(`- \`${relPath}\` — ${note}`)
  }

  markNotImplemented(stateId, note) {
    this.notImplemented.push(`- \`${stateId}\` — ${note}`)
  }

  fail(note) {
    this.failures.push(`- ${note}`)
  }

  addNote(note) {
    this.notes.push(`- ${note}`)
  }

  durationMs() {
    return Date.now() - this.startedAt
  }
}

/**
 * @param {WorkerGroup} group
 * @param {import('playwright').Page} page
 */
function attachPageListeners(group, page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      if (!group.consoleErrors.includes(text)) group.consoleErrors.push(text)
    }
  })
  page.on('pageerror', (err) => {
    const text = err.message
    if (!group.pageErrors.includes(text)) group.pageErrors.push(text)
  })
}

async function runFocusScenario(group, scenarioName, fn) {
  console.log(`    → focus scenario: ${scenarioName}`)
  try {
    await withTimeout(fn(), FOCUS_SCENARIO_TIMEOUT_MS, `scenario:${scenarioName}`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    group.markFlaky(`scenario:${scenarioName}`, msg)
    console.warn(`[QA] focus scenario skipped: ${scenarioName} — ${msg}`)
  }
}

/**
 * @param {import('playwright').Page} page
 * @param {(...args: unknown[]) => unknown} fn
 * @param {unknown} [arg]
 */
async function safeEvaluate(page, fn, arg) {
  if (page.isClosed()) {
    throw new Error('Target page is closed')
  }
  if (arg === undefined) {
    return page.evaluate(fn)
  }
  return page.evaluate(fn, arg)
}

/**
 * @param {import('playwright').Page} page
 */
async function clientNavigateToGame(page) {
  await safeEvaluate(page, () => {
    window.history.pushState({}, '', '/game')
    window.dispatchEvent(new PopStateEvent('popstate'))
  })
}

/**
 * @param {import('playwright').Page} page
 * @param {{ expectTimerOverlay?: boolean }} [options]
 */
async function detectFallbackScreen(page, options = {}) {
  const { expectTimerOverlay = false } = options
  const hasGameShell = await page.getByTestId('game-shell').isVisible().catch(() => false)
  const hasBoard = await page.getByTestId('board-view').isVisible().catch(() => false)

  if (hasGameShell || hasBoard) {
    const timerOverlay = await page.locator('.timer-expired-overlay').isVisible().catch(() => false)
    if (timerOverlay && !expectTimerOverlay) {
      return { fallback: true, reason: 'timer-expired-overlay-unexpected' }
    }
    return { fallback: false }
  }

  if (await page.getByTestId('asset-gate-error').isVisible().catch(() => false)) {
    return { fallback: true, reason: 'asset-gate-error' }
  }
  if (await page.getByTestId('crew-briefing').isVisible().catch(() => false)) {
    return { fallback: true, reason: 'lobby-crew-briefing-instead-of-board' }
  }
  if (await page.getByTestId('lobby-room').isVisible().catch(() => false)) {
    return { fallback: true, reason: 'lobby-menu-instead-of-board' }
  }
  if (await page.getByTestId('landing-start-mission').isVisible().catch(() => false)) {
    return { fallback: true, reason: 'landing-page-instead-of-board' }
  }
  if (await page.getByText('Start Mission').first().isVisible().catch(() => false)) {
    return { fallback: true, reason: 'marketing-cta-instead-of-board' }
  }
  if (await page.getByText('Join Room').first().isVisible().catch(() => false)) {
    return { fallback: true, reason: 'lobby-join-instead-of-board' }
  }
  if (await page.getByText('Timer Expired').isVisible().catch(() => false)) {
    return { fallback: true, reason: 'timer-expired-without-game-shell' }
  }

  return { fallback: true, reason: 'game-shell-not-visible' }
}

/**
 * @param {import('playwright').Page} page
 */
async function waitForGameMountOutcome(page) {
  const deadline = Date.now() + NAV_TIMEOUT_MS
  while (Date.now() < deadline) {
    if (page.isClosed()) {
      return { outcome: 'page-closed' }
    }
    if (await page.getByTestId('asset-gate-error').isVisible().catch(() => false)) {
      return { outcome: 'asset-gate' }
    }
    if (!(await safeEvaluate(page, () => Boolean(window.__PRR_QA__ || window.PRR_QA)).catch(() => false))) {
      return { outcome: 'no-bridge' }
    }
    if (await page.getByTestId('game-shell').isVisible().catch(() => false)) {
      await waitForStable(page)
      return { outcome: 'game-shell' }
    }
    if (await page.getByTestId('crew-briefing').isVisible().catch(() => false)) {
      return { outcome: 'lobby-fallback' }
    }
    if (await page.getByTestId('lobby-room').isVisible().catch(() => false)) {
      return { outcome: 'lobby-fallback' }
    }
    await sleep(100)
  }
  return { outcome: 'timeout' }
}

/**
 * @param {import('playwright').Page} page
 * @param {string} seedName
 * @param {{ navigateToGame?: boolean }} [options]
 */
async function mountGameScenario(page, seedName, options = {}) {
  const { navigateToGame = false } = options

  const evalResult = await safeEvaluate(
    page,
    ({ name, nav }) => {
      const bridge = window.__PRR_QA__ ?? window.PRR_QA
      if (!bridge) {
        return { ok: false, reason: 'qaBridge missing', status: null }
      }
      bridge.reset()
      let ok = false
      if (name === 'error-toast-visible') {
        ok = bridge.seedState('rolledDice')
        if (ok) bridge.showErrorToast('QA screenshot: rule or connection error sample')
      } else {
        ok = bridge.seedState(name)
      }
      if (nav) {
        window.history.pushState({}, '', '/game')
        window.dispatchEvent(new PopStateEvent('popstate'))
      }
      return { ok, reason: ok ? null : bridge.getStatus?.()?.lastSeedError ?? 'seedState returned false', status: bridge.getStatus?.() ?? null }
    },
    { name: seedName, nav: navigateToGame },
  )

  const mount = await waitForGameMountOutcome(page)
  return { ...evalResult, mount }
}

/**
 * @param {WorkerGroup} group
 * @param {import('playwright').Page} page
 * @param {string} outDir
 * @param {string} stateName
 * @param {string} viewportName
 * @param {{ expectTimerOverlay?: boolean }} [options]
 */
async function captureValidatedGameState(group, page, outDir, stateName, viewportName, options = {}) {
  const fb = await detectFallbackScreen(page, options)
  if (fb.fallback) {
    group.attempted += 1
    group.failedCaptures += 1
    const failRel = relShot(group.folder, `${stateName}-FALLBACK`, viewportName, 'viewport')
    group.skip(failRel, `timeout-fallback-screen: ${fb.reason}`)
    try {
      await captureViewport(page, shotPath(outDir, group.folder, `${stateName}-FALLBACK`, viewportName, 'viewport'))
      group.mark(failRel)
    } catch {}
    return false
  }

  await captureGameViewport(page, group, outDir, stateName, viewportName)
  group.validBoardCaptures += 1
  return true
}

/**
 * @param {import('playwright').Browser} browser
 * @param {ViewportDef} viewport
 * @param {WorkerGroup} group
 */
async function recreateGameWorkerPage(browser, viewport, group) {
  const { context, page } = await newPreparedPage(browser, viewport, group)
  await goto(page, '/')
  await waitForQaBridge(page)
  return { context, page, gameRouteReady: false }
}

/**
 * @param {WorkerGroup} group
 * @param {string} scenarioName
 * @param {() => Promise<void>} fn
 */
async function runScenario(group, scenarioName, fn) {
  console.log(`    → scenario: ${scenarioName}`)
  try {
    await withTimeout(fn(), SCENARIO_TIMEOUT_MS, `scenario:${scenarioName}`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    group.markFlaky(`scenario:${scenarioName}`, msg)
    console.warn(`[QA] scenario skipped: ${scenarioName} — ${msg}`)
  }
}

/**
 * @param {import('playwright').Page | undefined} page
 * @param {import('playwright').BrowserContext | undefined} context
 */
async function safeClose(page, context) {
  try {
    if (page && !page.isClosed()) await page.close({ runBeforeUnload: false })
  } catch {}
  try {
    if (context) await context.close()
  } catch {}
}

/**
 * @param {import('playwright').Browser} browser
 * @param {ViewportDef} viewport
 * @param {WorkerGroup} group
 */
async function newPreparedPage(browser, viewport, group) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  })
  context.setDefaultNavigationTimeout(NAV_TIMEOUT_MS)
  context.setDefaultTimeout(NAV_TIMEOUT_MS)
  const page = await context.newPage()
  page.setDefaultNavigationTimeout(NAV_TIMEOUT_MS)
  page.setDefaultTimeout(NAV_TIMEOUT_MS)
  attachPageListeners(group, page)
  await stabilizeAnimations(page)
  return { context, page }
}

/**
 * @param {import('playwright').Page} page
 */
async function waitForStable(page) {
  await page.waitForLoadState('domcontentloaded', { timeout: NAV_TIMEOUT_MS }).catch(() => {})
  await page.evaluate(() => document.fonts?.ready).catch(() => {})
  await sleep(200)
}

/**
 * @param {import('playwright').Page} page
 */
async function stabilizeAnimations(page) {
  await page
    .addStyleTag({
      content: `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-delay: 0s !important;
        transition-duration: 0.01ms !important;
      }
    `,
    })
    .catch(() => {})
}

/**
 * @param {import('playwright').Page} page
 */
async function waitForQaBridge(page) {
  await page
    .waitForFunction(() => Boolean(window.__PRR_QA__ || window.PRR_QA), undefined, { timeout: NAV_TIMEOUT_MS })
    .catch(() => {})
}

/**
 * @param {import('playwright').BrowserContext} context
 * @param {import('playwright').Page} page
 * @param {string} baseUrl
 */
async function clearBrowserStorage(context, page, baseUrl) {
  try {
    await context.clearCookies()
  } catch {}

  try {
    const currentUrl = page.url()
    if (!currentUrl || currentUrl === 'about:blank' || !currentUrl.startsWith(baseUrl)) {
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS })
    }
    await page.evaluate(() => {
      try {
        window.localStorage.clear()
      } catch {}
      try {
        window.sessionStorage.clear()
      } catch {}
    })
  } catch {}
}

/**
 * @param {import('playwright').Page} page
 * @param {string} filePath
 */
async function captureFullPage(page, filePath) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await page.screenshot({ path: filePath, fullPage: true, timeout: SCREENSHOT_TIMEOUT_MS })
}

/**
 * @param {import('playwright').Page} page
 * @param {ScrollPosition} position
 * @param {string} filePath
 */
async function captureViewportAt(page, position, filePath) {
  await mkdir(path.dirname(filePath), { recursive: true })
  const metrics = await page.evaluate(() => ({
    scrollHeight: Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight ?? 0),
    clientHeight: window.innerHeight,
  }))
  const maxScroll = Math.max(0, metrics.scrollHeight - metrics.clientHeight)
  const scrollable = maxScroll > 48
  let scrollY = 0
  if (position === 'middle' && scrollable) scrollY = Math.floor(maxScroll / 2)
  if (position === 'bottom' && scrollable) scrollY = maxScroll
  await page.evaluate((y) => window.scrollTo({ top: y, left: 0, behavior: 'instant' }), scrollY)
  await sleep(150)
  await page.screenshot({ path: filePath, fullPage: false, timeout: SCREENSHOT_TIMEOUT_MS })
  return { scrollable, maxScroll }
}

/**
 * @param {import('playwright').Page} page
 * @param {string} filePath
 */
async function captureViewport(page, filePath) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }))
  await sleep(100)
  await page.screenshot({ path: filePath, fullPage: false, timeout: SCREENSHOT_TIMEOUT_MS })
}

/**
 * @param {WorkerGroup} group
 * @param {import('playwright').Page} page
 * @param {string} outDir
 * @param {string} stateName
 * @param {string} viewportName
 * @param {() => Promise<void>} captureFn
 */
async function safeCapture(group, page, outDir, stateName, viewportName, captureFn) {
  group.attempted += 1
  const rel = relShot(group.folder, stateName, viewportName, 'viewport')
  try {
    await withTimeout(captureFn(), SCREENSHOT_TIMEOUT_MS, `screenshot:${stateName}`)
    group.mark(rel)
  } catch (err) {
    group.failedCaptures += 1
    const msg = err instanceof Error ? err.message : String(err)
    group.markFlaky(rel, msg)
    const failPath = shotPath(outDir, group.folder, `${stateName}-FAILURE`, viewportName, 'viewport')
    try {
      await page.screenshot({ path: failPath, fullPage: false, timeout: 5_000 })
      group.mark(relShot(group.folder, `${stateName}-FAILURE`, viewportName, 'viewport'))
    } catch {}
  }
}

async function capturePageSet(page, group, outDir, stateName, viewportName, options = {}) {
  const { includeFull = true, includeScroll = true } = options

  if (includeFull) {
    group.attempted += 1
    const fullPath = shotPath(outDir, group.folder, stateName, viewportName, 'full')
    try {
      await captureFullPage(page, fullPath)
      group.mark(relShot(group.folder, stateName, viewportName, 'full'))
    } catch (err) {
      group.failedCaptures += 1
      group.markFlaky(relShot(group.folder, stateName, viewportName, 'full'), String(err))
    }
  }

  if (!includeScroll) {
    await safeCapture(group, page, outDir, stateName, viewportName, async () => {
      await captureViewport(page, shotPath(outDir, group.folder, stateName, viewportName, 'viewport'))
    })
    return
  }

  group.attempted += 1
  const topPath = shotPath(outDir, group.folder, stateName, viewportName, 'top')
  try {
    const topMetrics = await captureViewportAt(page, 'top', topPath)
    group.mark(relShot(group.folder, stateName, viewportName, 'top'))
    if (!topMetrics.scrollable) {
      group.skipScroll(stateName, viewportName, 'Page height fits viewport — middle/bottom not captured')
      return
    }
    group.attempted += 2
    await captureViewportAt(page, 'middle', shotPath(outDir, group.folder, stateName, viewportName, 'middle'))
    group.mark(relShot(group.folder, stateName, viewportName, 'middle'))
    await captureViewportAt(page, 'bottom', shotPath(outDir, group.folder, stateName, viewportName, 'bottom'))
    group.mark(relShot(group.folder, stateName, viewportName, 'bottom'))
  } catch (err) {
    group.failedCaptures += 1
    group.markFlaky(relShot(group.folder, stateName, viewportName, 'top'), String(err))
  }
}

async function captureGameViewport(page, group, outDir, stateName, viewportName) {
  await safeCapture(group, page, outDir, stateName, viewportName, async () => {
    await captureViewport(page, shotPath(outDir, group.folder, stateName, viewportName, 'viewport'))
  })
}

/**
 * @param {import('playwright').Page} page
 * @param {string} urlPath
 */
async function goto(page, urlPath) {
  await page.goto(`${BASE_URL}${urlPath}`, {
    waitUntil: 'domcontentloaded',
    timeout: NAV_TIMEOUT_MS,
  })
  await waitForStable(page)
}

async function createLocalRoom(page, callsign = 'QA Captain') {
  await goto(page, '/play?create=1')
  await page.getByTestId('lobby-callsign-input').fill(callsign)
  await page.getByTestId('lobby-create-submit').click()
  await page.waitForURL('**/game', { timeout: NAV_TIMEOUT_MS }).catch(() => {})
  await waitForStable(page)
  await page.getByTestId('crew-briefing').waitFor({ timeout: NAV_TIMEOUT_MS }).catch(() => {})
}

async function startMission(page) {
  await page.getByTestId('waiting-room-start').click()
  await page.getByTestId('game-shell').waitFor({ timeout: NAV_TIMEOUT_MS }).catch(() => {})
  await waitForStable(page)
}

/**
 * @param {import('playwright').Browser} browser
 * @param {string} outDir
 * @returns {Promise<WorkerGroup>}
 */
async function runPublicLobbyWorker(browser, outDir) {
  const group = new WorkerGroup('Public & Lobby', WORKER_FOLDERS.publicLobby)
  group.assumptions.push(
    'Marketing/public pages: full + top/middle/bottom scroll capture on key viewports.',
    'Lobby uses local mode when Firebase env vars are absent.',
    'Host/non-host lobby views seeded via dev qaBridge where needed.',
  )

  console.log('[Worker 1] Public & Lobby')

  for (const [viewportKey, viewport] of Object.entries(PUBLIC_LOBBY_VIEWPORTS)) {
    console.log(`  viewport: ${viewportKey}`)
    group.viewportsUsed.push(viewportKey)
    let context
    let page

    try {
      ;({ context, page } = await newPreparedPage(browser, viewport, group))

      for (const route of PUBLIC_ROUTES) {
        await runScenario(group, `${viewportKey}/${route.state}`, async () => {
          await goto(page, route.path)
          await capturePageSet(page, group, outDir, route.state, viewportKey)
        })
      }

      await runScenario(group, `${viewportKey}/lobby-menu`, async () => {
        await goto(page, '/play')
        await capturePageSet(page, group, outDir, 'lobby-menu', viewportKey, { includeFull: false })
      })

      await runScenario(group, `${viewportKey}/lobby-local-mode-badge`, async () => {
        await goto(page, '/play')
        if (await page.getByText('Local Mode').isVisible().catch(() => false)) {
          await captureGameViewport(page, group, outDir, 'lobby-local-mode-badge', viewportKey)
        } else if (await page.getByText('Online Ready').isVisible().catch(() => false)) {
          await captureGameViewport(page, group, outDir, 'lobby-online-ready-badge', viewportKey)
          group.addNote('Firebase appears configured — captured Online Ready badge instead of Local Mode')
        } else {
          group.skip(relShot(group.folder, 'lobby-local-mode-badge', viewportKey, 'viewport'), 'Mode badge not visible')
        }
      })

      await runScenario(group, `${viewportKey}/lobby-create-form`, async () => {
        await goto(page, '/play?create=1')
        await capturePageSet(page, group, outDir, 'lobby-create-form', viewportKey, { includeFull: false })
      })

      await runScenario(group, `${viewportKey}/lobby-difficulty-crisis`, async () => {
        await goto(page, '/play?create=1')
        await page.getByRole('button', { name: 'Veteran' }).click().catch(() => {})
        await page.getByRole('checkbox', { name: /Crisis cards enabled/i }).check().catch(() => {})
        await sleep(150)
        await captureGameViewport(page, group, outDir, 'lobby-difficulty-crisis', viewportKey)
      })

      await runScenario(group, `${viewportKey}/lobby-join-form`, async () => {
        await goto(page, '/play?join=1')
        await capturePageSet(page, group, outDir, 'lobby-join-form', viewportKey, { includeFull: false })
      })

      await runScenario(group, `${viewportKey}/lobby-callsign-validation`, async () => {
        await goto(page, '/play?create=1')
        await page.getByTestId('lobby-create-submit').click()
        await sleep(200)
        if (await page.locator('.mission-room__error').isVisible().catch(() => false)) {
          await captureGameViewport(page, group, outDir, 'lobby-callsign-validation-error', viewportKey)
        } else {
          group.skip(relShot(group.folder, 'lobby-callsign-validation-error', viewportKey, 'viewport'), 'Validation message not visible')
        }
      })

      await runScenario(group, `${viewportKey}/lobby-join-validation`, async () => {
        await goto(page, '/play?join=1')
        await page.getByTestId('lobby-join-submit').click()
        await sleep(200)
        if (await page.locator('.mission-room__error').isVisible().catch(() => false)) {
          await captureGameViewport(page, group, outDir, 'lobby-join-validation-error', viewportKey)
        } else {
          group.skip(relShot(group.folder, 'lobby-join-validation-error', viewportKey, 'viewport'), 'Join validation message not visible')
        }
      })

      await runScenario(group, `${viewportKey}/lobby-invalid-room-code`, async () => {
        await goto(page, '/play?join=1')
        await page.getByTestId('lobby-callsign-input').fill('QA Joiner')
        await page.getByTestId('lobby-room-code-input').fill('ZZZZZZ')
        await page.getByTestId('lobby-join-submit').click()
        await sleep(400)
        if (await page.locator('.mission-room__error').isVisible().catch(() => false)) {
          await captureGameViewport(page, group, outDir, 'lobby-invalid-room-code', viewportKey)
        } else {
          group.markFlaky(relShot(group.folder, 'lobby-invalid-room-code', viewportKey, 'viewport'), 'Invalid room code error not shown in local mode')
        }
      })

      await runScenario(group, `${viewportKey}/crew-briefing-host`, async () => {
        await clearBrowserStorage(context, page, BASE_URL)
        await createLocalRoom(page, `QA Host ${viewportKey.slice(0, 4)}`)
        await captureGameViewport(page, group, outDir, 'crew-briefing-host', viewportKey)
      })

      await runScenario(group, `${viewportKey}/crew-briefing-wait-host`, async () => {
        await waitForQaBridge(page)
        await page.evaluate(() => {
          window.__PRR_QA__?.reset()
          window.__PRR_QA__?.seedWaitingForHost('QAWAIT')
        })
        await goto(page, '/game')
        if (await page.getByTestId('waiting-room-wait-host').isVisible({ timeout: NAV_TIMEOUT_MS }).catch(() => false)) {
          await captureGameViewport(page, group, outDir, 'crew-briefing-non-host-waiting', viewportKey)
        } else {
          group.skip(relShot(group.folder, 'crew-briefing-non-host-waiting', viewportKey, 'viewport'), 'Non-host waiting state not rendered')
        }
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      group.fail(`${viewportKey}: ${msg}`)
      console.warn(`[Worker 1] viewport ${viewportKey} failed: ${msg}`)
    } finally {
      await safeClose(page, context)
    }
  }

  group.status = group.failures.length ? 'partial' : 'completed'
  console.log('[Worker 1] completed')
  return group
}

/**
 * @param {import('playwright').Browser} browser
 * @param {string} outDir
 * @returns {Promise<WorkerGroup>}
 */
async function runGameStatesWorker(browser, outDir) {
  const group = new WorkerGroup('Game States', WORKER_FOLDERS.gameStates)
  group.assumptions.push(
    'Seeded states use dev-only __PRR_QA__.seedState() on desktop viewport.',
    'Missing/unimplemented seeds capture fallback + report note; run continues.',
    'AssetGate errors are captured and reported without hanging.',
  )

  console.log('[Worker 2] Game States')
  const viewportKey = 'desktop-1920x1080'
  group.viewportsUsed.push(viewportKey)

  let context
  let page

  try {
    ;({ context, page } = await newPreparedPage(browser, GAME_SEED_VIEWPORT, group))

    await runScenario(group, 'bootstrap-qa-bridge', async () => {
      await goto(page, '/')
      await waitForQaBridge(page)
      const bridgeOk = await safeEvaluate(page, () => Boolean(window.__PRR_QA__ || window.PRR_QA)).catch(() => false)
      group.qaBridgeStatus = bridgeOk ? 'available' : 'missing'
      if (!bridgeOk) {
        await captureGameViewport(page, group, outDir, 'qa-bridge-missing', viewportKey)
        group.fail('__PRR_QA__ bridge not available — is npm run dev running in DEV mode?')
        return
      }
      const status = await safeEvaluate(page, () => (window.__PRR_QA__ ?? window.PRR_QA)?.getStatus?.())
      if (status) {
        group.qaBridgeDetails = JSON.stringify(status, null, 2)
        group.addNote(`qaBridge exposes ${status.availableStates?.length ?? 0} seed states`)
      }
    })

    if (group.qaBridgeStatus === 'missing') {
      group.status = 'partial'
      console.log('[Worker 2] completed (qaBridge missing)')
      return group
    }

    let gameRouteReady = false

    for (const scenario of GAME_STATE_SCENARIOS) {
      await runScenario(group, scenario.id, async () => {
        try {
          if (page.isClosed()) {
            ;({ context, page, gameRouteReady } = await recreateGameWorkerPage(browser, GAME_SEED_VIEWPORT, group))
          }

          if (scenario.seed === 'supplySpillChoice') {
            const result = await safeEvaluate(page, () => (window.__PRR_QA__ ?? window.PRR_QA)?.seedState('supplySpillChoice'))
            if (!result) {
              group.markNotImplemented(scenario.id, 'Supply spill choice UI not seedable yet')
              const mount = await mountGameScenario(page, 'rolledDice', { navigateToGame: !gameRouteReady })
              gameRouteReady = true
              if (mount.mount.outcome === 'asset-gate') {
                group.qaBridgeStatus = 'asset-gate-error'
                group.fail('AssetGate error — missing required assets')
                return
              }
              await captureValidatedGameState(group, page, outDir, `${scenario.id}-fallback`, viewportKey, {
                expectTimerOverlay: Boolean(scenario.expectTimerOverlay),
              })
              return
            }
          }

          const mount = await mountGameScenario(page, scenario.seed, { navigateToGame: !gameRouteReady })
          gameRouteReady = true

          if (mount.status) {
            group.qaBridgeDetails = JSON.stringify(mount.status, null, 2)
          }

          if (!mount.ok) {
            group.markNotImplemented(scenario.id, mount.reason ?? `seedState('${scenario.seed}') failed`)
            await captureValidatedGameState(group, page, outDir, `${scenario.id}-fallback`, viewportKey, {
              expectTimerOverlay: Boolean(scenario.expectTimerOverlay),
            })
            return
          }

          if (mount.mount.outcome === 'asset-gate') {
            group.qaBridgeStatus = 'asset-gate-error'
            const missing = await page.locator('.asset-gate__list code').allTextContents().catch(() => [])
            group.missingAssets.push(...missing.slice(0, 12))
            await captureGameViewport(page, group, outDir, 'asset-gate-error', viewportKey)
            group.fail('AssetGate error — missing required assets')
            return
          }

          if (mount.mount.outcome === 'no-bridge') {
            group.qaBridgeStatus = 'missing'
            group.fail('qaBridge missing during scenario')
            return
          }

          if (mount.mount.outcome === 'page-closed') {
            group.fail(`${scenario.id}: page closed before capture`)
            return
          }

          if (mount.mount.outcome === 'timeout' || mount.mount.outcome === 'lobby-fallback') {
            await captureValidatedGameState(group, page, outDir, `${scenario.id}-FALLBACK`, viewportKey, {
              expectTimerOverlay: Boolean(scenario.expectTimerOverlay),
            })
            group.markNotImplemented(scenario.id, `timeout-fallback-screen (${mount.mount.outcome})`)
            return
          }

          await captureValidatedGameState(group, page, outDir, scenario.id, viewportKey, {
            expectTimerOverlay: Boolean(scenario.expectTimerOverlay),
          })
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          if (msg.includes('closed') || msg.includes('Closed')) {
            group.fail(`${scenario.id}: ${msg}`)
            try {
              ;({ context, page, gameRouteReady } = await recreateGameWorkerPage(browser, GAME_SEED_VIEWPORT, group))
            } catch {}
          } else {
            throw err
          }
        }
      })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    group.fail(msg)
    console.warn(`[Worker 2] failed: ${msg}`)
  } finally {
    await safeClose(page, context)
  }

  group.status = group.failures.length ? 'partial' : 'completed'
  console.log('[Worker 2] completed')
  return group
}

/**
 * @param {import('playwright').Browser} browser
 * @param {string} outDir
 * @returns {Promise<WorkerGroup>}
 */
async function runResponsiveA11yWorker(browser, outDir) {
  const group = new WorkerGroup('Responsive & Accessibility', WORKER_FOLDERS.responsiveA11y)
  group.assumptions.push(
    'Portrait rotate prompt when portrait AND width ≤ 1100px.',
    'Focus ring shots on desktop; layout checks on phone/tablet viewports.',
  )

  console.log('[Worker 3] Responsive & Accessibility')

  for (const [viewportKey, viewport] of Object.entries(RESPONSIVE_A11Y_VIEWPORTS)) {
    console.log(`  viewport: ${viewportKey}`)
    group.viewportsUsed.push(viewportKey)
    let context
    let page

    try {
      ;({ context, page } = await newPreparedPage(browser, viewport, group))

      await runScenario(group, `${viewportKey}/home`, async () => {
        await goto(page, '/')
        await captureGameViewport(page, group, outDir, 'responsive-home', viewportKey)
      })

      await runScenario(group, `${viewportKey}/lobby`, async () => {
        await goto(page, '/play')
        await captureGameViewport(page, group, outDir, 'responsive-lobby', viewportKey)
      })

      await runScenario(group, `${viewportKey}/game-board`, async () => {
        await goto(page, '/')
        const mount = await mountGameScenario(page, 'rolledDice', { navigateToGame: true })
        if (mount.mount.outcome === 'game-shell') {
          await captureValidatedGameState(group, page, outDir, 'responsive-game-board', viewportKey)
        } else if (mount.mount.outcome === 'asset-gate') {
          group.skip(relShot(group.folder, 'responsive-game-board', viewportKey, 'viewport'), 'AssetGate blocked game shell')
        } else {
          group.skip(relShot(group.folder, 'responsive-game-board', viewportKey, 'viewport'), `Game shell not visible (${mount.mount.outcome})`)
        }
      })

      if (viewport.portrait) {
        await runScenario(group, `${viewportKey}/rotate-prompt-lobby`, async () => {
          await goto(page, '/play')
          const prompt = page.getByTestId('portrait-rotate-prompt')
          if (await prompt.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await captureGameViewport(page, group, outDir, 'rotate-prompt-lobby', viewportKey)
          } else {
            group.skip(relShot(group.folder, 'rotate-prompt-lobby', viewportKey, 'viewport'), 'Portrait prompt not shown')
          }
        })

        await runScenario(group, `${viewportKey}/rotate-prompt-game`, async () => {
          await goto(page, '/')
          const mount = await mountGameScenario(page, 'rolledDice', { navigateToGame: true })
          if (mount.mount.outcome !== 'game-shell') {
            group.skip(relShot(group.folder, 'rotate-prompt-game', viewportKey, 'viewport'), `Game not mounted (${mount.mount.outcome})`)
            return
          }
          const prompt = page.getByTestId('portrait-rotate-prompt')
          if (await prompt.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await captureGameViewport(page, group, outDir, 'rotate-prompt-game', viewportKey)
          } else {
            group.skip(relShot(group.folder, 'rotate-prompt-game', viewportKey, 'viewport'), 'Portrait prompt not visible on /game')
          }
        })
      }

      if (viewportKey === 'desktop-1920x1080') {
        await runScenario(group, `${viewportKey}/focus-header-nav`, async () => {
          await goto(page, '/')
          const navLink = page.getByRole('link', { name: 'How to Play' }).first()
          if (await navLink.isVisible().catch(() => false)) {
            await navLink.focus()
            await sleep(120)
            await captureGameViewport(page, group, outDir, 'focus-header-nav', viewportKey)
          } else {
            group.skip(relShot(group.folder, 'focus-header-nav', viewportKey, 'viewport'), 'Header nav link not found')
          }
        })

        await runScenario(group, `${viewportKey}/focus-start-mission`, async () => {
          await goto(page, '/')
          await page.getByTestId('landing-start-mission').focus()
          await sleep(120)
          await captureGameViewport(page, group, outDir, 'focus-start-mission', viewportKey)
        })

        await runScenario(group, `${viewportKey}/focus-join-room`, async () => {
          await goto(page, '/play')
          await page.getByRole('button', { name: 'Join Room' }).focus()
          await sleep(120)
          await captureGameViewport(page, group, outDir, 'focus-join-room', viewportKey)
        })

        await runFocusScenario(group, `${viewportKey}/focus-dice-and-end-turn`, async () => {
          await goto(page, '/')
          const mount = await mountGameScenario(page, 'selectedDice', { navigateToGame: true })
          if (mount.mount.outcome !== 'game-shell') {
            group.skip(relShot(group.folder, 'focus-dice', viewportKey, 'viewport'), `Board not mounted (${mount.mount.outcome})`)
            return
          }
          const die = page.locator('.game-die').first()
          if (await die.isVisible().catch(() => false)) {
            await die.focus().catch(() => {})
            await sleep(100)
            await captureGameViewport(page, group, outDir, 'focus-dice', viewportKey)
          }
          const endTurn = page.getByRole('button', { name: 'End Turn' })
          if (await endTurn.isVisible().catch(() => false)) {
            await endTurn.focus()
            await sleep(100)
            await captureGameViewport(page, group, outDir, 'focus-end-turn', viewportKey)
          }
        })

        await runFocusScenario(group, `${viewportKey}/focus-confirm-cancel`, async () => {
          await goto(page, '/')
          const mount = await mountGameScenario(page, 'pendingMove', { navigateToGame: true })
          if (mount.mount.outcome !== 'game-shell') {
            group.skip(relShot(group.folder, 'focus-confirm-action', viewportKey, 'viewport'), `Board not mounted (${mount.mount.outcome})`)
            return
          }
          const confirm = page.getByTestId('confirm-action')
          if (await confirm.isVisible().catch(() => false)) {
            await confirm.focus()
            await sleep(100)
            await captureGameViewport(page, group, outDir, 'focus-confirm-action', viewportKey)
          }
          const cancel = page.getByTestId('confirm-cancel')
          if (await cancel.isVisible().catch(() => false)) {
            await cancel.focus()
            await sleep(100)
            await captureGameViewport(page, group, outDir, 'focus-confirm-cancel', viewportKey)
          }
        })

        await runFocusScenario(group, `${viewportKey}/error-toast-readable`, async () => {
          await goto(page, '/')
          const mount = await mountGameScenario(page, 'error-toast-visible', { navigateToGame: true })
          if (mount.mount.outcome !== 'game-shell') {
            group.skip(relShot(group.folder, 'error-toast-readable', viewportKey, 'viewport'), `Board not mounted (${mount.mount.outcome})`)
            return
          }
          if (await page.getByTestId('game-error-toast').isVisible({ timeout: 5_000 }).catch(() => false)) {
            await captureGameViewport(page, group, outDir, 'error-toast-readable', viewportKey)
          }
        })

        await runFocusScenario(group, `${viewportKey}/pending-confirm-readable`, async () => {
          await goto(page, '/')
          const mount = await mountGameScenario(page, 'pendingAssign', { navigateToGame: true })
          if (mount.mount.outcome !== 'game-shell') {
            group.skip(relShot(group.folder, 'pending-confirm-readable', viewportKey, 'viewport'), `Board not mounted (${mount.mount.outcome})`)
            return
          }
          if (await page.getByTestId('confirm-action').isVisible({ timeout: 5_000 }).catch(() => false)) {
            await captureGameViewport(page, group, outDir, 'pending-confirm-readable', viewportKey)
          }
        })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      group.fail(`${viewportKey}: ${msg}`)
      console.warn(`[Worker 3] viewport ${viewportKey} failed: ${msg}`)
    } finally {
      await safeClose(page, context)
    }
  }

  group.status = group.failures.length ? 'partial' : 'completed'
  console.log('[Worker 3] completed')
  return group
}

/**
 * @param {string} workerLabel
 * @param {string} workerName
 * @param {RunState} runState
 * @param {() => Promise<WorkerGroup>} fn
 */
async function executeWorker(workerLabel, workerName, runState, fn) {
  runState.activeWorkers.add(workerName)
  try {
    const group = await withTimeout(fn(), WORKER_TIMEOUT_MS, workerName)
    group.status = group.status === 'pending' ? 'completed' : group.status
    return { ok: true, group }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    runState.failures.push(`${workerName}: ${msg}`)
    console.error(`[Worker ${workerLabel}] failed: ${msg}`)
    const fallback = new WorkerGroup(workerName, WORKER_NAME_TO_FOLDER[workerName] ?? workerName)
    fallback.status = 'failed'
    fallback.fail(msg)
    return { ok: false, group: fallback }
  } finally {
    runState.activeWorkers.delete(workerName)
  }
}

/**
 * @param {WorkerGroup} group
 * @param {string} outDir
 */
async function writeWorkerReport(group, outDir) {
  const body = `# ${group.title} — QA Report

- **Status:** ${group.status}
- **Folder:** \`${group.folder}/\`
- **Duration:** ${formatDuration(group.durationMs())}
- **Screenshots attempted:** ${group.attempted}
- **Screenshots captured:** ${group.captured.length}
- **Valid board-state captures:** ${group.validBoardCaptures}
- **Screenshot failures:** ${group.failedCaptures}
- **Skipped states:** ${group.skipped.length}
- **Not implemented / fallback:** ${group.notImplemented.length}
- **qaBridge status:** ${group.qaBridgeStatus}

${group.qaBridgeDetails ? `### qaBridge details\n\n\`\`\`json\n${group.qaBridgeDetails}\n\`\`\`\n` : ''}

${group.viewportsUsed.map((v) => `- \`${v}\``).join('\n') || '_None_'}

## Captured files

${group.captured.map((f) => `- \`${f}\``).join('\n') || '_None_'}

## Skipped / unreachable

${group.skipped.join('\n') || '_None_'}

## Not implemented

${group.notImplemented.join('\n') || '_None_'}

## Flaky / timing-dependent

${group.flakyList.join('\n') || '_None_'}

## Worker failures

${group.failures.join('\n') || '_None_'}

## Console errors

${group.consoleErrors.length ? group.consoleErrors.map((e) => `- \`${e.slice(0, 200)}\``).join('\n') : '_None_'}

## Page errors

${group.pageErrors.length ? group.pageErrors.map((e) => `- \`${e.slice(0, 200)}\``).join('\n') : '_None_'}

## Missing assets (AssetGate)

${group.missingAssets.length ? group.missingAssets.map((a) => `- \`${a}\``).join('\n') : '_None detected_'}

## Notes / recommendations

${group.notes.join('\n') || '_None_'}

## Assumptions

${group.assumptions.map((a) => `- ${a}`).join('\n')}
`

  await writeFile(path.join(outDir, group.folder, 'report.md'), body, 'utf8')
}

/**
 * @param {Record<string, WorkerGroup>} workers
 * @param {{ branch: string, commit: string }} git
 * @param {string} outDir
 * @param {RunState} runState
 */
async function writeReports(workers, git, outDir, runState) {
  const started = new Date().toISOString()
  const viewportList = Object.entries(VIEWPORTS)
    .map(([key, v]) => `- \`${key}\` — ${v.width}×${v.height}${v.portrait ? ' (portrait)' : ''}`)
    .join('\n')

  for (const w of Object.values(workers)) {
    await writeWorkerReport(w, outDir)
  }

  const totalCaptured = Object.values(workers).reduce((n, w) => n + w.captured.length, 0)
  const totalAttempted = Object.values(workers).reduce((n, w) => n + w.attempted, 0)
  const totalSkipped = Object.values(workers).reduce((n, w) => n + w.skipped.length, 0)
  const totalFailures = Object.values(workers).reduce((n, w) => n + w.failures.length, 0)
  const totalNotImplemented = Object.values(workers).reduce((n, w) => n + w.notImplemented.length, 0)
  const warnings = [
    ...Object.values(workers).flatMap((w) => w.flakyList),
    ...Object.values(workers).flatMap((w) => w.notImplemented),
  ]

  const recommendations = []
  if (workers.gameStates.qaBridgeStatus === 'missing') {
    recommendations.push('Start dev server with `npm run dev` so qaBridge.dev.ts loads.')
  }
  if (workers.gameStates.missingAssets.length) {
    recommendations.push('Run asset copy scripts: `node scripts/copy-prr-assets.mjs && node scripts/reorganize-prr-assets.mjs`')
  }
  if (totalNotImplemented > 0) {
    recommendations.push('Review not-implemented seeds in game-states/report.md and extend qaSeeds.dev.ts.')
  }
  if (runState.globalTimedOut) {
    recommendations.push('Increase PRR_QA_GLOBAL_TIMEOUT_MS or PRR_QA_WORKER_TIMEOUT_MS if runs time out.')
  }

  const summary = `# PRR QA Screenshot Summary

Same QA discipline as Teacher CV Hub, but PRR coverage is **board-game coverage** (public/lobby, game states, timer/action, responsive/a11y) — not dashboard coverage.

- **Generated:** ${started}
- **Branch:** \`${git.branch}\` · **Commit:** \`${git.commit}\`
- **Base URL:** \`${BASE_URL}\`
- **Output folder:** \`qa-screenshots/${path.basename(outDir)}/\`
- **Global timed out:** ${runState.globalTimedOut ? 'yes' : 'no'}

## Totals

| Metric | Count |
|--------|------:|
| Screenshots captured | ${totalCaptured} |
| Screenshots attempted | ${totalAttempted} |
| Skipped states | ${totalSkipped} |
| Worker failures | ${totalFailures} |
| Warnings (flaky + not implemented) | ${warnings.length} |

## Workers

| Worker | Folder | Status | Captured | Report |
|--------|--------|--------|----------|--------|
| 1 — Public & Lobby | \`public-lobby/\` | ${workers.publicLobby.status} | ${workers.publicLobby.captured.length} | [report.md](public-lobby/report.md) |
| 2 — Game States | \`game-states/\` | ${workers.gameStates.status} | ${workers.gameStates.captured.length} | [report.md](game-states/report.md) |
| 3 — Responsive & A11y | \`responsive-a11y/\` | ${workers.responsiveA11y.status} | ${workers.responsiveA11y.captured.length} | [report.md](responsive-a11y/report.md) |

## Run failures

${runState.failures.length ? runState.failures.map((f) => `- ${f}`).join('\n') : '_None_'}

## Viewports

${viewportList}

## Next recommended fixes

${recommendations.length ? recommendations.map((r) => `- ${r}`).join('\n') : '_None — review per-worker reports for flaky captures._'}

## Command

\`\`\`bash
npm run dev
npm run qa:screenshots
\`\`\`

Per-worker details: \`public-lobby/report.md\`, \`game-states/report.md\`, \`responsive-a11y/report.md\`.
`

  await writeFile(path.join(outDir, '00-summary.md'), summary, 'utf8')
}

async function assertDevServerUp() {
  try {
    const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(5_000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  } catch (err) {
    console.error(`\n❌ Dev server not reachable at ${BASE_URL}`)
    console.error('   Start it first: npm run dev\n')
    process.exit(1)
  }
}

async function loadPlaywright() {
  try {
    return await import('playwright')
  } catch {
    console.error('\n❌ Playwright is not installed.')
    console.error('   Run: npm install && npx playwright install chromium\n')
    process.exit(1)
  }
}

function parseWorkerFilter() {
  const raw = process.env.PRR_QA_WORKERS
  if (!raw) return new Set([1, 2, 3])
  return new Set(raw.split(',').map((s) => Number(s.trim())).filter((n) => n >= 1 && n <= 3))
}

async function main() {
  const runState = new RunState()
  let browser = null
  let outDir = ''
  let exitCode = 0

  runState.startHeartbeat()

  try {
    await assertDevServerUp()
    const { chromium } = await loadPlaywright()

    const runFolder = makeRunFolderName()
    outDir = path.join(ROOT, 'qa-screenshots', runFolder)
    await mkdir(outDir, { recursive: true })
    for (const folder of Object.values(WORKER_FOLDERS)) {
      await mkdir(path.join(outDir, folder), { recursive: true })
    }

    const git = gitInfo()
    const workerFilter = parseWorkerFilter()

    console.log(`\nPRR QA screenshots → ${path.relative(ROOT, outDir)}`)
    console.log(`Workers: ${[...workerFilter].sort().join(', ')}\n`)

    browser = await chromium.launch({ headless: true })

    /** @type {Record<string, WorkerGroup>} */
    const workers = {
      publicLobby: new WorkerGroup('Public & Lobby', WORKER_FOLDERS.publicLobby),
      gameStates: new WorkerGroup('Game States', WORKER_FOLDERS.gameStates),
      responsiveA11y: new WorkerGroup('Responsive & Accessibility', WORKER_FOLDERS.responsiveA11y),
    }

    const workerJobs = []
    if (workerFilter.has(1)) {
      workerJobs.push({ key: 'publicLobby', label: '1', name: 'public-lobby', fn: () => runPublicLobbyWorker(browser, outDir) })
    }
    if (workerFilter.has(2)) {
      workerJobs.push({ key: 'gameStates', label: '2', name: 'game-states', fn: () => runGameStatesWorker(browser, outDir) })
    }
    if (workerFilter.has(3)) {
      workerJobs.push({ key: 'responsiveA11y', label: '3', name: 'responsive-a11y', fn: () => runResponsiveA11yWorker(browser, outDir) })
    }

    const results = await withTimeout(
      Promise.allSettled(workerJobs.map((job) => executeWorker(job.label, job.name, runState, job.fn))),
      GLOBAL_TIMEOUT_MS,
      'global QA run',
    ).catch((err) => {
      runState.globalTimedOut = true
      runState.failures.push(err instanceof Error ? err.message : String(err))
      exitCode = 1
      return []
    })

    if (Array.isArray(results)) {
      for (let i = 0; i < results.length; i++) {
        const settled = results[i]
        const job = workerJobs[i]
        if (!job) continue
        if (settled.status === 'fulfilled') {
          workers[job.key] = settled.value.group
          if (!settled.value.ok) exitCode = 1
        } else {
          exitCode = 1
          runState.failures.push(`${job.name}: ${settled.reason}`)
          workers[job.key].status = 'failed'
          workers[job.key].fail(String(settled.reason))
        }
      }
    }

    if (runState.failures.length) exitCode = 1

    await writeReports(workers, git, outDir, runState)

    const total = Object.values(workers).reduce((n, w) => n + w.captured.length, 0)
    console.log(`\nDone. ${total} screenshots captured.`)
    console.log(`Output: qa-screenshots/${path.basename(outDir)}/00-summary.md\n`)
  } catch (err) {
    exitCode = 1
    runState.failures.push(`fatal: ${err instanceof Error ? err.message : String(err)}`)
    if (outDir) {
      await writeReports(
        {
          publicLobby: new WorkerGroup('Public & Lobby', WORKER_FOLDERS.publicLobby),
          gameStates: new WorkerGroup('Game States', WORKER_FOLDERS.gameStates),
          responsiveA11y: new WorkerGroup('Responsive & Accessibility', WORKER_FOLDERS.responsiveA11y),
        },
        gitInfo(),
        outDir,
        runState,
      ).catch(() => {})
    }
  } finally {
    runState.stopHeartbeat()
    if (browser) await browser.close().catch(() => {})
    process.exitCode = exitCode
  }
}

main()
