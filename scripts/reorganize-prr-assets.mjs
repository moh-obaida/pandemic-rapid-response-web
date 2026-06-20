#!/usr/bin/env node
/**
 * Reorganizes public/assets/prr into the required semantic layout.
 * Run after copy-prr-assets.mjs or to migrate legacy paths.
 */
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const prr = join(root, 'public/assets/prr')

function ensureDir(p) {
  mkdirSync(p, { recursive: true })
}

function copyIfExists(src, dest) {
  if (!existsSync(src)) return false
  ensureDir(dirname(dest))
  copyFileSync(src, dest)
  return true
}

function migrateDir(fromSub, toSub, rename = (n) => n) {
  const from = join(prr, fromSub)
  if (!existsSync(from)) return
  for (const f of readdirSync(from)) {
    if (!f.endsWith('.png')) continue
    const base = f.replace(/\.png$/, '')
    copyIfExists(join(from, f), join(prr, toSub, `${rename(base)}.png`))
  }
}

const roleRename = {
  flightPlanner: 'flight-planner',
  supplySpecialist: 'supply-specialist',
}

ensureDir(join(prr, 'board'))
ensureDir(join(prr, 'cards/cities'))
ensureDir(join(prr, 'cards/roles'))
ensureDir(join(prr, 'crises'))
ensureDir(join(prr, 'dice'))
ensureDir(join(prr, 'crates'))
ensureDir(join(prr, 'tokens'))

// Board (keep in board/)
for (const f of ['plane-board', 'city-card-back', 'control-panel', 'turn-reference', 'crates-sprite', 'hq-badge', 'radar']) {
  const legacy = join(prr, 'board', `${f}.png`)
  if (f === 'radar' && !existsSync(legacy)) {
    copyIfExists(join(prr, 'board', 'radar-display.png'), legacy)
  }
}

migrateDir('cities', 'cards/cities')
migrateDir('roles', 'cards/roles', (b) => roleRename[b] ?? b)
migrateDir('crises', 'crises')

// Dice: firstAid -> first-aid
migrateDir('dice', 'dice', (b) => (b === 'firstAid' ? 'first-aid' : b))

// Crates from sprite tiles (same sheet until individual art exists)
const sprite = join(prr, 'board/crates-sprite.png')
const crateTypes = ['water', 'food', 'power', 'vaccine', 'first-aid']
if (existsSync(sprite)) {
  for (const t of crateTypes) {
    copyIfExists(sprite, join(prr, 'crates', `${t}.png`))
  }
}

// Tokens from hq-badge until dedicated token art exists
const hq = join(prr, 'board/hq-badge.png')
if (existsSync(hq)) {
  copyIfExists(hq, join(prr, 'tokens/time-token.png'))
  copyIfExists(hq, join(prr, 'tokens/waste-marker.png'))
}

console.log('Reorganized assets under public/assets/prr/')
