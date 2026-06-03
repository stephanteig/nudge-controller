/**
 * main.js — Electron main process for the Nudge Controller configurator
 * ─────────────────────────────────────────────────────────────────────────────
 * Responsibilities:
 *   • Create the app window with Web Bluetooth enabled (so the renderer can
 *     push keymaps to the controller over BLE GATT without reflashing).
 *   • Provide a native file-open dialog for importing DaVinci Resolve shortcut
 *     exports (.txt) and parse them with resolveParser.
 *   • Expose IPC handlers for saving / loading / listing / deleting profiles as
 *     JSON files under the OS user-data directory.
 *   • Generate ZMK keymaps from a layout via zmkGenerator.
 *
 * ES module — package.json sets "type": "module"; Electron ≥ 28 runs ESM main.
 */

import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";

import { parseResolveShortcuts } from "./utils/resolveParser.js";
import { generateKeymap } from "./utils/zmkGenerator.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Vite dev server when running `npm run dev`; the built bundle otherwise.
const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

/** Directory where user profiles live, e.g. ~/Library/Application Support/.../profiles */
function profilesDir() {
  return path.join(app.getPath("userData"), "profiles");
}

/** Ensure the profiles directory exists, return its path. */
async function ensureProfilesDir() {
  const dir = profilesDir();
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

/** Sanitise a profile name into a safe filename stem. */
function safeName(name) {
  return String(name || "untitled").replace(/[^a-z0-9-_ ]/gi, "").trim() || "untitled";
}

// ── Window ────────────────────────────────────────────────────────────────────
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: "#0e0e0f",
    title: "Nudge Controller",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true, // renderer cannot touch Node directly
      nodeIntegration: false,
    },
  });

  // ── Web Bluetooth device chooser ─────────────────────────────────────────
  // Electron does not show a native BLE chooser; we must resolve the selection
  // ourselves. We forward the candidate list to the renderer (which renders a
  // picker) and the renderer replies with the chosen device id over IPC.
  let bluetoothCallback = null;
  win.webContents.on("select-bluetooth-device", (event, devices, callback) => {
    event.preventDefault();
    bluetoothCallback = callback;
    // Hand the candidate list to the renderer's picker UI.
    win.webContents.send("bluetooth:devices", devices.map((d) => ({
      deviceId: d.deviceId,
      deviceName: d.deviceName || "Unknown device",
    })));
  });

  // Renderer tells us which device the user picked (or "" to cancel).
  ipcMain.on("bluetooth:select", (_event, deviceId) => {
    if (bluetoothCallback) {
      bluetoothCallback(deviceId || "");
      bluetoothCallback = null;
    }
  });

  if (DEV_SERVER_URL) {
    win.loadURL(DEV_SERVER_URL);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  return win;
}

// ── IPC: Resolve shortcut import ────────────────────────────────────────────
// Opens a native file picker, reads the chosen .txt, and returns the parsed
// { action: combo } map plus the source path. Returns null if the user cancels.
ipcMain.handle("import:resolve", async () => {
  const result = await dialog.showOpenDialog({
    title: "Import DaVinci Resolve shortcut export",
    filters: [
      { name: "Resolve shortcut export", extensions: ["txt"] },
      { name: "All files", extensions: ["*"] },
    ],
    properties: ["openFile"],
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  const filePath = result.filePaths[0];
  const text = await fs.readFile(filePath, "utf8");
  return { filePath, shortcuts: parseResolveShortcuts(text) };
});

// ── IPC: profile save / load / list / delete ────────────────────────────────
ipcMain.handle("profile:save", async (_event, profile) => {
  const dir = await ensureProfilesDir();
  const stem = safeName(profile?.name);
  const filePath = path.join(dir, `${stem}.json`);
  await fs.writeFile(filePath, JSON.stringify(profile, null, 2), "utf8");
  return { name: stem, filePath };
});

ipcMain.handle("profile:load", async (_event, name) => {
  const filePath = path.join(profilesDir(), `${safeName(name)}.json`);
  const text = await fs.readFile(filePath, "utf8");
  return JSON.parse(text);
});

ipcMain.handle("profile:list", async () => {
  const dir = await ensureProfilesDir();
  const entries = await fs.readdir(dir);
  return entries
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
});

ipcMain.handle("profile:delete", async (_event, name) => {
  const filePath = path.join(profilesDir(), `${safeName(name)}.json`);
  await fs.rm(filePath, { force: true });
  return true;
});

// ── IPC: generate ZMK keymap from a layout ──────────────────────────────────
ipcMain.handle("keymap:generate", async (_event, layout) => {
  return generateKeymap(layout);
});

// ── App lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();

  // macOS: re-create a window when the dock icon is clicked and none are open.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows close, except on macOS where apps stay alive.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
