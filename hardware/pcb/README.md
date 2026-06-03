# PCB

KiCad design for the Nudge Controller main board. **The KiCad project files are
not yet in the repo** — this is the setup + export guide so the design can be
reproduced and fabbed.

> ⚠️ **Pin assignments are not final.** The firmware overlay
> ([`../../firmware/config/nudge_controller.overlay`](../../firmware/config/nudge_controller.overlay))
> contains placeholder pins marked `TODO` — notably the 3rd matrix row and the
> encoder A/B/SW pins. The PCB netlist and that overlay must agree before either
> is trusted. Fill in the real values once the schematic is drawn.

## Tools

- [KiCad 7+](https://www.kicad.org/) (free, open source)
- The [nice!nano footprint/symbol](https://nicekeyboards.com/docs/nice-nano/)
  (Pro Micro–compatible) — add it as a library

## Schematic outline

Draw these nets:

1. **nice!nano socket** — Pro Micro pinout. Bring out the GPIO used by the
   matrix and encoder, plus `3V3`, `GND`, `B+`/`B-`.
2. **Key matrix** — 3 rows × 7 columns = 21 switches. One **1N4148** per key,
   cathode toward the row (`col2row`). Rows = `D4`, `D5`, + a 3rd row pin (TBD);
   columns = `D6 D7 D8 D9 D10 D16 D14`.
3. **Encoder** — Alps EC11K: A, B, C(common→GND), and the push-switch (SW).
   **10 kΩ pull-ups** from A→3V3 and B→3V3. AVR-label pins A=F4, B=F5, SW=F6 —
   map these to real nice!nano GPIO and update the overlay.
4. **Power** — JST-PH 2.0 mm to `B+`/`B-`, with a slide switch inline on `B+`.

## PCB layout tips

- Keep the encoder traces (A/B) short and away from the antenna end of the
  nice!nano.
- Leave the nice!nano's antenna corner free of copper pour.
- Reserve a battery pocket footprint / keep-out so the cell isn't under pins.
- Add mounting holes that line up with the case and switch plate.

## Exporting Gerbers (for JLCPCB / PCBWay)

1. **File → Plot**. Output format **Gerber**.
2. Select layers: `F.Cu`, `B.Cu`, `F.Mask`, `B.Mask`, `F.SilkS`, `B.SilkS`,
   `Edge.Cuts`. Enable *Plot footprint values/references* as desired.
3. Plot, then **Generate Drill Files** (Excellon, PTH+NPTH, same output dir).
4. Zip the whole output folder.
5. Upload the zip to your fab; choose 1.6 mm FR4, HASL or ENIG, and order a
   small batch (5 is usually the minimum/cheapest).

When the KiCad project lands here, this README should list the exact file names
and any board revision notes.
