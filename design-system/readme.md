# Pandemic Rapid Response — Design System

A design system for the **online, real-time digital interface** of *Pandemic: Rapid Response* — a cooperative board game (2–4 players) where players are specialists aboard a supply plane racing to deliver aid to disaster-struck cities before a 2-minute sand timer and a rising waste track end the mission.

This system describes a **simple, minimal, functional, landscape-only** game UI (primary canvas **1920×1080**). It is the *digital companion interface* — a clean, readable interpretation of the physical game, not a reproduction of its painted artwork.

> **Affiliation note.** *Pandemic: Rapid Response* is a published board game (Z-Man Games; designers Kane Klenko & the Pandemic system by Matt Leacock). This design system is an independent, brand-aligned interface concept. It deliberately does **not** trace the game's painted cover, logo art, or board illustration; the wordmark and visuals here are original typographic/console treatments built to match the game's mechanics and palette.

---

## Sources used

These were provided as project inputs. The reader may not have access; recorded here for provenance:

- **`Rapid-Response-Rulebook.pdf`, page 3** — screenshot of the physical board setup (the response aircraft interior with 8 rooms, the flightpath of cities, sand timer, custom symbol dice, disease/violet cubes, illustrated role cards, and city cards with flag + required-supply symbols). Used for thematic grounding.
- **"PANDEMIC RAPID RESPONSE — CLAUDE DESIGN BRIEF"** (pasted) — the digital design brief: landscape layout, room colors, dark UI palette, component sketches.
- **"PANDEMIC: RAPID RESPONSE — ONLINE GAME SPECIFICATION"** (pasted) — the full MVP spec: mechanics, 8 rooms, 5 supplies, 7 roles, timer/waste/time-token economy, difficulty levels, crisis cards, exact color palette, and layout. **This spec is the authoritative source for colors, layout, and behavior.**

---

## The product in one screen

Landscape **1920×1080**, no scrolling, all four players + the board visible at once:

- **Center** — the **plane board**: 8 connected rooms (HQ, 5 supply rooms, Recycling Center, Cargo Bay), each with die-spaces. The **flightpath** of 24 city slots runs along the board's bottom edge with the plane pawn beneath the current city.
- **Four corners** — **player areas**: role card, a row of 6 dice, and status.
- **Bottom-center** — the **status bar**: waste track · the 2-minute timer · time-token counts · current player.

The whole thing is a logistics puzzle under time pressure, so the UI's job is **instant legibility**: bold counts, color-coded rooms, an unmissable countdown, and clear valid/selected/disabled states.

---

## CONTENT FUNDAMENTALS

How copy is written across the interface.

- **Voice: a calm mission console.** Terse, operational, second-person imperative. The UI talks like a flight-ops display, not a narrator. *"Roll your dice." "Deliver to São Paulo." "Timer running."*
- **Person.** Address the player as **you** ("your turn", "your dice"). Refer to teammates by **role** ("Engineer is in Recycling"). The team is **we** only in win/lose moments ("We delivered everything.").
- **Casing.**
  - **ALL-CAPS** for system labels, room names, and status chips: `WASTE`, `CARGO BAY`, `OUTBREAK`, `YOUR TURN`. Tracked +0.14em.
  - **Title Case** for proper nouns, role names, city names, and buttons: `Flight Planner`, `Mexico City`, `Roll Dice`, `End Turn`.
  - **Sentence case** for ability descriptions and helper text: *"When you spend a die to fly, move the plane 1 additional city."*
