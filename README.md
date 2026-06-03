# Nudge Controller

**An open-source, DIY Bluetooth editing controller for DaVinci Resolve and other
NLEs — a ~$130 alternative to the $475 Blackmagic Speed Editor.**

21 keys plus a weighted jog/shuttle encoder, wireless over Bluetooth 5.0, fully
reprogrammable, and built from off-the-shelf parts around a [nice!nano
v2](https://nicekeyboards.com/docs/nice-nano/) running [ZMK](https://zmk.dev)
firmware. A companion app lets you design layouts, import your existing Resolve
shortcuts, and (eventually) push keymaps over the air.

<!-- TODO: add a hero photo of the finished build at docs/img/hero.png -->
![Nudge Controller](docs/img/hero.png)

---

## Why build one?

| | Nudge Controller | Blackmagic Speed Editor |
|---|---:|---:|
| Price | **~$130** | **$475** |
| Wireless | ✅ Bluetooth 5.0 | ✅ |
| Open / hackable | ✅ fully | ❌ |
| Works in any app | ✅ (it's a BLE keyboard) | ⚠️ Resolve-focused |
| Custom layouts + profiles | ✅ via app & firmware | limited |

You trade some keys and Blackmagic's exact dial feel for a fully open device at
roughly a quarter of the price — and you can rebind every key.

## How it works

```
   ┌───────────────┐   Bluetooth 5.0    ┌──────────────┐
   │  21 keys + EC11│  ───────────────▶  │  Mac / iPad  │
   │  nice!nano v2  │     (HID + GATT)   │  PC / NLE    │
   │  ZMK firmware  │                    └──────────────┘
   └───────────────┘
          ▲  Web Bluetooth (OTA keymap)
          │
   ┌──────┴────────┐
   │ Configurator  │  Electron + React app:
   │     app       │  design layouts, import Resolve shortcuts, AI assist
   └───────────────┘
```

## Quick start

**1. Try the layout first — no hardware needed.** The
[prototype](prototype/README.md) runs a virtual controller on an iPad that fires
real keystrokes into your Mac, so you can test a layout in Resolve before you
solder anything.

```bash
cd prototype && npm install && npm start
# open the printed http://<your-ip>:3000 on your iPad
```

**2. Build the hardware.** Order parts from the [BOM](docs/bom.md) and follow the
[build guide](docs/build-guide.md).

**3. Flash the firmware.** Fork ZMK config, drop in [`firmware/`](firmware/),
let GitHub Actions build the `.uf2`, and flash it — see
[firmware setup](docs/firmware-setup.md).

**4. Customise.** Use the [configurator app](docs/app-setup.md) to design
layouts, import your Resolve shortcuts, and generate keymaps.

## Repository layout

```
nudge-controller/
├── prototype/   iPad web app + Mac server — test layouts before building
├── firmware/    ZMK shield config (keymap, encoder, BLE, deep sleep)
├── hardware/    PCB (KiCad) + case (3D print / laser-cut plate) guides
├── app/         Electron + React configurator (layout editor, AI assist)
└── docs/        Build guide, BOM, firmware & app setup
```

## Hardware at a glance

- **MCU:** nice!nano v2 (Nordic nRF52840), Pro Micro pinout
- **Encoder:** Alps EC11K, 24 PPR, with push-switch and 10 kΩ pull-ups
- **Matrix:** 21 keys, 3 rows × 7 columns, 1N4148 per key
- **Battery:** 3.7 V 2000 mAh LiPo, charged via the nice!nano's onboard BQ24072
- **Wireless:** Bluetooth 5.0, up to 5 paired host profiles

## Documentation

- 📦 [Bill of Materials](docs/bom.md) — parts, prices, sources
- 🔧 [Build Guide](docs/build-guide.md) — full assembly walkthrough
- ⚡ [Firmware Setup](docs/firmware-setup.md) — ZMK build, flashing, pairing
- 🖥️ [App Setup](docs/app-setup.md) — configurator install & usage
- 🔩 [Hardware](hardware/README.md) — PCB & case design files

## Status

Early prototype. The iPad prototype and the full firmware/app/docs scaffolding
are in place; the KiCad PCB and case models are still to come, and a handful of
pin assignments in the firmware are placeholders until the board is finalised
(search for `TODO` in [`firmware/config/nudge_controller.overlay`](firmware/config/nudge_controller.overlay)).

## License

[MIT](LICENSE) © 2026 Stephan Teig. Contributions welcome.
