# Nudge Controller

**An open source DIY Bluetooth editing controller for DaVinci Resolve — a ~$130 alternative to the $475 Blackmagic Speed Editor.**

[![Deploy Docs + Prototype](https://github.com/stephanteig/nudge-controller/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/stephanteig/nudge-controller/actions/workflows/deploy-docs.yml)
[![Build ZMK Firmware](https://github.com/stephanteig/nudge-controller/actions/workflows/build-firmware.yml/badge.svg)](https://github.com/stephanteig/nudge-controller/actions/workflows/build-firmware.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Open Source Hardware](https://img.shields.io/badge/Open%20Source-Hardware-blue.svg)](https://www.oshwa.org/)

<!-- Hero image coming soon -->
![Nudge Controller](docs/img/hero.png)
<sub>_(hero photo coming soon — `docs/img/hero.png`)_</sub>

## What is Nudge?

Nudge Controller is a 21-key wireless keypad with a weighted jog/shuttle encoder,
built around a nice!nano v2 running [ZMK](https://zmk.dev). It pairs over
Bluetooth 5.0 with up to five devices and works in any app — it's just a
keyboard. Try the whole layout on an iPad first, then build the hardware for
about a quarter the price of a Speed Editor.

## Why build one?

| | Nudge Controller | Blackmagic Speed Editor |
|---|---|---|
| Cost | ~$130 | $475 |
| Works in | Any app | DaVinci Resolve only |
| Bluetooth | ✅ BT 5.0 | ✅ |
| Customisable | ✅ Fully | ❌ |
| Open source | ✅ | ❌ |

## Quick start

- 🧪 **Test first (iPad prototype)** — open **[the controller](https://stephanteig.github.io/nudge-controller/controller)** on a tablet, run the local server, and try the layout in Resolve. No parts required. ([guide](https://stephanteig.github.io/nudge-controller/prototype/setup))
- 🔧 **Build the hardware** — order the parts and assemble the board: **[Hardware docs](https://stephanteig.github.io/nudge-controller/hardware)**.
- ⚡ **Flash the firmware** — build the `.uf2` in GitHub Actions and flash it: **[Firmware docs](https://stephanteig.github.io/nudge-controller/firmware)**.

## Repository structure

```
nudge-controller/
├── prototype/   iPad web app + Mac WebSocket server — test layouts first
├── firmware/    ZMK shield for nice!nano v2 (keymap, encoder, BLE, sleep)
├── hardware/    PCB (KiCad) + case (3D print / laser plate) guides
├── app/         Electron + React configurator (layout editor, AI assist)
├── docs/        Source Markdown guides (BOM, build, firmware, app)
├── docs-site/   Nextra docs site → GitHub Pages
└── .github/     CI: docs+prototype deploy, ZMK firmware build
```

## Hardware at a glance

- **MCU:** nice!nano v2 (nRF52840), Pro Micro pinout
- **Encoder:** Alps EC11K, 24 PPR, with push-switch + 10 kΩ pull-ups
- **Matrix:** 21 keys, 3 rows × 7 columns, 1N4148 per key
- **Battery:** 3.7 V 2000 mAh LiPo, charged via the nice!nano's onboard BQ24072
- **Wireless:** Bluetooth 5.0, up to 5 paired host profiles

## Links

- 📖 **Docs site:** https://stephanteig.github.io/nudge-controller
- 🎛️ **iPad controller:** https://stephanteig.github.io/nudge-controller/controller
- 💬 **Discussions:** https://github.com/stephanteig/nudge-controller/discussions
- 🤝 **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md)
- 📝 **Changelog:** [CHANGELOG.md](CHANGELOG.md)
- ⚖️ **License:** [MIT](LICENSE) © 2026 Stephan Teig

---

> Built with help from Claude Code. Project state and conventions live in
> [`CLAUDE.md`](CLAUDE.md).
