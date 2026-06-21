#!/usr/bin/env node
/**
 * PRR Phase 1 — Playwright screenshot QA runner (3 workers)
 *
 * Prerequisite: dev server at http://localhost:5173
 *   npm run dev
 *
 * Run:
 *   npm install
 *   npx playwright install chromium
 *   npm run qa:screenshots
 *
 * Optional: PRR_QA_WORKERS=1,2,3  (subset of workers)
 */

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const BASE_URL = process.env.PRR_QA_BASE_URL ?? 'http://localhost:5173'

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

/** @type {Record<string, ViewportDef>} */
const PUBLIC_LOBBY_VIEWPORTS = { ...VIEWPORTS }

/** @type {Record<string, ViewportDef>} */
const GAME_VIEWPORTS = {
  'desktop-1920x1080': VIEWPORTS['desktop-1920x1080'],
  'laptop-1440x900': VIEWPORTS['laptop-1440x900'],
  'ipad-landscape-1366x1024': VIEWPORTS['ipad-landscape-1366x1024'],
  'iphone-12-landscape-844x390': VIEWPORTS['iphone-12-landscape-844x390'],
}

/** @type {Record<string, ViewportDef>} */
const RESPONSIVE_A11Y_VIEWPORTS = {
  'desktop-1920x1080': VIEWPORTS['desktop-1920x1080'],
  'ipad-portrait-1024x1366': VIEWPORTS['ipad-portrait-1024x1366'],
  'ipad-landscape-1366x1024': VIEWPORTS['ipad-landscape-1366x1024'],
  'iphone-12-portrait-390x844': VIEWPORTS['iphone-12-portrait-390x844'],
  'iphone-12-landscape-844x390': VIEWPORTS['iphone-12-landscape-844x390'],
}

const PUBLIC_ROUTES = [
  { path: '/', state: 'home' },
  { path: '/rules', state: 'rules' },
  { path: '/how-to-play', state: 'how-to-play' },
  { path: '/about', state: 'about' },
  { path: '/faq', state: 'faq' },
  { path: '/roles', state: 'roles' },
]

