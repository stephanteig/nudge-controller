# DialEdit Prototype — Setup Guide

## What this is
A virtual controller running on your iPad that sends real keystrokes
into your Mac over WiFi. Use it to test your key layout in DaVinci
Resolve before building the physical hardware.

---

## Requirements
- Mac (macOS 12+)
- Node.js 18+ → https://nodejs.org
- iPad on the same WiFi as your Mac
- DaVinci Resolve open on your Mac

---

## Step 1 — Install dependencies

Open Terminal on your Mac, navigate to this folder, and run:

```bash
cd dialedit-prototype
npm install
```

> robotjs requires Xcode Command Line Tools.
> If you see errors: xcode-select --install

---

## Step 2 — Grant Accessibility access

robotjs needs permission to inject keystrokes.

1. System Settings → Privacy & Security → Accessibility
2. Click the + button
3. Add: Terminal (or iTerm2, whichever you use)
4. Toggle it ON

Without this, the server runs in LOG-ONLY mode (no actual keystrokes).

---

## Step 3 — Start the server

```bash
npm start
```

You'll see output like:

```
✅  robotjs loaded — keystrokes will fire into your Mac

╔══════════════════════════════════════════════╗
║         DialEdit Prototype Server            ║
╚══════════════════════════════════════════════╝

🖥   Server running. Open on your iPad:

     http://192.168.1.42:3000
     http://localhost:3000  (same Mac)
```

---

## Step 4 — Open on iPad

1. Make sure iPad is on the same WiFi as your Mac
2. Open Safari on iPad
3. Go to the IP address shown (e.g. http://192.168.1.42:3000)
4. Tap the share icon → "Add to Home Screen" for fullscreen mode

---

## Step 5 — Use it

1. Open DaVinci Resolve on your Mac
2. Click into the Resolve window so it has keyboard focus
3. Tap keys on the iPad — they fire as real keystrokes into Resolve

**Encoder:**
- DRAG up/down on the wheel for continuous scrubbing
- TAP the ↑↓ arrows for single-frame steps
- Switch modes with SCR / JOG / SHU tabs

---

## Customising the key layout

Edit `server.js` → KEY_MAP to change what keystroke each action fires.
Edit `public/index.html` → ROWS array to rename/reorder keys on the iPad.

Both changes take effect after restarting the server (Ctrl+C → npm start).

---

## Troubleshooting

**"robotjs not available"**
→ Run: npm install robotjs
→ Check Accessibility permission in System Settings

**iPad can't connect**
→ Make sure both are on same WiFi (not guest network)
→ Check Mac firewall: System Settings → Network → Firewall → allow port 3000

**Keys not firing in Resolve**
→ Click the Resolve window to give it focus before tapping iPad keys
→ The server terminal will still show what key would have fired

---

## Key mapping reference

| Action ID     | Default Key         | Resolve Function        |
|---------------|---------------------|-------------------------|
| play          | L                   | Play forward            |
| stop          | K                   | Stop                    |
| reverse       | J                   | Play reverse            |
| mark_in       | I                   | Mark In                 |
| mark_out      | O                   | Mark Out                |
| add_edit      | \                   | Add Edit                |
| undo          | Cmd+Z               | Undo                    |
| redo          | Cmd+Shift+Z         | Redo                    |
| blade         | B                   | Blade tool              |
| ripple_del    | Shift+Delete        | Ripple delete           |
| insert        | F9                  | Insert edit             |
| overwrite     | F10                 | Overwrite edit          |
| cam1–cam7     | Ctrl+1 through 7    | Multicam angle select   |
| enc_scroll_up | Up arrow            | Frame forward           |
| enc_jog_fwd   | Shift+Right         | Ripple trim +1          |
| enc_shuttle_up| ]                   | Speed ramp up           |
