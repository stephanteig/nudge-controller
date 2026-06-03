# CLAUDE.md — Nudge Controller master reference

> **Read this at the start of every session. Update it whenever something changes.**
> This is the single source of truth for the project. See **Update rules** below.

## Project
- **Name:** Nudge Controller
- **Repo:** stephanteig/nudge-controller
- **Purpose:** Open source DIY Bluetooth editing controller, alternative to the $475 Blackmagic Speed Editor
- **Status:** In development (v0.1.0)

## Architecture
- `prototype/`   → iPad web app (served via GitHub Pages) + Mac Node.js WebSocket server (robotjs)
- `firmware/`    → ZMK shield for nice!nano v2 (keymap, conf, overlay, Kconfig, build.yaml)
- `hardware/`    → KiCad PCB + case (guides only — CAD not yet started)
- `app/`         → Electron + React + Vite + Tailwind configurator app
- `docs/`        → Original Markdown source guides (bom, build-guide, firmware-setup, app-setup)
- `docs-site/`   → Nextra 4 (Next.js 15) docs site, deployed to GitHub Pages at stephanteig.github.io/nudge-controller
- `.github/workflows/` → CI: `deploy-docs.yml` (docs + prototype) and `build-firmware.yml` (ZMK .uf2)

> Note: `docs/*.md` are the original guides; their content has been ported into `docs-site/content/**`.
> When editing docs, prefer `docs-site/content/` (that's what ships to the live site).

## Hardware specs (source of truth for all firmware and PCB work)
- **MCU:** nice!nano v2 (nRF52840), Pro Micro pinout, ZMK firmware
- **Encoder:** Alps EC11K, 24ppr, metal shaft, 100k cycle life
  - Pin A: Pro Micro pin 19 (P0.31 / F4 AVR label)
  - Pin B: Pro Micro pin 18 (P0.29 / F5 AVR label)
  - Switch: Pro Micro pin 20 (P0.02 / F6 AVR label)
  - Pull-ups: 10kΩ on A and B lines to VCC
- **Key matrix:** 3 rows × 7 columns = 21 keys
  - Row pins: D4 (P0.28), D5 (P0.30), D15 (P1.13) — verify D15 against real nice!nano v2 pinout
  - Col pins: D6 (P1.11), D7 (P0.06), D8 (P0.08), D9 (P0.17), D10 (P0.20), D16 (P0.10), D14 (P1.12)
- **Battery:** 3.7V LiPo 2000mAh, JST-PH 2mm, charges via nice!nano onboard BQ24072
- **BLE:** Bluetooth 5.0, up to 5 paired devices, deep sleep after 15 min idle

## GitHub Pages setup
- **Docs site:** stephanteig.github.io/nudge-controller — built from `docs-site/` using Nextra (Next.js, `output: 'export'`, `basePath: /nudge-controller`)
- **iPad prototype:** stephanteig.github.io/nudge-controller/controller — `prototype/public/index.html` copied into `out/controller/` during deploy
- **Deploy:** GitHub Actions on push to `main` → builds Nextra site → copies `prototype/public/` into `out/controller/` → publishes to `gh-pages` branch via peaceiris/actions-gh-pages

## iPad prototype — GitHub Pages + WebSocket
- The HTML is served statically from GitHub Pages.
- The Node.js server runs locally on the Mac (robotjs keystroke injection), port 3000.
- On first load, the iPad app shows a setup screen asking for the Mac's local IP address.
- IP is saved to `localStorage` (key `nudge_server_ip`) so it persists across sessions.
- WebSocket connects to `ws://<saved-ip>:3000`.
- A ⚙ settings button in the status bar reopens the IP setup overlay to change it later.

## Update rules (CRITICAL — always follow these)
Every time a meaningful change is made to this repo:
1. Update `CLAUDE.md` to reflect the new state.
2. Update `README.md` if the change affects setup, architecture, or features.
3. Update the relevant docs page(s) in `docs-site/content/`.
4. Commit message format: `type(scope): description`
   - Examples: `feat(firmware): add BT layer`, `fix(prototype): configurable WS IP`, `docs: update BOM`

## Known TODOs (track here, remove when resolved)
- [ ] Verify D15 (P1.13) as 3rd matrix row pin on real nice!nano v2 hardware
- [ ] Confirm encoder pins P0.31/P0.29/P0.02 against physical board before PCB layout
- [ ] Implement real ZMK GATT UUIDs for OTA keymap push in `app/src/components/Dashboard.jsx`
- [ ] Add KiCad PCB files to `hardware/pcb/` when design is ready
- [ ] Add case STL/DXF to `hardware/case/` when design is ready
- [ ] Add `docs/img/hero.png` (broken image in README)
- [x] Add `.github/workflows/build-firmware.yml` for ZMK GitHub Actions build
- [x] Add `firmware/build.yaml` ZMK build matrix
- [ ] Configure GitHub Pages to deploy from the `gh-pages` branch (repo Settings → Pages) — required before the docs/prototype URLs go live
- [x] Verify `docs-site` builds locally — `npm ci && npm run build` produces `out/` with all 19 pages
- [x] Commit `docs-site/package-lock.json`; CI uses `npm ci`

> **Docs build note:** `docs-site/package.json` pins `zod` to `4.1.12` via
> `overrides`. nextra/nextra-theme-docs 4.6.1 declare `zod: ^4.1.12`, but newer
> 4.x (e.g. 4.4.3) made `z.custom()` reject `undefined`, which breaks the theme's
> `Layout` schema (`children` validated as required) → "expected nonoptional,
> received undefined → at children". Keep zod pinned until upstream is fixed.

## Stack reference
- **Firmware:** ZMK (not QMK) — Bluetooth-first, nRF52840
- **Docs site:** Nextra 4 + Next.js 15 — same stack as stephanteig/respawn-ostfold
- **App:** Electron + React + Vite + Tailwind
- **Prototype server:** Node.js + Express + ws + robotjs
- **Prototype frontend:** Vanilla HTML/JS/CSS — no framework, single file

## Docs site structure (match respawn-ostfold style)
```
docs-site/
├── content/
│   ├── index.mdx                          ← Landing page
│   ├── getting-started/
│   │   ├── index.mdx                      ← Overview
│   │   ├── prerequisites.mdx
│   │   └── quick-start.mdx
│   ├── prototype/
│   │   ├── index.mdx
│   │   ├── setup.mdx
│   │   └── customising.mdx
│   ├── hardware/
│   │   ├── index.mdx
│   │   ├── bom.mdx
│   │   ├── pcb.mdx
│   │   └── case.mdx
│   ├── firmware/
│   │   ├── index.mdx
│   │   ├── setup.mdx
│   │   ├── layers.mdx
│   │   └── flashing.mdx
│   ├── app/
│   │   ├── index.mdx
│   │   ├── setup.mdx
│   │   ├── layout-editor.mdx
│   │   └── ai-assist.mdx
│   └── contributing.mdx
├── public/
│   └── logo.svg                           ← Simple text logo
├── next.config.mjs
├── package.json
└── theme.config.jsx                       ← Nextra theme, links, footer
```
