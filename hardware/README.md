# Hardware

Design files for the Nudge Controller's physical build — the PCB and the case.

```
hardware/
├── pcb/    # KiCad project, schematic, and Gerber export guide
└── case/   # 3D-printed enclosure + laser-cut switch plate
```

## Overview

The board is a single PCB carrying:
- a **nice!nano v2** socket (the MCU + BLE + LiPo charger),
- a **21-key matrix** (3 rows × 7 columns) of MX/Choc switches with per-key diodes,
- an **Alps EC11K** rotary encoder with two 10 kΩ pull-ups and a push-switch,
- a **JST-PH 2.0 mm** LiPo connector and an inline power switch.

The case holds the PCB + switch plate, the battery, and the encoder knob.

| Sub-project | Status | Notes |
|---|---|---|
| [PCB](pcb/README.md) | 🚧 design pending | Pin assignments not yet final — see firmware overlay `TODO`s |
| [Case](case/README.md) | 🚧 design pending | Print + plate dimensions follow the PCB outline |

Start with the [build guide](../docs/build-guide.md) for assembly once these
files exist.
