# Bill of Materials

Everything you need to build one Nudge Controller. Prices are rough USD
estimates (mid-2025) and vary by supplier and quantity — buying switches,
diodes, and resistors in packs lowers the per-unit cost.

| # | Part | Qty | ~Unit | ~Total | Notes / source |
|---|------|----:|------:|-------:|----------------|
| 1 | **nice!nano v2** (nRF52840) | 1 | $30 | $30 | The brain + BLE radio + LiPo charger. nicekeyboards, typeractive, or clones |
| 2 | **Alps EC11K** rotary encoder | 1 | $3 | $3 | 24 PPR, with push-switch. Mouser/Digi-Key |
| 3 | Encoder knob (aluminium, ~38 mm) | 1 | $5 | $5 | The jog/shuttle wheel feel — pick something with mass |
| 4 | Key switches (Cherry MX / Kailh) | 21 | $0.60 | $13 | Tactile recommended for editing |
| 5 | Keycaps (blank DSA or relegendable) | 21 | $0.70 | $15 | Relegendable caps let you label per profile |
| 6 | 1N4148 diodes | 21 | $0.05 | $1 | One per key, for the matrix |
| 7 | 10 kΩ resistors | 2 | $0.10 | $1 | Pull-ups on encoder A + B |
| 8 | 3.7 V LiPo, 2000 mAh | 1 | $10 | $10 | JST-PH 2.0 mm. **Check polarity before plugging in** |
| 9 | JST-PH 2.0 mm pigtail/connector | 1 | $1 | $1 | If your battery lead doesn't match the board |
| 10 | Slide power switch | 1 | $1 | $1 | Hard cut-off between battery and board |
| 11 | Custom PCB | 1 | $15 | $15 | Per board in a batch of 5 from JLCPCB/PCBWay |
| 12 | 3D-printed case | 1 | $8 | $8 | ~80 g filament, or use a print service |
| 13 | Laser-cut switch plate (acrylic/FR4) | 1 | $6 | $6 | Holds switches square to the PCB |
| 14 | Screws, standoffs, hookup wire | — | — | $5 | M2 hardware + a little wire |
| 15 | USB-C cable | 1 | $3 | $3 | For flashing + charging |
| | **Subtotal** | | | **≈ $117** | |
| | Shipping (typical) | | | **≈ $13** | Spread across the order |
| | **Total** | | | **≈ $130** | |

## Cost comparison

| | Nudge Controller | Blackmagic Speed Editor |
|---|---:|---:|
| Price | **~$130** | **$475** |
| Wireless | ✅ Bluetooth 5.0 | ✅ Bluetooth |
| Open / hackable | ✅ fully | ❌ |
| Works beyond Resolve | ✅ any app (it's a BLE keyboard) | ⚠️ Resolve-focused |
| Keys | 21 + encoder | ~50 + search dial |

You give up some keys and Blackmagic's exact dial feel, but you get a fully
open, reprogrammable controller for roughly a quarter of the price.

## Tools (not consumed)

- Soldering iron + solder
- Flush cutters, tweezers
- (Optional) hot-air station for the nice!nano headers
- Multimeter for continuity / polarity checks

See [`build-guide.md`](build-guide.md) for assembly.
