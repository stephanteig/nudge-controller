# Firmware Setup & Flashing

The Nudge Controller runs [ZMK](https://zmk.dev). You don't compile anything
locally — you fork a config repo, push, and GitHub Actions builds a `.uf2` file
you drag onto the board. See [`../firmware/`](../firmware/) for the actual config.

---

## 1. Get a ZMK config repo

Two options:

**A. Use this repo's `firmware/` directly.** Add a ZMK `build.yaml` and the ZMK
GitHub Actions workflow, then push. The build matrix entry is:

```yaml
include:
  - board: nice_nano@2.0.0//zmk   # nice!nano v2 (ZMK hardware-model-v2 id)
    shield: nudge_controller
```

**B. Fork [zmk-config](https://github.com/zmkfirmware/zmk-config-template)** and
copy in the `firmware/` contents:
- `nudge_controller.keymap`
- `nudge_controller.conf`
- `west.yml`
- `boards/shields/nudge_controller/` (the whole folder, incl. `nudge_controller.overlay`)

> Layout: this is the standard ZMK "config in a folder" structure. The keymap +
> `.conf` sit at the `firmware/` root (the `ZMK_CONFIG` dir, `config_path: firmware`),
> and the hardware `.overlay` lives in `boards/shields/nudge_controller/`, where
> ZMK auto-applies it for the shield.

## 2. Build

1. Push to GitHub.
2. Open the **Actions** tab — the "Build ZMK firmware" workflow runs
   automatically.
3. When it's green, download the **firmware** artifact. Inside is
   the `nudge_controller` `.uf2` for nice!nano v2.

## 3. Flash

The nice!nano flashes over USB as a mass-storage device:

1. Connect the board via USB-C.
2. **Double-tap the reset button.** A drive named `NICENANO` appears.
3. Drag the `.uf2` onto that drive.
4. The board reboots automatically and the drive disappears — done.

## 4. Pair over Bluetooth

1. Power on (USB or battery).
2. On your host, open Bluetooth settings and pair **"Nudge Controller"**.
3. It connects to BLE **profile 0** by default.

### Multi-device profiles (up to 5)

Pair the controller with several hosts and switch instantly:

1. **Hold the encoder push** to enter the Bluetooth layer.
2. The **top row** keys select profiles **0–4** (`BT_SEL`); the 6th key
   **clears** the current pairing (`BT_CLR`).
3. To pair a new host: select an unused profile, then pair from that host's
   Bluetooth menu.

This is configured by `CONFIG_BT_MAX_PAIRED=5` /`CONFIG_BT_MAX_CONN=5` in
[`nudge_controller.conf`](../firmware/nudge_controller.conf).

## 5. Encoder modes

- **Tap** the encoder push to cycle **Scroll → Jog → Shuttle → Scroll**.
- Each mode rotates differently (timeline scroll / frame trim / speed ramp) —
  see the table in [`../firmware/README.md`](../firmware/README.md).

## 6. Editing the keymap

- **Easiest:** use the [configurator app](app-setup.md) to drag keys around,
  import your Resolve shortcuts, and export a keymap.
- **By hand:** edit
  [`nudge_controller.keymap`](../firmware/nudge_controller.keymap),
  push, and reflash. ZMK keycodes are listed at
  <https://zmk.dev/docs/keymaps/list-of-keycodes>.

---

## Battery

`CONFIG_ZMK_BATTERY_REPORTING=y` advertises charge level over BLE — your OS and
the configurator app show it. Deep sleep (`CONFIG_ZMK_SLEEP=y`) kicks in after
15 minutes idle and the board wakes on the next keypress/turn.

## Troubleshooting

| Symptom | Try |
|---|---|
| `NICENANO` drive doesn't appear | Double-tap reset faster; try another USB **data** cable |
| Build fails in Actions | Check `build.yaml` shield/board names match exactly |
| Some keys dead / whole row/col dead | Reversed or cold-soldered diode; check matrix wiring |
| Encoder skips or jumps | Verify A/B pins + 10 kΩ pull-ups; confirm `steps = <24>` |
| Won't pair / wrong device | Enter BT layer, `BT_CLR` the profile, re-pair |
| Pins seem wrong | Resolve the `TODO` pins in the overlay against your PCB |