const WORKER_FOLDERS = {
  publicLobby: 'public-lobby',
  gameStates: 'game-states',
  responsiveA11y: 'responsive-a11y',
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

class WorkerGroup {
  /**
   * @param {string} title
   * @param {string} folder
   */
  constructor(title, folder) {
    this.title = title
    this.folder = folder
    /** @type {string[]} */
    this.captured = []
    /** @type {string[]} */
    this.skipped = []
    /** @type {string[]} */
    this.skippedScroll = []
    /** @type {string[]} */
    this.flaky = []
    /** @type {string[]} */
    this.assumptions = []
  }

  /** @param {string} relPath */
  mark(relPath) {
    this.captured.push(`- \`${relPath}\``)
  }

  /**
   * @param {string} relPath
   * @param {string} note
   */
  skip(relPath, note) {
    this.skipped.push(`- \`${relPath}\` — ${note}`)
  }

  /**
   * @param {string} stateName
   * @param {string} viewportName
   * @param {string} note
   */
  skipScroll(stateName, viewportName, note) {
    this.skippedScroll.push(`- \`${stateName}_${viewportName}\` middle/bottom — ${note}`)
  }

  /**
   * @param {string} relPath
   * @param {string} note
   */
  flaky(relPath, note) {
    this.flaky.push(`- \`${relPath}\` — ${note}`)
  }
}

/**
 * @param {import('playwright').Page} page
 */
async function waitForStable(page) {
  await page.waitForLoadState('domcontentloaded')
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
  await page.evaluate(() => document.fonts?.ready).catch(() => {})
  await page.waitForTimeout(250)
}

/**
 * @param {import('playwright').Page} page
 */
async function stabilizeAnimations(page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-delay: 0s !important;
        transition-duration: 0.01ms !important;
      }
    `,
  })
}

/**
 * @param {import('playwright').Page} page
 */
async function waitForQaBridge(page) {
  await page.waitForFunction(() => Boolean(window.__PRR_QA__), undefined, {
    timeout: 15_000,
  })
}

/**
 * @param {import('playwright').Page} page
 */
async function clearBrowserStorage(page) {
  await page.context().clearCookies()
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
}

/**
 * @param {import('playwright').Page} page
 * @param {string} filePath
 */
async function captureFullPage(page, filePath) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await page.screenshot({ path: filePath, fullPage: true })
}

/**
 * @param {import('playwright').Page} page
 * @param {ScrollPosition} position
 * @param {string} filePath
 */
async function captureViewportAt(page, position, filePath) {
  await mkdir(path.dirname(filePath), { recursive: true })

  const metrics = await page.evaluate(() => ({
    scrollHeight: Math.max(
      document.documentElement.scrollHeight,
      document.body?.scrollHeight ?? 0,
    ),
    clientHeight: window.innerHeight,
  }))

  const maxScroll = Math.max(0, metrics.scrollHeight - metrics.clientHeight)
  const scrollable = maxScroll > 48

  let scrollY = 0
  if (position === 'middle' && scrollable) scrollY = Math.floor(maxScroll / 2)
  if (position === 'bottom' && scrollable) scrollY = maxScroll

  await page.evaluate((y) => window.scrollTo({ top: y, left: 0, behavior: 'instant' }), scrollY)
  await page.waitForTimeout(180)
  await page.screenshot({ path: filePath, fullPage: false })

  return { scrollable, maxScroll }
}

/**
 * @param {import('playwright').Page} page
 * @param {string} filePath
 */
async function captureViewport(page, filePath) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }))
  await page.waitForTimeout(120)
  await page.screenshot({ path: filePath, fullPage: false })
}

/**
 * @param {import('playwright').Page} page
 * @param {WorkerGroup} group
 * @param {string} outDir
 * @param {string} stateName
 * @param {string} viewportName
 * @param {{ includeFull?: boolean, includeScroll?: boolean }} [options]
 */
async function capturePageSet(page, group, outDir, stateName, viewportName, options = {}) {
  const { includeFull = true, includeScroll = true } = options

  if (includeFull) {
    const fullPath = shotPath(outDir, group.folder, stateName, viewportName, 'full')
    await captureFullPage(page, fullPath)
    group.mark(relShot(group.folder, stateName, viewportName, 'full'))
  }

  if (!includeScroll) {
    const vpPath = shotPath(outDir, group.folder, stateName, viewportName, 'viewport')
    await captureViewport(page, vpPath)
    group.mark(relShot(group.folder, stateName, viewportName, 'viewport'))
    return
  }

  const topPath = shotPath(outDir, group.folder, stateName, viewportName, 'top')
  const topMetrics = await captureViewportAt(page, 'top', topPath)
  group.mark(relShot(group.folder, stateName, viewportName, 'top'))

  if (!topMetrics.scrollable) {
    group.skipScroll(
      stateName,
      viewportName,
      'Page height fits viewport — middle/bottom not captured',
    )
    return
  }

  const middlePath = shotPath(outDir, group.folder, stateName, viewportName, 'middle')
  await captureViewportAt(page, 'middle', middlePath)
  group.mark(relShot(group.folder, stateName, viewportName, 'middle'))

  const bottomPath = shotPath(outDir, group.folder, stateName, viewportName, 'bottom')
  await captureViewportAt(page, 'bottom', bottomPath)
  group.mark(relShot(group.folder, stateName, viewportName, 'bottom'))
}

/**
 * @param {import('playwright').Page} page
 * @param {WorkerGroup} group
 * @param {string} outDir
 * @param {string} stateName
 * @param {string} viewportName
 */
async function captureGameViewport(page, group, outDir, stateName, viewportName) {
  const filePath = shotPath(outDir, group.folder, stateName, viewportName, 'viewport')
  await captureViewport(page, filePath)
  group.mark(relShot(group.folder, stateName, viewportName, 'viewport'))
}

/**
 * @param {import('playwright').Page} page
 * @param {string} urlPath
 */
async function goto(page, urlPath) {
  await page.goto(`${BASE_URL}${urlPath}`, { waitUntil: 'domcontentloaded' })
  await waitForStable(page)
}

/**
 * @param {import('playwright').Browser} browser
 * @param {ViewportDef} viewport
 */
async function newPreparedPage(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()
  await stabilizeAnimations(page)
  return { context, page }
}

/**
 * @param {import('playwright').Page} page
 * @param {string} [callsign]
 */
async function createLocalRoom(page, callsign = 'QA Captain') {
  await goto(page, '/play?create=1')
  await page.getByTestId('lobby-callsign-input').fill(callsign)
  await page.getByTestId('lobby-create-submit').click()
  await page.waitForURL('**/game', { timeout: 15_000 })
  await waitForStable(page)
  await page.getByTestId('crew-briefing').waitFor({ timeout: 15_000 })
}

/**
 * @param {import('playwright').Page} page
 */
async function startMission(page) {
  await page.getByTestId('waiting-room-start').click()
  await page.getByTestId('game-shell').waitFor({ timeout: 20_000 })
  await waitForStable(page)
}

/**
 * @param {import('playwright').Page} page
 */
async function rollDiceIfNeeded(page) {
  const rollBtn = page.getByRole('button', { name: 'Roll Dice' })
  if (await rollBtn.isVisible().catch(() => false)) {
    await rollBtn.click()
    await waitForStable(page)
    await page.waitForTimeout(400)
  }
}

/**
 * @param {import('playwright').Browser} browser
 * @param {string} outDir
 * @returns {Promise<WorkerGroup>}
 */
async function runPublicLobbyWorker(browser, outDir) {
  const group = new WorkerGroup('Public & Lobby', WORKER_FOLDERS.publicLobby)
  group.assumptions.push(
    'Marketing/public pages use full + top/middle/bottom scroll capture.',
    'Lobby modals and crew briefing use scroll capture when content exceeds viewport.',
    'Local mode used when Firebase env vars are absent.',
  )

  console.log('[Worker 1] Public & Lobby')

  for (const [viewportKey, viewport] of Object.entries(PUBLIC_LOBBY_VIEWPORTS)) {
    console.log(`  viewport: ${viewportKey}`)
    const { context, page } = await newPreparedPage(browser, viewport)

    try {
      for (const route of PUBLIC_ROUTES) {
        await goto(page, route.path)
        await capturePageSet(page, group, outDir, route.state, viewportKey)
      }

      await goto(page, '/play')
      await capturePageSet(page, group, outDir, 'lobby-menu', viewportKey)

      await goto(page, '/play?create=1')
      await capturePageSet(page, group, outDir, 'lobby-create-form', viewportKey)

      await goto(page, '/play?join=1')
      await capturePageSet(page, group, outDir, 'lobby-join-form', viewportKey)

      await goto(page, '/play?create=1')
      await page.getByTestId('lobby-create-submit').click()
      await page.waitForTimeout(200)
      if (await page.locator('.mission-room__error').isVisible().catch(() => false)) {
        await capturePageSet(page, group, outDir, 'lobby-callsign-validation-error', viewportKey, {
          includeFull: false,
        })
      } else {
        group.skip(
          relShot(group.folder, 'lobby-callsign-validation-error', viewportKey, 'top'),
          'Validation message not visible after empty submit',
        )
      }

      await goto(page, '/play?join=1')
      await page.getByTestId('lobby-join-submit').click()
      await page.waitForTimeout(200)
      if (await page.locator('.mission-room__error').isVisible().catch(() => false)) {
        await capturePageSet(page, group, outDir, 'lobby-join-validation-error', viewportKey, {
          includeFull: false,
        })
      } else {
        group.skip(
          relShot(group.folder, 'lobby-join-validation-error', viewportKey, 'top'),
          'Join validation message not visible',
        )
      }

      let caughtConnecting = false
      await goto(page, '/play?create=1')
      await page.getByTestId('lobby-callsign-input').fill('QA Loader')
      const submit = page.getByTestId('lobby-create-submit')
      await submit.click()
      for (let i = 0; i < 10; i++) {
        const text = await submit.innerText().catch(() => '')
        if (text.includes('Connecting')) {
          await captureGameViewport(page, group, outDir, 'lobby-create-connecting', viewportKey)
          caughtConnecting = true
          break
        }
        await page.waitForTimeout(40)
      }
      if (!caughtConnecting) {
        group.flaky(
          relShot(group.folder, 'lobby-create-connecting', viewportKey, 'viewport'),
          'Local room creation too fast to capture Connecting… label',
        )
      }

      await clearBrowserStorage(page)
      await createLocalRoom(page, `QA ${viewportKey.slice(0, 6)}`)
      await capturePageSet(page, group, outDir, 'crew-briefing-host', viewportKey, {
        includeFull: false,
      })

      await page.getByTestId('waiting-room-copy-code').click()
      await page.waitForTimeout(350)
      if (await page.getByText('Copied!').isVisible().catch(() => false)) {
        await captureGameViewport(page, group, outDir, 'crew-briefing-code-copied', viewportKey)
      } else {
        group.skip(
          relShot(group.folder, 'crew-briefing-code-copied', viewportKey, 'viewport'),
          'Copy feedback not visible',
        )
      }

      await waitForQaBridge(page)
      await page.evaluate(() => {
        window.__PRR_QA__?.reset()
        window.__PRR_QA__?.seedWaitingForHost('QAWAIT')
      })
      await goto(page, '/game')
      const waitHost = page.getByTestId('waiting-room-wait-host')
      if (await waitHost.isVisible({ timeout: 10_000 }).catch(() => false)) {
        await capturePageSet(page, group, outDir, 'crew-briefing-wait-host', viewportKey, {
          includeFull: false,
        })
      } else {
        group.skip(
          relShot(group.folder, 'crew-briefing-wait-host', viewportKey, 'top'),
          'Waiting-for-host state not rendered (seed via __PRR_QA__ failed or redirected)',
        )
      }

      let caughtLaunching = false
      await clearBrowserStorage(page)
      await createLocalRoom(page, 'QA Launch')
      const startBtn = page.getByTestId('waiting-room-start')
      await startBtn.click()
      for (let i = 0; i < 12; i++) {
        const text = await startBtn.innerText().catch(() => '')
        if (text.includes('Launching')) {
          await captureGameViewport(page, group, outDir, 'start-mission-launching', viewportKey)
          caughtLaunching = true
          break
        }
        await page.waitForTimeout(30)
      }
      if (!caughtLaunching) {
        group.flaky(
          relShot(group.folder, 'start-mission-launching', viewportKey, 'viewport'),
          'Local startGameLocal completes before Launching… is visible',
        )
      }
    } finally {
      await context.close()
    }
  }

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
    'Game states use viewport-only capture (game shell should fit without page scroll).',
    'Error toast, action pending, and game end are seeded via dev __PRR_QA__ bridge.',
  )

  console.log('[Worker 2] Game States')

  for (const [viewportKey, viewport] of Object.entries(GAME_VIEWPORTS)) {
    console.log(`  viewport: ${viewportKey}`)
    const { context, page } = await newPreparedPage(browser, viewport)

    try {
      await clearBrowserStorage(page)
      await createLocalRoom(page, `QA Game ${viewportKey.slice(-4)}`)
      await startMission(page)

      await captureGameViewport(page, group, outDir, 'active-game-board-roll-step', viewportKey)
      await captureGameViewport(page, group, outDir, 'mission-header-hud', viewportKey)
      await captureGameViewport(page, group, outDir, 'dice-dock-roll-step', viewportKey)

      await rollDiceIfNeeded(page)
      await captureGameViewport(page, group, outDir, 'active-game-board-after-roll', viewportKey)
      await captureGameViewport(page, group, outDir, 'dice-dock-after-roll', viewportKey)

      const firstDie = page.locator('.game-die').first()
      if (await firstDie.isVisible().catch(() => false)) {
        await firstDie.click()
        await page.waitForTimeout(200)
        await captureGameViewport(page, group, outDir, 'die-selected', viewportKey)
      } else {
        group.skip(
          relShot(group.folder, 'die-selected', viewportKey, 'viewport'),
          'No hand dice visible after roll',
        )
      }

      const hotspot = page.getByTestId('board-hotspot-food')
      if (await hotspot.isVisible().catch(() => false)) {
        await hotspot.hover()
        await page.waitForTimeout(150)
        await captureGameViewport(page, group, outDir, 'hotspot-hover-food', viewportKey)
        await hotspot.focus()
        await page.waitForTimeout(150)
        await captureGameViewport(page, group, outDir, 'hotspot-focus-food', viewportKey)
      } else {
        group.skip(
          relShot(group.folder, 'hotspot-hover-food', viewportKey, 'viewport'),
          'Food room hotspot not visible',
        )
        group.skip(
          relShot(group.folder, 'hotspot-focus-food', viewportKey, 'viewport'),
          'Food room hotspot not visible',
        )
      }

      await waitForQaBridge(page)
      await page.evaluate(() => {
        window.__PRR_QA__?.showErrorToast('QA screenshot: connection or rule error sample')
      })
      if (await page.getByTestId('game-error-toast').isVisible({ timeout: 5_000 }).catch(() => false)) {
        await captureGameViewport(page, group, outDir, 'error-toast', viewportKey)
      } else {
        group.skip(
          relShot(group.folder, 'error-toast', viewportKey, 'viewport'),
          'Error toast not visible after QA bridge seed',
        )
      }

      await page.evaluate(() => {
        window.__PRR_QA__?.clearErrorToast()
        window.__PRR_QA__?.showActionPending(true)
      })
      if (
        await page.getByTestId('action-pending-indicator').isVisible({ timeout: 5_000 }).catch(() => false)
      ) {
        await captureGameViewport(page, group, outDir, 'action-pending-syncing', viewportKey)
      } else {
        group.skip(
          relShot(group.folder, 'action-pending-syncing', viewportKey, 'viewport'),
          'Action pending indicator not visible after QA bridge seed',
        )
      }
      await page.evaluate(() => window.__PRR_QA__?.showActionPending(false))

      await page.evaluate(() => window.__PRR_QA__?.seedGameEnd('win'))
      if (await page.locator('.game-end-backdrop').isVisible({ timeout: 10_000 }).catch(() => false)) {
        await captureGameViewport(page, group, outDir, 'game-end-win', viewportKey)
      } else {
        group.skip(
          relShot(group.folder, 'game-end-win', viewportKey, 'viewport'),
          'Game end win modal not visible after QA bridge seed',
        )
      }

      await page.evaluate(() => window.__PRR_QA__?.seedGameEnd('lose'))
      if (await page.locator('.game-end-backdrop').isVisible({ timeout: 10_000 }).catch(() => false)) {
        await captureGameViewport(page, group, outDir, 'game-end-lose', viewportKey)
      } else {
        group.skip(
          relShot(group.folder, 'game-end-lose', viewportKey, 'viewport'),
          'Game end loss modal not visible after QA bridge seed',
        )
      }
    } finally {
      await context.close()
    }
  }

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
    'Portrait rotate prompt appears when portrait AND viewport width ≤ 1100px (includes iPad portrait).',
    'Accessibility focus shots captured on desktop-1920x1080 unless noted.',
  )

  console.log('[Worker 3] Responsive & Accessibility')

  for (const [viewportKey, viewport] of Object.entries(RESPONSIVE_A11Y_VIEWPORTS)) {
    console.log(`  viewport: ${viewportKey}`)
    const { context, page } = await newPreparedPage(browser, viewport)

    try {
      if (viewport.portrait) {
        await goto(page, '/play')
        const prompt = page.getByTestId('portrait-rotate-prompt')
        if (await prompt.isVisible({ timeout: 3_000 }).catch(() => false)) {
          await captureGameViewport(page, group, outDir, 'rotate-prompt-lobby', viewportKey)
        } else {
          group.skip(
            relShot(group.folder, 'rotate-prompt-lobby', viewportKey, 'viewport'),
            'Portrait prompt not shown (not portrait or wider than 1100px threshold)',
          )
        }

        await waitForQaBridge(page)
        await page.evaluate(() => {
          window.__PRR_QA__?.reset()
          window.__PRR_QA__?.seedWaitingForHost('QAPORT')
        })
        await goto(page, '/game')
        if (await prompt.isVisible({ timeout: 3_000 }).catch(() => false)) {
          await captureGameViewport(page, group, outDir, 'rotate-prompt-game', viewportKey)
        } else {
          group.skip(
            relShot(group.folder, 'rotate-prompt-game', viewportKey, 'viewport'),
            'Portrait prompt not visible on /game',
          )
        }
      }

      if (
        viewportKey === 'iphone-12-landscape-844x390' ||
        viewportKey === 'ipad-landscape-1366x1024'
      ) {
        await clearBrowserStorage(page)
        await createLocalRoom(page, 'QA Landscape')
        await captureGameViewport(page, group, outDir, 'lobby-landscape-crew-briefing', viewportKey)
        await startMission(page)
        await rollDiceIfNeeded(page)
        await captureGameViewport(page, group, outDir, 'game-landscape-board', viewportKey)
      }

      if (viewportKey === 'desktop-1920x1080') {
        await goto(page, '/')
        const cta = page.getByTestId('landing-start-mission')
        await cta.focus()
        await page.waitForTimeout(150)
        await captureGameViewport(page, group, outDir, 'focus-landing-cta', viewportKey)

        await clearBrowserStorage(page)
        await createLocalRoom(page, 'QA A11y')
        await startMission(page)
        await rollDiceIfNeeded(page)

        const hotspot = page.getByTestId('board-hotspot-hq')
        if (await hotspot.isVisible().catch(() => false)) {
          await hotspot.focus()
          await page.waitForTimeout(150)
          await captureGameViewport(page, group, outDir, 'focus-board-hotspot-hq', viewportKey)
        } else {
          group.skip(
            relShot(group.folder, 'focus-board-hotspot-hq', viewportKey, 'viewport'),
            'HQ hotspot not visible',
          )
        }

        await goto(page, '/play?create=1')
        await page.getByTestId('lobby-callsign-input').fill('QA Disabled')
        const submit = page.getByTestId('lobby-create-submit')
        await submit.click()
        await page.waitForTimeout(80)
        if (await submit.isDisabled().catch(() => false)) {
          await captureGameViewport(page, group, outDir, 'disabled-create-submit', viewportKey)
        } else {
          group.flaky(
            relShot(group.folder, 'disabled-create-submit', viewportKey, 'viewport'),
            'Submit button not disabled long enough during connect',
          )
        }

        await clearBrowserStorage(page)
        await createLocalRoom(page, 'QA Toast')
        await startMission(page)
        await waitForQaBridge(page)
        await page.evaluate(() => {
          window.__PRR_QA__?.showErrorToast('QA screenshot: visible error toast for review')
        })
        if (await page.getByTestId('game-error-toast').isVisible({ timeout: 5_000 }).catch(() => false)) {
          await captureGameViewport(page, group, outDir, 'error-toast-visible', viewportKey)
        } else {
          group.skip(
            relShot(group.folder, 'error-toast-visible', viewportKey, 'viewport'),
            'Error toast not visible',
          )
        }

        await page.evaluate(() => {
          window.__PRR_QA__?.clearErrorToast()
          window.__PRR_QA__?.showActionPending(true)
        })
        if (
          await page.getByTestId('action-pending-indicator').isVisible({ timeout: 5_000 }).catch(() => false)
        ) {
          await captureGameViewport(page, group, outDir, 'action-pending-visible', viewportKey)
        } else {
          group.skip(
            relShot(group.folder, 'action-pending-visible', viewportKey, 'viewport'),
            'Action pending indicator not visible',
          )
        }
      }
    } finally {
      await context.close()
    }
  }

  return group
}

/**
 * @param {Record<string, WorkerGroup>} workers
 * @param {{ branch: string, commit: string }} git
 * @param {string} outDir
 */
async function writeReports(workers, git, outDir) {
  const started = new Date().toISOString()
  const viewportList = Object.entries(VIEWPORTS)
    .map(([key, v]) => `- \`${key}\` — ${v.width}×${v.height}${v.portrait ? ' (portrait)' : ''}`)
    .join('\n')

  const workerSections = Object.entries(workers)
    .map(([, w]) => {
      return `### ${w.title} (\`${w.folder}/\`)

- **Captured:** ${w.captured.length}
- **Skipped:** ${w.skipped.length}
- **Flaky:** ${w.flaky.length}
- **Skipped scroll positions:** ${w.skippedScroll.length}

#### Captured files

${w.captured.join('\n') || '_None_'}

#### Skipped / unreachable

${w.skipped.join('\n') || '_None_'}

#### Flaky / timing-dependent

${w.flaky.join('\n') || '_None_'}

#### Skipped middle/bottom scroll

${w.skippedScroll.join('\n') || '_None_'}
`
    })
    .join('\n')

  const totalCaptured = Object.values(workers).reduce((n, w) => n + w.captured.length, 0)
  const totalSkipped = Object.values(workers).reduce((n, w) => n + w.skipped.length, 0)

  const index = `# PRR Phase 1 — QA Screenshot Index

- **Generated:** ${started}
- **Branch:** \`${git.branch}\`
- **Commit:** \`${git.commit}\`
- **Base URL:** \`${BASE_URL}\`
- **Output folder:** \`${path.basename(outDir)}\`

## Command

\`\`\`bash
npm run dev
# separate terminal:
npm install
npx playwright install chromium
npm run qa:screenshots
\`\`\`

Optional worker subset:

\`\`\`bash
PRR_QA_WORKERS=1,3 npm run qa:screenshots
\`\`\`

## Workers (parallel, max 3)

| Worker | Folder | Captured |
|--------|--------|----------|
| 1 — Public & Lobby | \`public-lobby/\` | ${workers.publicLobby.captured.length} |
| 2 — Game States | \`game-states/\` | ${workers.gameStates.captured.length} |
| 3 — Responsive & A11y | \`responsive-a11y/\` | ${workers.responsiveA11y.captured.length} |
| **Total** | | **${totalCaptured}** |

## Viewports

${viewportList}

## Worker details

${workerSections}

## Summary

- **Total captured:** ${totalCaptured}
- **Total skipped/unreachable:** ${totalSkipped}

See \`QA_SCREENSHOT_NOTES.md\` for assumptions, QA bridge usage, and manual review notes.
`

  const allAssumptions = Object.values(workers).flatMap((w) =>
    w.assumptions.map((a) => `- **[${w.title}]** ${a}`),
  )

  const allSkippedScroll = Object.values(workers).flatMap((w) => w.skippedScroll)

  const notes = `# PRR Phase 1 — QA Screenshot Notes

## Worker 1 — Public & Lobby

Folder: \`public-lobby/\`

Long marketing pages capture **full + top + middle + bottom** when scrollable.
Lobby modals and crew briefing use the same scroll set when applicable.

## Worker 2 — Game States

Folder: \`game-states/\`

Viewport-only captures (\`*_viewport.png\`) — game shell should not require page scroll.

## Worker 3 — Responsive & Accessibility

Folder: \`responsive-a11y/\`

Portrait rotate prompt, landscape lobby/game, and desktop accessibility focus states.

---

## Unreachable or skipped states

${Object.values(workers)
  .flatMap((w) => w.skipped)
  .join('\n') || '_None_'}

## Flaky / timing-dependent states

${Object.values(workers)
  .flatMap((w) => w.flaky)
  .join('\n') || '_None_'}

## Skipped scroll positions (middle/bottom)

${allSkippedScroll.join('\n') || '_All scrollable pages captured at middle/bottom._'}

## Assumptions

${allAssumptions.join('\n')}

## QA bridge seeding (DEV only)

| State | Method |
|-------|--------|
| Waiting for host | \`__PRR_QA__.seedWaitingForHost()\` |
| Error toast | \`__PRR_QA__.showErrorToast()\` |
| Action pending | \`__PRR_QA__.showActionPending(true)\` |
| Game end win/loss | \`__PRR_QA__.seedGameEnd('win' \\| 'lose')\` |

## Selectors

- Public/lobby: URL routes + \`data-testid\` on lobby/waiting-room controls
- Game: \`game-shell\`, \`board-view\`, \`dice-dock\`, \`mission-header\`, \`board-hotspot-{roomId}\`
- Overlays: \`portrait-rotate-prompt\`, \`game-error-toast\`, \`action-pending-indicator\`

## Manual review checklist

- iPhone portrait: rotate prompt premium and readable?
- iPad portrait: prompt appears (width ≤ 1100 rule)?
- Desktop game: focus rings visible but not visually broken?
- Error toast: does it block critical controls?
- Action pending: clean sync indicator?
- Lobby create/join: layout intact with test IDs?
`

  await writeFile(path.join(outDir, 'index.md'), index, 'utf8')
  await writeFile(path.join(outDir, 'QA_SCREENSHOT_NOTES.md'), notes, 'utf8')
}

