# Galactic Defender

A modern Space Invaders-style arcade shooter built with Phaser 3.90. Features procedural graphics, weapon upgrades, power-ups, boss battles, and persistent progression.

## Play Now

- **`index.html`** — Main version (ES modules).
- **`play.html`** — Fallback using `game.bundle.js` (single file build). Run `npm run bundle` after editing `src/`.

Optional (desktop/Termux): `npm install` then `npm run dev` / `npm run build` / `npm test` (Node 18+). Add `?debug` to URL to see hitboxes.

## Features

- **Pause System**: Pause button (||) at top, or press P/ESC. Shows RESUME / RESTART / QUIT TO MENU. Auto-pauses when tab/window loses focus.
- **Instant Restart**: Game over to restart in 0.6s. Buttons only respond to presses that start on them.
- **Death Cause**: Shows how you died (enemy fire, collision, defense breach).
- **First-Run Tutorial**: Context-aware hints for your device and control mode. Replay anytime from SETTINGS.
- **Persistent Progress**: High score and best wave saved each wave, on pause, and on death.

## Armory (Weapon Shop)

From Main Menu → **ARMORY**. Weapons are permanent unlocks purchased with credits.

| Weapon | Cost | Description |
|--------|------|-------------|
| Blaster | Free | Reliable single shot |
| Twin Cannon | 100 | Two parallel shots |
| Spread Shot | 200 | Three shots in a fan |
| Rapid Blaster | 300 | High fire rate |
| Piercing Laser | 400 | Pierces up to 4 enemies |
| Homing Missile | 600 | Seeks nearest enemy |
| Plasma Cannon | 800 | Heavy damage, slow fire |

- A full 5-wave run yields ~80 credits (theoretical max if all drops collected).
- **Dev Tools** (`DEV = true` in constants.js): +500 credits button in Armory, tap weapon name or press 1-7 to cycle weapons in-game. Set `DEV = false` before release.

## Power-Ups

Dropped randomly during play:

| Power-Up | Effect | Duration |
|----------|--------|----------|
| Shield | Temporary invulnerability | 10s |
| Rapid Fire | 2x fire rate | 8s |
| Spread Shot | Triple shot for any weapon | 10s |
| Extra Life | +1 life (max 5) | Instant |

## Controls

From SETTINGS: `FLOATING STICK` (default) / `FIXED STICK` / `DRAG`. Also supports Arrow Keys / WASD / Mouse.

- Movement restricted to bottom third of screen.
- Enemy bullets 15% slower than base curve, with optional blink effect.

## Boss Battles

Every 5th wave is a boss wave with unique attack patterns:
- Circular burst
- Spread shot
- Targeted homing missiles
- Rapid fire

## Configuration

| To Change... | File |
|--------------|------|
| Core numbers (lives, speeds, timers) | `src/config/constants.js` |
| Weapons & prices | `src/config/weapons.js` |
| Enemy types, HP, scores, drop rates | `src/config/enemies.js` |
| Wave progression & difficulty | `src/config/waves.js` |
| Pickup types & effects | `src/config/pickups.js` |
| Tutorial text | `src/config/hints.js` |

To add a weapon: add entry to `weapons.js` — appears in Armory automatically (keep name ≤ 16 chars, description ≤ 32).

## Architecture

```
src/
  config/     Data only
  entities/   Player, Alien, Bullet (supports homing), Pickup
  systems/    Controls, joystickMath, homing, Shop, Hints, Formation, WeaponSystem, SaveManager, TextureFactory, Background, device
  scenes/     Boot → MainMenu ⇄ Armory / Settings → Game ⇄ Pause → GameOver
  ui/         Hud, Button, style
tests/        Logic tests (36)
scripts/      bundle.mjs
```

Progress, credits, purchases, and settings saved to localStorage. Compatible with previous save versions.

## Credits

Built with [Phaser 3](https://phaser.io/) — fast, free, open-source HTML5 game framework.