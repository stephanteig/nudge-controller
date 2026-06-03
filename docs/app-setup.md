# Configurator App Setup

The companion app ([`../app/`](../app/)) is an Electron + React desktop tool for
designing layouts, importing DaVinci Resolve shortcuts, managing profiles, and
pushing keymaps to the controller over Bluetooth.

---

## 1. Install

```bash
cd app
npm install
```

You need **Node.js 18+**. Dependencies (Electron, React, Vite, Tailwind) are
not committed — `npm install` pulls them.

## 2. Run

```bash
npm run dev
```

Vite serves the React UI and launches Electron pointed at it. The window opens
with four tabs: **Dashboard**, **Layout Editor**, **Profiles**, **AI Assist**.

To produce a build:

```bash
npm run build   # renderer → dist/, Electron main/preload → dist-electron/
```

(Packaging into a distributable installer with electron-builder is a follow-up.)

## 3. Import your Resolve shortcuts

1. In DaVinci Resolve: **Keyboard Customization** → export your shortcut set as
   a text file.
2. In the app, go to **Profiles → Import Resolve .txt** and pick that file.
3. The parser
   ([`resolveParser.js`](../app/src/utils/resolveParser.js)) reads lines like
   `Mark In    I` and fills in any key whose action name matches.

## 4. Edit the layout

In **Layout Editor**:
- Drag an action from the palette onto a key.
- Drag one key onto another to swap them.
- Click a key to edit its label / action / combo inline.
- Set the **CW/CCW** combo for each encoder mode (Scroll / Jog / Shuttle).

## 5. Save & manage profiles

**Profiles** saves the current layout as JSON under your OS user-data folder, and
lets you load or delete saved profiles. Build one profile per app or workflow
(Resolve Cut, Resolve Edit, Premiere, …).

## 6. Push to the controller

In **Dashboard**:
1. Click **Connect via Bluetooth** and pick your controller.
2. Click **Push keymap (OTA)** to generate the ZMK keymap from your layout.

> ⚠️ The over-the-air write is **scaffolded but not finished** — the ZMK GATT
> service UUIDs in [`Dashboard.jsx`](../app/src/components/Dashboard.jsx) are
> placeholders. Until that's wired up, copy the generated keymap into
> `firmware/nudge_controller.keymap` and reflash
> (see [firmware-setup.md](firmware-setup.md)).

## 7. AI Assist (optional)

**AI Assist** asks Claude (`claude-sonnet-4-6`) to propose a layout from a
plain-language description of how you edit.

1. Paste your **Anthropic API key** (kept only in `localStorage`).
2. Describe your editing style.
3. Click **Suggest a layout**, review the preview, and **Apply to editor**.

---

## Troubleshooting

| Symptom | Try |
|---|---|
| `npm run dev` errors on launch | Confirm Node 18+, delete `node_modules`, reinstall |
| No controller in the BLE picker | Power it on; ensure it's not already paired/connected elsewhere |
| Import matched 0 keys | Action names must match the layout's (case-insensitive); rename in Layout Editor |
| AI Assist fails | Check the API key and your network; the error text is shown under the button |
