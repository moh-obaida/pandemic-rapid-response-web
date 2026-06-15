---
name: pandemic-rapid-response-design
description: Use this skill to generate well-branded interfaces and assets for Pandemic Rapid Response (the real-time cooperative board game's digital interface), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick map
- `readme.md` — the design guide: context, CONTENT FUNDAMENTALS, VISUAL FOUNDATIONS, ICONOGRAPHY, index.
- `styles.css` — single global entry point (link this); imports everything in `tokens/`.
- `tokens/` — colors (dark console + 8 room colors + state accents), typography (Archivo / Public Sans / Space Mono), spacing (4px grid), elevation (radii, flat panel + tactile piece shadows, glows), base.
- `components/core/` — Button, Badge, Panel, Icon.
- `components/game/` — Die, SupplyCrate, RoomTile, CityCard, RoleCard, Timer, WasteTrack.
- `ui_kits/game/` — full interactive game interface (lobby → board → end).
- `guidelines/` — specimen cards.

## Essentials
- Dark, flat, functional. App canvas `#212121`; panels `#2C2C2C`; raised `#383838`; borders `#424242`.
- Color = identity (which room/supply), never decoration. State = gold (active) / green (valid) / red (error) / purple (plane).
- Type: Archivo (display/timer/banners), Public Sans (UI body), Space Mono (timers, counts — tabular).
- Icons: Lucide, 2px stroke, CDN. No emoji in product chrome.
- Motion: fast, physical, snappy easing. Timer pulses last 5s. Respect reduced-motion.
