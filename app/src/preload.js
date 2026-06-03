/**
 * preload.js — secure bridge between the Electron main process and the React UI
 * ─────────────────────────────────────────────────────────────────────────────
 * With contextIsolation on, the renderer can't touch Node or ipcRenderer
 * directly. We expose a small, explicit `window.nudge` API instead — the only
 * surface the React app uses to import shortcuts, manage profiles, generate
 * keymaps, and drive the Web Bluetooth device picker.
 */

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("nudge", {
  // Resolve shortcut import — opens a native file dialog in the main process.
  importResolve: () => ipcRenderer.invoke("import:resolve"),

  // Profiles (persisted as JSON under the OS user-data dir).
  saveProfile: (profile) => ipcRenderer.invoke("profile:save", profile),
  loadProfile: (name) => ipcRenderer.invoke("profile:load", name),
  listProfiles: () => ipcRenderer.invoke("profile:list"),
  deleteProfile: (name) => ipcRenderer.invoke("profile:delete", name),

  // ZMK keymap generation from a layout object.
  generateKeymap: (layout) => ipcRenderer.invoke("keymap:generate", layout),

  // Web Bluetooth picker plumbing: subscribe to candidate devices surfaced by
  // the main process, and send back the user's choice (or "" to cancel).
  onBluetoothDevices: (handler) => {
    const listener = (_event, devices) => handler(devices);
    ipcRenderer.on("bluetooth:devices", listener);
    return () => ipcRenderer.removeListener("bluetooth:devices", listener);
  },
  selectBluetoothDevice: (deviceId) => ipcRenderer.send("bluetooth:select", deviceId),
});