async function assertDevServerUp() {
  try {
    const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(5_000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  } catch (err) {
    console.error(`\n❌ Dev server not reachable at ${BASE_URL}`)
    console.error('   Start it first: npm run dev\n')
    console.error(`   Detail: ${err instanceof Error ? err.message : String(err)}\n`)
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
  return new Set(
    raw
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => n >= 1 && n <= 3),
  )
}

async function main() {
  await assertDevServerUp()

  const { chromium } = await loadPlaywright()
  const runFolder = makeRunFolderName()
  const outDir = path.join(ROOT, 'qa-screenshots', runFolder)
  await mkdir(outDir, { recursive: true })
  await mkdir(path.join(outDir, WORKER_FOLDERS.publicLobby), { recursive: true })
  await mkdir(path.join(outDir, WORKER_FOLDERS.gameStates), { recursive: true })
  await mkdir(path.join(outDir, WORKER_FOLDERS.responsiveA11y), { recursive: true })

  const git = gitInfo()
  const workerFilter = parseWorkerFilter()

  console.log(`\nPRR QA screenshots → ${path.relative(ROOT, outDir)}`)
  console.log(`Workers: ${[...workerFilter].sort().join(', ')}\n`)

  const browser = await chromium.launch({ headless: true })

  /** @type {Record<string, WorkerGroup>} */
  const workers = {
    publicLobby: new WorkerGroup('Public & Lobby', WORKER_FOLDERS.publicLobby),
    gameStates: new WorkerGroup('Game States', WORKER_FOLDERS.gameStates),
    responsiveA11y: new WorkerGroup('Responsive & Accessibility', WORKER_FOLDERS.responsiveA11y),
  }

  try {
    const tasks = []

    if (workerFilter.has(1)) {
      tasks.push(
        runPublicLobbyWorker(browser, outDir).then((g) => {
          workers.publicLobby = g
        }),
      )
    }
    if (workerFilter.has(2)) {
      tasks.push(
        runGameStatesWorker(browser, outDir).then((g) => {
          workers.gameStates = g
        }),
      )
    }
    if (workerFilter.has(3)) {
      tasks.push(
        runResponsiveA11yWorker(browser, outDir).then((g) => {
          workers.responsiveA11y = g
        }),
      )
    }

    await Promise.all(tasks)
  } finally {
    await browser.close()
  }

  await writeReports(workers, git, outDir)

  const total = Object.values(workers).reduce((n, w) => n + w.captured.length, 0)
  const skipped = Object.values(workers).reduce((n, w) => n + w.skipped.length, 0)

  console.log(`\nDone. ${total} screenshots captured across 3 worker folders.`)
  console.log(`Skipped: ${skipped} (see QA_SCREENSHOT_NOTES.md)`)
  console.log(`Reports: ${path.join(path.relative(ROOT, outDir), 'index.md')}\n`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