- **Numbers are loud.** Timers (`1:47`), counts (`×6`, `3 left`), and tracks are set in the mono face, tabular, often the largest type on a panel. Never spell out a number the player must act on.
- **Verbs over nouns.** Buttons and prompts are actions: `Roll`, `Reroll (2 left)`, `Assign`, `Activate`, `Fly`, `Deliver`, `End Turn`.
- **Urgency without panic.** Escalate by color and size, not exclamation. Copy stays flat — `TIMER LOW`, not "HURRY!!!". The one allowed shout is the lose/win banner: `MISSION FAILED` / `ALL SUPPLIES DELIVERED`.
- **No filler.** No flavor paragraphs in the live UI. Rules/ability text is one line, present tense. Tooltips are a phrase, not a sentence with a period when it's a label.
- **Emoji / unicode as icons:** **no.** The physical rulebook leans on emoji-like glyphs, but this interface uses a real icon set (see ICONOGRAPHY). Emoji never appear in product chrome.
- **Examples**
  - Turn prompt: `YOUR TURN — Roll your dice`
  - Waste warning: `WASTE 7 / 9`
  - Timer pause: `TIMER OUT · Discard 1 time token · Draw city`
  - Delivery success: `Delivered to Cairo · +1 time token`
  - Lose: `MISSION FAILED — Waste reached critical`

---

## VISUAL FOUNDATIONS

The motifs and rules of the look. Answers the "how does it feel" questions.

