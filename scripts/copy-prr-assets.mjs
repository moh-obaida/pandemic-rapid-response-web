#!/usr/bin/env node
import { copyFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const homeAssets = join(
  process.env.HOME || '',
  '.cursor/projects/Users-lujainshaikhalzour-Documents-GitHub-pandemic-rapid-response-web/assets'
)
const srcDir = process.env.PRR_ASSETS_SRC || homeAssets
const destRoot = join(root, 'public/assets/prr')

function copyMap(map, subdir) {
  const dir = join(destRoot, subdir)
  mkdirSync(dir, { recursive: true })
  for (const [name, file] of Object.entries(map)) {
    const src = join(srcDir, file)
    const dest = join(dir, `${name}.png`)
    if (!existsSync(src)) {
      console.warn(`skip missing: ${file}`)
      continue
    }
    copyFileSync(src, dest)
    console.log(`${subdir}/${name}.png`)
  }
}

const board = {
  'plane-board': 'ChatGPT_Image_Jun_20__2026__07_26_38_PM-6de9756f-c898-4a85-95c3-db7c84e4c5b0.png',
  'city-card-back': 'ChatGPT_Image_Jun_20__2026__04_48_59_PM__4_-1a79058c-98e3-4869-ab68-8e68f838a456.png',
  'control-panel': 'ChatGPT_Image_Jun_20__2026__04_48_59_PM__3_-4680fa41-897d-458a-8586-3492a24bc70c.png',
  radar: 'ChatGPT_Image_Jun_20__2026__04_48_59_PM__7_-b17d782f-115a-44d0-be3b-b6955ca0cc26.png',
  'turn-reference': 'ChatGPT_Image_Jun_20__2026__04_48_59_PM__2_-1f43f88d-d5a4-47e9-aa57-766af5bed348.png',
  'hq-badge': 'ChatGPT_Image_Jun_20__2026__04_48_59_PM__5_-3810aa75-54ad-412a-93b4-8540b04eb490.png',
  'crates-sprite': 'ChatGPT_Image_Jun_20__2026__04_50_24_PM-d5ad1bdf-b521-4585-84fc-835ded92c606.png',
}

const dice = {
  plane: 'ChatGPT_Image_Jun_20__2026__04_50_15_PM__1_-93753e79-c15c-403d-9118-1c7ace1359fc.png',
  food: 'ChatGPT_Image_Jun_20__2026__04_50_17_PM__2_-4d58d104-4d7f-4b1a-987d-0da5c10135b3.png',
  power: 'ChatGPT_Image_Jun_20__2026__04_50_18_PM__3_-216fb948-24dd-4b20-bf99-9e06b791d797.png',
  water: 'ChatGPT_Image_Jun_20__2026__04_50_18_PM__4_-e2cfb1b5-60f9-46e0-98ba-8ada6f0cf8eb.png',
  vaccine: 'ChatGPT_Image_Jun_20__2026__04_50_18_PM__5_-8711baab-171b-4bd5-a931-23c39efc9476.png',
  firstAid: 'ChatGPT_Image_Jun_20__2026__04_50_19_PM__6_-78336dfa-151a-4126-aa66-3a709d0593fe.png',
}

const roles = {
  analyst: 'ChatGPT_Image_Jun_20__2026__04_49_06_PM__1_-accc589c-41f3-42f6-b1e3-93b594be8965.png',
  technician: 'ChatGPT_Image_Jun_20__2026__04_49_06_PM__2_-1fe0be3d-89da-4c12-ac2e-6be77fa210fa.png',
  engineer: 'ChatGPT_Image_Jun_20__2026__04_49_06_PM__3_-305479b2-85dc-404f-96b1-4b21d9b6334e.png',
  flightPlanner: 'ChatGPT_Image_Jun_20__2026__04_49_06_PM__4_-eccd2b2a-27e2-4934-a96a-f26f85b40dab.png',
  director: 'ChatGPT_Image_Jun_20__2026__04_49_06_PM__5_-09921d2c-0861-47ec-adc8-d40f27d26328.png',
  recycler: 'ChatGPT_Image_Jun_20__2026__04_49_06_PM__6_-620019e1-f59a-45a8-9b11-8e71401139bb.png',
  supplySpecialist: 'ChatGPT_Image_Jun_20__2026__04_49_06_PM__7_-66096d87-5f16-4936-8550-c020cf319e35.png',
}

const cities = {
  london: 'ChatGPT_Image_Jun_20__2026__04_49_55_PM__1_-265974c8-072d-4641-8f6c-b486fd876e83.png',
  paris: 'ChatGPT_Image_Jun_20__2026__04_49_55_PM__2_-7c8bb9c4-090e-4d0b-b7eb-a4b1d0305c52.png',
  essen: 'ChatGPT_Image_Jun_20__2026__04_49_56_PM__3_-c66634ca-f42d-4c79-9465-85c39681138f.png',
  moscow: 'ChatGPT_Image_Jun_20__2026__04_49_56_PM__4_-19018e4c-776c-49f7-815a-f8184ff211fe.png',
  istanbul: 'ChatGPT_Image_Jun_20__2026__04_49_56_PM__5_-0066f25c-2cf6-4c2d-b108-8a14e112dbf8.png',
  cairo: 'ChatGPT_Image_Jun_20__2026__04_49_57_PM__6_-6f1ff3d2-1cbf-41df-9956-57d41112c2d6.png',
  riyadh: 'ChatGPT_Image_Jun_20__2026__04_49_57_PM__7_-537fe33f-81fc-4fa1-8fab-b8b636aae2dd.png',
  karachi: 'ChatGPT_Image_Jun_20__2026__04_49_58_PM__8_-83bb4f01-846d-4703-8b83-32d8761e8b3e.png',
  delhi: 'ChatGPT_Image_Jun_20__2026__04_49_58_PM__9_-00844698-2b1b-43a6-93c8-4398bbd7b3e1.png',
  bangkok: 'ChatGPT_Image_Jun_20__2026__04_49_59_PM__10_-35dae67b-4a53-4a58-819d-11753d4e038b.png',
  'hong-kong': 'ChatGPT_Image_Jun_20__2026__04_50_02_PM__1_-29a2e991-432e-4520-b5f4-3d136dc6b858.png',
  seoul: 'ChatGPT_Image_Jun_20__2026__04_50_02_PM__2_-2fa159b4-1830-4716-b1f0-5f9d53bce304.png',
  tokyo: 'ChatGPT_Image_Jun_20__2026__04_50_03_PM__3_-9be31784-f42b-4b3b-bdb0-cc824d0ad17b.png',
  manila: 'ChatGPT_Image_Jun_20__2026__04_50_03_PM__4_-5549a895-92e9-48cf-8e7d-e30c9c130b55.png',
  sydney: 'ChatGPT_Image_Jun_20__2026__04_50_04_PM__5_-304fa5d0-e953-4e98-b576-7cbd46cf8152.png',
  johannesburg: 'ChatGPT_Image_Jun_20__2026__04_50_04_PM__6_-b90093c3-5f74-4754-9dbc-428c816fe014.png',
  lagos: 'ChatGPT_Image_Jun_20__2026__04_50_05_PM__7_-79548a66-7df5-4237-a312-c3fad2e286ec.png',
  'sao-paulo': 'ChatGPT_Image_Jun_20__2026__04_50_05_PM__8_-b9749ec1-b85d-4efe-aad9-bf0a81b20441.png',
  bogota: 'ChatGPT_Image_Jun_20__2026__04_50_05_PM__9_-900a987e-e8cc-4187-ac9b-6d8cd88aca23.png',
  'mexico-city': 'ChatGPT_Image_Jun_20__2026__04_50_06_PM__10_-e5eb84fe-c681-4789-865a-2b053f88078c.png',
  'los-angeles': 'ChatGPT_Image_Jun_20__2026__04_50_07_PM__1_-595ddd07-9d8f-4b02-886a-8d79adbce264.png',
  atlanta: 'ChatGPT_Image_Jun_20__2026__04_50_08_PM__2_-a829ee3c-7d3f-4568-bba6-32ab93636a50.png',
  montreal: 'ChatGPT_Image_Jun_20__2026__04_50_08_PM__3_-2d33ca33-3af5-48f4-a829-f8d76fb7b2d7.png',
  madrid: 'ChatGPT_Image_Jun_20__2026__04_50_09_PM__4_-c28d61a8-300d-4199-bc05-378829fccde6.png',
}

const crises = {
  distraction: 'ChatGPT_Image_Jun_20__2026__04_49_28_PM__1_-1115a44c-7011-4fae-907c-28ad76a22fe7.png',
  'equipment-failure': 'ChatGPT_Image_Jun_20__2026__04_49_28_PM__2_-6683ffd0-096f-489e-bef0-4d70d3e5de93.png',
  'safety-drill': 'ChatGPT_Image_Jun_20__2026__04_49_28_PM__3_-ee335d5e-80de-4b93-ae63-d45a6f512c27.png',
  evacuation: 'ChatGPT_Image_Jun_20__2026__04_49_28_PM__4_-687ecdb6-0d63-48bb-aeba-4bc1071d82cc.png',
  turbulence: 'ChatGPT_Image_Jun_20__2026__04_49_28_PM__5_-bfe99e93-a16e-4dba-b525-d413937f7dd9.png',
  'extreme-winds': 'ChatGPT_Image_Jun_20__2026__04_49_28_PM__6_-4cf739c3-6db2-46eb-acc9-6515438360c1.png',
  'supply-spill': 'ChatGPT_Image_Jun_20__2026__04_49_28_PM__7_-519fe2e0-34f2-491c-8c45-a3793445b558.png',
  'urgent-vaccine-delivery': 'ChatGPT_Image_Jun_20__2026__04_49_44_PM__1_-e0335487-4c49-4ae2-bfc5-5e9804aedfe9.png',
  'urgent-food-delivery': 'ChatGPT_Image_Jun_20__2026__04_49_44_PM__2_-89e121c5-0804-480e-a9ee-bf997203b554.png',
  'urgent-power-delivery': 'ChatGPT_Image_Jun_20__2026__04_49_44_PM__3_-e0841d36-b36b-49d5-8190-30253d13043d.png',
  'urgent-water-delivery': 'ChatGPT_Image_Jun_20__2026__04_49_44_PM__4_-985c09e1-9d3d-4df4-a987-64c60b9f12bd.png',
  'urgent-first-aid-delivery': 'ChatGPT_Image_Jun_20__2026__04_49_44_PM__5_-e57f87c5-b490-431e-bb83-f6682486030b.png',
}

if (!existsSync(srcDir)) {
  console.error(`Source assets not found: ${srcDir}`)
  process.exit(1)
}

copyMap(board, 'board')

const diceOut = {
  plane: dice.plane,
  food: dice.food,
  power: dice.power,
  water: dice.water,
  vaccine: dice.vaccine,
  'first-aid': dice.firstAid,
}
copyMap(diceOut, 'dice')

const rolesOut = {
  analyst: roles.analyst,
  technician: roles.technician,
  engineer: roles.engineer,
  'flight-planner': roles.flightPlanner,
  director: roles.director,
  recycler: roles.recycler,
  'supply-specialist': roles.supplySpecialist,
}
copyMap(rolesOut, 'cards/roles')
copyMap(cities, 'cards/cities')
copyMap(crises, 'crises')

// Crates + tokens derived from board art
const spriteSrc = join(destRoot, 'board/crates-sprite.png')
if (existsSync(spriteSrc)) {
  mkdirSync(join(destRoot, 'crates'), { recursive: true })
  for (const t of ['water', 'food', 'power', 'vaccine', 'first-aid']) {
    copyFileSync(spriteSrc, join(destRoot, 'crates', `${t}.png`))
    console.log(`crates/${t}.png`)
  }
}
const hqSrc = join(destRoot, 'board/hq-badge.png')
if (existsSync(hqSrc)) {
  mkdirSync(join(destRoot, 'tokens'), { recursive: true })
  copyFileSync(hqSrc, join(destRoot, 'tokens/time-token.png'))
  copyFileSync(hqSrc, join(destRoot, 'tokens/waste-marker.png'))
}

// Rename radar file if copied as radar-display
const radarLegacy = join(destRoot, 'board/radar-display.png')
const radarDest = join(destRoot, 'board/radar.png')
if (existsSync(radarLegacy) && !existsSync(radarDest)) {
  copyFileSync(radarLegacy, radarDest)
}

console.log('Done.')
