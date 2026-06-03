# Case & Plate

The enclosure for the Nudge Controller: a 3D-printed two-part shell plus a
laser-cut switch plate. **The CAD/STL/DXF files are not yet in the repo** — this
is the spec and print/cut guide so they can be produced once the PCB outline is
locked.

> The case outline, mounting-hole positions, and port cutouts all derive from
> the [PCB](../pcb/README.md). Finalise the board first.

## Parts

| Part | Process | Material | Notes |
|---|---|---|---|
| Top shell | 3D print | PLA / PETG | Encoder hole + keycap openings |
| Bottom shell | 3D print | PLA / PETG | Battery pocket, USB-C cutout, switch slot |
| Switch plate | Laser cut | 1.5 mm acrylic or FR4 | 14 mm × 14 mm switch cutouts |

## 3D printing

- **Material:** PLA is fine indoors; **PETG** if it'll sit in a warm edit bay or
  near windows (PLA softens with heat).
- **Layer height:** 0.2 mm.
- **Walls:** 3 perimeters; 20–30 % infill is plenty.
- **Supports:** only under the USB-C and encoder overhangs.
- **Orientation:** print shells open-face-up for clean top surfaces.

### Cutouts to include

- **USB-C** opening aligned to the nice!nano edge.
- **Encoder** hole sized to the EC11K bushing (typically Ø7 mm) + knob clearance.
- **Power switch** slot on a side wall.
- **M2** screw bosses / heat-set insert holes matching the PCB mounting holes.

## Laser-cut switch plate

- Standard MX switch cutout is **14.0 mm × 14.0 mm**; for Kailh Choc use the
  Choc spacing/cutout instead.
- Match the 3×7 key spacing to the PCB (typically 19.05 mm / 0.75″ pitch for MX).
- 1.5 mm thickness seats MX switch clips correctly.
- Export the plate as **DXF** from your PCB/CAD tool for the laser cutter.

## Assembly

The plate sandwiches the switches against the PCB; the shells screw around the
whole stack. Full step-by-step is in the [build guide](../../docs/build-guide.md).

When the models are ready, drop `case-top.stl`, `case-bottom.stl`, and
`switch-plate.dxf` in this folder and list any print-profile specifics here.