- **Overall aesthetic.** Dark, flat, **functional console**. Think a clean ops dashboard, not ornate board-game art. Material-adjacent dark surfaces, saturated room colors as the only bright hits, generous breathing room, no decoration that doesn't carry information.
- **Surfaces & backgrounds.** Flat dark fills, **no gradients, no textures, no imagery** behind UI. App canvas `#212121`; panels/cards a step lighter (`#2C2C2C`); raised tiles lighter still (`#383838`). Depth comes from these 3–4 stepped greys + 1px `#424242` borders, *not* from heavy shadows. The only "image-like" surface is the board's room grid, and even that is flat color blocks.
- **Color vibe.** Neutral cool-grey console punctuated by **8 room colors** (light blue, lime, gold, red, cyan, dark green, orange, grey). Colors are **assignment, not mood** — a color always means *that room / that supply*. State accents are a separate, small set: gold = active turn, green = valid target, red = error/critical, purple = the plane. Saturated but not neon; pulled from the Material 400–600 range.
- **Type.** Display = **Archivo** (700–900) for the wordmark, the big timer, and win/lose banners — utilitarian, slightly condensed, urgent. UI text = **Public Sans** (400–700), a clean civic grotesque (stands in for the brief's "Inter/Roboto/Helvetica" with more character and full open-licensing). Numerics/timers = **Space Mono**, tabular, for the countdown, counts, and coordinates. Tight tracking on display; +0.14em on all-caps micro labels.
- **Corner radii.** Soft but not pill-y. Panels/cards `8–12px`. Dice `12px` rounded squares. Crates `6px`. Buttons `8px`. Status chips/tokens are fully round (`999px`). Nothing sharp-cornered except thin dividers.
- **What a card looks like.** Flat `#2C2C2C` fill, `1px #424242` border, `8–12px` radius, low ambient shadow (`0 2px 8px rgba(0,0,0,.45)`). A **left or top color stripe** carries room/role/region identity. No glossy gradients. Headers in all-caps tracked labels; body dim-white.
- **Borders.** Hairline `1px` `#424242` everywhere; `2px` for emphasis; **3px chunky** outline only on highlighted/selected game pieces. Borders do the structural work since shadows are restrained.
- **Shadow systems.** Two families: (1) **Panel** — soft, low, ambient (`rgba(0,0,0,.45)`), used sparingly for modals/popovers. (2) **Piece** — a *hard offset* table shadow (`0 2px 0 + soft`) on dice/crates/pawns so they read as physical tokens lying on the console; on lift the offset grows.
- **Elevation/glow for state.** Selected/active/valid use a **glow ring** rather than a color swap: gold glow (active), green glow (valid target), red glow (error). This keeps the underlying color (room identity) intact while signaling state.
- **Hover states.** Subtle: surface lightens one step (`#2C2C2C → #383838 → #424242`), border brightens, and interactive pieces lift ~2px. No color inversion. Cursor changes to pointer; valid targets gain the green glow.
- **Press states.** Quick **shrink** (`scale .97`) + remove the lift (piece "sets down"), `110ms`. Buttons darken one step. Decisive and fast — matches the game's tempo.
- **Disabled.** Drop to `#5C5C5C` text on the panel grey, remove border emphasis, no glow, `not-allowed` cursor. Dice that are *locked* (assigned) show a small lock and lose their hover lift.
- **Transparency & blur.** Used only for **scrims**: modal/overlay backdrops are `rgba(0,0,0,.6)` with an optional light `backdrop-filter: blur(2px)`. UI panels themselves are **opaque** — no glassmorphism in the play area (legibility under time pressure beats style).
- **Animation.** Fast and physical, never decorative. Dice **tumble→settle** ~500ms; crates **slide** ~300ms; plane **slides** along the flightpath ~400ms; waste/plane markers **slide** ~300ms; timer counts smoothly and **flashes** the last 5 seconds (red pulse, ~600ms cycle). Easing is snappy (`cubic-bezier(.2,.9,.25,1)`). No 3D rotations, no particles, no parallax. Respect `prefers-reduced-motion` (cut entrances, keep the timer).
- **Layout rules.** Fixed full-viewport 16:9 stage, content scaled to fit (letterboxed), **never scrolls**. Board dominant and centered; four player areas pinned to corners; status bar pinned bottom-center; flightpath pinned to the board's bottom edge. Min support 1366×768, scales proportionally.
- **Imagery vibe.** There is essentially no photographic/illustrative imagery in-product — this is a diagrammatic interface. Where character art would appear (role cards) the digital version uses an **initials avatar on a role-tinted chip**, not a portrait.

---

## ICONOGRAPHY

- **System: [Lucide](https://lucide.dev)** (open-source, consistent ~2px stroke, rounded line caps) loaded from CDN. It matches the brief's "simple, functional, icon-per-supply" requirement with one coherent stroke weight. *This is a substitution* — the physical game uses bespoke painted symbols and the brief used emoji; Lucide is the closest clean, license-free, CDN-available match. **Flag to user:** if you have official supply/role glyphs, drop the SVGs in `assets/icons/` and we'll swap the map.
- **No emoji, no unicode dingbats** in product chrome — Lucide only. (Emoji appear in the source spec only.)
- **Canonical icon map** (Lucide names):
  | Meaning | Icon | | Meaning | Icon |
  |---|---|---|---|---|
  | Vaccine | `syringe` | | Fly / plane | `plane` |
  | Food | `apple` | | Timer / sand timer | `hourglass` |
  | Power | `zap` | | Time token | `clock` |
  | First Aid | `cross` | | Waste | `biohazard` |
  | Water | `droplet` | | Recycling | `recycle` |
  | Cargo Bay | `package` | | HQ | `building-2` |
  | Move (die) | `circle` | | Reroll | `dices` |
- Icons inherit `currentColor`; on a room tile they sit in the room color or on a tinted chip. Sizes: 16 (inline), 20 (buttons), 24–28 (room headers), 32+ (supply crates).
- **Loading:** include `<script src="https://unpkg.com/lucide@latest"></script>` and call `lucide.createIcons()` after render. The `Icon` component (in `components/`) wraps this.

---

## Index / manifest

Root files:
- **`styles.css`** — the single global entry point (import list only). Consumers link this.
- **`tokens/`** — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `elevation.css`, `base.css`.
- **`readme.md`** — this guide.
- **`SKILL.md`** — Agent-Skill front-matter wrapper.
- **`guidelines/`** — foundation specimen cards (Type, Colors, Spacing, Brand) shown in the Design System tab.
- **`assets/`** — wordmark + icon notes.
- **`components/`** — reusable React primitives (see below).
- **`ui_kits/game/`** — the full interactive game interface (lobby/setup → board → end screens).

Components (see `components/<group>/`):
- **core** — `Button`, `IconButton`, `Badge`, `Panel`, `Icon`
- **game** — `Die`, `SupplyCrate`, `RoomTile`, `CityCard`, `RoleCard`, `Timer`, `WasteTrack`, `TimeTokens`, `PlanePawn`

UI kits:
- **`ui_kits/game/`** — `Lobby`, `Board`, `PlayerArea`, `StatusBar`, `Flightpath`, end-screen overlay.

See **CONTENT FUNDAMENTALS** and **VISUAL FOUNDATIONS** above before designing anything new.
