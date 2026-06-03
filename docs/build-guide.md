# Build Guide

How to assemble a Nudge Controller from the [bill of materials](bom.md). Budget
an evening if you've soldered before, a weekend if this is your first build.

> ⚠️ **LiPo safety.** Lithium batteries can vent or catch fire if shorted,
> punctured, or reverse-wired. Double-check polarity against the nice!nano
> silkscreen before connecting, never charge unattended, and stop immediately if
> the cell ever puffs up or gets hot.

---

## 0. Before you start

- Read the whole guide once.
- Confirm the PCB pin assignments match
  [`../firmware/boards/shields/nudge_controller/nudge_controller.overlay`](../firmware/boards/shields/nudge_controller/nudge_controller.overlay).
  Several pins there are still placeholders (`TODO`) until the KiCad design is
  finalised — see [hardware/pcb](../hardware/pcb/README.md).
- Flash and bench-test the firmware *before* final assembly (see
  [firmware-setup.md](firmware-setup.md)). It's far easier to debug a flat board.

---

## 1. Solder the diodes (matrix)

Each of the 21 keys gets a **1N4148** diode for the row/column matrix.

1. Bend the legs to fit the PCB footprint.
2. **Orientation matters** — the cathode (black band) goes toward the row trace,
   matching `diode-direction = "col2row"` in the overlay and the silkscreen.
3. Solder all 21, trim the legs.

A reversed diode = that whole row/column behaves oddly. If keys misbehave later,
check diode direction first.

## 2. Encoder + pull-up resistors

1. Solder the **Alps EC11K** into its footprint (3 pins on the signal side
   A/C/B, 2 mounting/switch pins on the other).
2. Add the two **10 kΩ pull-up resistors** on encoder lines **A** and **B**.
   (If your PCB doesn't break these out, solder each resistor between the A/B pin
   and the 3.3 V rail.) These keep the quadrature signal clean.
3. The encoder's **SW** (push) leg goes to its own GPIO — it's read as a 22nd
   "key" in the firmware.

## 3. Switches + plate

1. Drop the 21 switches through the **laser-cut plate** first, then seat the
   plate+switches onto the PCB so everything stays square.
2. Solder each switch's two pins.
3. Press on the keycaps.

## 4. Mount the nice!nano

1. If using sockets (recommended — lets you reuse the board), solder the
   socket strips, then seat the nice!nano on header pins.
2. Soldering directly is fine too; just be sure of orientation (USB-C edge
   facing the case port).

## 5. Battery + power switch

1. Wire the **slide switch** in line with the battery **positive** lead so you
   can fully cut power.
2. Confirm polarity: the nice!nano has `B+` / `B-` pads (or a JST footprint).
   **Red = +, black = −.** Reverse polarity can destroy the board.
3. Plug in / solder the **3.7 V LiPo**. The onboard BQ24072 charges it whenever
   USB-C is connected.

## 6. Case assembly

See [hardware/case](../hardware/case/README.md) for the printed enclosure and
plate. Typical order:

1. Seat the PCB + plate into the bottom shell.
2. Route the battery into its pocket (away from pins, with a little slack).
3. Fit the encoder knob through the top, attach the top shell.
4. Screw together with M2 hardware.

## 7. First power-on

1. Flip the power switch on.
2. On your Mac/PC/iPad, open Bluetooth settings — you should see **"Nudge
   Controller"**. Pair it.
3. Open a text editor and tap keys / spin the encoder to confirm input.
4. Open DaVinci Resolve, give it focus, and try the editing keys.

If nothing appears, jump to **Troubleshooting** in
[firmware-setup.md](firmware-setup.md).

---

## Tuning

- Change what each key/encoder does by editing the keymap (see
  [firmware-setup.md](firmware-setup.md)) or, more easily, with the
  [configurator app](app-setup.md).
- Prototype your layout on an iPad first with the
  [prototype](../prototype/README.md) — no soldering required.
