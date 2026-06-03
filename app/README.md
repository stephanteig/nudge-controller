# Configurator App

The Nudge Controller companion app — an Electron + React desktop tool for
designing key layouts, importing DaVinci Resolve shortcuts, managing profiles,
generating ZMK keymaps, and pushing them to the controller over Bluetooth.

## What's inside

```
app/
├── index.html              # Vite entry (loads the React renderer)
├── package.json            # Electron + React + Tailwind + Vite
├── vite.config.js          # builds renderer + Electron main/preload
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.js             # Electron main process (window, IPC, dialogs, BLE)
    ├── preload.js          # secure window.nudge bridge (contextIsolation)
    ├── renderer.jsx        # React mount
    ├── index.css           # Tailwind layers
    ├── App.jsx             # root component + DEFAULT_LAYOUT
    ├── components/
    │   ├── Dashboard.jsx       # connection + OTA push
    │   ├── LayoutEditor.jsx    # drag-&-drop 3×7 grid + encoder modes
    │   ├── ProfileManager.jsx  # save/load/delete + Resolve import
    │   └── AIAssist.jsx        # Claude-powered layout suggestions
    └── utils/
        ├── resolveParser.js    # parses Resolve .txt shortcut export
        └── zmkGenerator.js     # layout object → ZMK .keymap string
```

## Quick start

```bash
cd app
npm install      # dependencies are NOT committed — install them first
npm run dev      # starts Vite + launches Electron
```

`npm run build` produces the renderer bundle (`dist/`) and the Electron
main/preload (`dist-electron/`). Packaging into an installer (electron-builder)
is left as a follow-up.

## Notes

- **AI Assist** calls the Anthropic API (`claude-sonnet-4-6`) directly with a key
  you supply; the key is stored only in `localStorage`.
- **OTA push** over Web Bluetooth is scaffolded — the ZMK GATT service UUIDs in
  `Dashboard.jsx` are placeholders that must be filled in once the firmware's
  config-over-BLE channel is finalised.

Full setup walkthrough: [`../docs/app-setup.md`](../docs/app-setup.md).
