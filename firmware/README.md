# Firmware — ZMK shield `nudge_controller`

The Nudge Controller runs [ZMK](https://zmk.dev), an open-source wireless
keyboard firmware, on a **nice!nano v2** (Nordic nRF52840). ZMK gives us BLE 5.0,
multi-device profiles, deep-sleep power management, and rotary-encoder support
out of the box — no custom C required, just devicetree + keymap config.

## What's here

```
firmware/
├── config/
│   ├── nudge_controller.keymap   # key bindings + the 4 layers (SCROLL/JOG/SHUTTLE/BT)
│   ├── nudge_controller.conf     # BLE, deep sleep, encoder, battery reporting
│   └── nudge_controller.overlay  # hardware: 3×7 matrix, encoder, pin assignments
└── boards/shields/nudge_controller/
    ├── nudge_controller.zmk.yml  # shield metadata (id, features)
    ├── Kconfig.shield            # declares the SHIELD_NUDGE_CONTROLLER symbol
    └── Kconfig.defconfig         # default config when the shield is built
```

## How the keymap is organised

| Layer | Name      | Encoder rotation              | How you reach it                 |
|-------|-----------|-------------------------------|----------------------------------|
| 0     | `SCROLL`  | ↑ / ↓ (timeline scroll)       | default                          |
| 1     | `JOG`     | Shift+→ / Shift+← (frame trim)| tap encoder from SCROLL          |
| 2     | `SHUTTLE` | ] / [ (speed ramp)            | tap encoder from JOG             |
| 3     | `BT`      | profile select                | **hold** the encoder push        |

- **Tap** the encoder push to cycle SCROLL → JOG → SHUTTLE → SCROLL.
- **Hold** the encoder push for the Bluetooth layer; the top row picks profiles
  0–4 (`BT_SEL`) or clears the active pairing (`BT_CLR`).
- The 21 keys are identical across the three editing layers; only the encoder
  behaviour changes.

## Building & flashing

The recommended path is a **fork of `zmk-config`** with these files dropped in —
the GitHub Actions build produces a `.uf2` you flash by double-tapping reset.
Full step-by-step instructions live in [`../docs/firmware-setup.md`](../docs/firmware-setup.md).

## ⚠️ Hardware values to verify before flashing

A few pin assignments are placeholders until the PCB is finalised (search the
overlay for `TODO`):

1. **Third matrix row pin** — the build spec lists only `D4` + `D5`, but 21 keys
   need 3 rows × 7 columns. The overlay scaffolds a third row on `D15`; set it to
   the real pin.
2. **Encoder pins** — labelled `A=F4 B=F5 SW=F6` in AVR notation. On the
   nice!nano those map to different Pro Micro positions than on a 32u4, so the
   `&pro_micro` indices for the encoder are best-guess and must be confirmed
   against the nice!nano v2 pinout and your board.
3. **`.overlay` location** — for a fully standalone shield module this file
   conventionally lives at `boards/shields/nudge_controller/nudge_controller.overlay`;
   we keep it under `config/` to match the project layout. Move/copy it if you
   publish the shield separately.
