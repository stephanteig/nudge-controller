/**
 * DialEdit Prototype Server
 * Run on your Mac: node server.js
 * Then open http://YOUR_MAC_IP:3000 on your iPad
 *
 * Requirements:
 *   npm install ws robotjs express
 *
 * On macOS you must grant Accessibility permission to Terminal (or iTerm):
 *   System Settings → Privacy & Security → Accessibility → add Terminal
 */

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const os = require("os");

// ── Try to load robotjs (requires Accessibility permission) ──────────────────
let robot = null;
try {
  robot = require("robotjs");
  console.log("✅  robotjs loaded — keystrokes will fire into your Mac");
} catch (e) {
  console.warn("⚠️   robotjs not available — running in LOG-ONLY mode");
  console.warn("    Run: npm install robotjs");
  console.warn("    Then grant Terminal Accessibility access in System Settings\n");
}

// ── Key map: action ID → robotjs keyCombo ────────────────────────────────────
// Format: { key: string, modifiers: string[] }
// robotjs modifier names: "command", "shift", "control", "alt"
const KEY_MAP = {
  // Transport
  play:        { key: "l" },
  stop:        { key: "k" },
  reverse:     { key: "j" },

  // Marking
  mark_in:     { key: "i" },
  mark_out:    { key: "o" },

  // Editing
  add_edit:    { key: "\\", modifiers: [] },        // Cmd+\ in some configs
  cut_clip:    { key: "x", modifiers: ["command"] },
  undo:        { key: "z", modifiers: ["command"] },
  redo:        { key: "z", modifiers: ["command", "shift"] },
  ripple_del:  { key: "delete", modifiers: ["shift"] },
  insert:      { key: "f9" },
  overwrite:   { key: "f10" },

  // Navigation
  next_edit:   { key: "down" },
  prev_edit:   { key: "up" },
  zoom_in:     { key: "=", modifiers: ["command"] },
  zoom_out:    { key: "-", modifiers: ["command"] },
  snap:        { key: "n" },

  // Blade
  blade:       { key: "b" },

  // Camera cuts (multicam)
  cam1:        { key: "1", modifiers: ["control"] },
  cam2:        { key: "2", modifiers: ["control"] },
  cam3:        { key: "3", modifiers: ["control"] },
  cam4:        { key: "4", modifiers: ["control"] },
  cam5:        { key: "5", modifiers: ["control"] },
  cam6:        { key: "6", modifiers: ["control"] },
  cam7:        { key: "7", modifiers: ["control"] },

  // Encoder — scroll mode
  enc_scroll_up:    { key: "up" },
  enc_scroll_down:  { key: "down" },

  // Encoder — jog mode (frame by frame)
  enc_jog_fwd:   { key: "right", modifiers: ["shift"] },
  enc_jog_back:  { key: "left", modifiers: ["shift"] },

  // Encoder — shuttle mode (speed ramp)
  enc_shuttle_up:   { key: "]" },
  enc_shuttle_down: { key: "[" },
};

// ── Fire a keystroke ─────────────────────────────────────────────────────────
function fireKey(actionId) {
  const mapping = KEY_MAP[actionId];
  if (!mapping) {
    console.warn(`  ⚠️  No mapping for action: ${actionId}`);
    return;
  }

  const { key, modifiers = [] } = mapping;
  console.log(`  ⌨️  ${actionId} → ${modifiers.length ? modifiers.join("+") + "+" : ""}${key}`);

  if (robot) {
    try {
      if (modifiers.length > 0) {
        robot.keyTap(key, modifiers);
      } else {
        robot.keyTap(key);
      }
    } catch (err) {
      console.error(`  ❌  robotjs error: ${err.message}`);
    }
  }
}

// ── Express app — serves the iPad web app ────────────────────────────────────
const app = express();
app.use(express.static(path.join(__dirname, "public")));

// API: get the current key map so iPad can display it
app.get("/keymap", (req, res) => {
  res.json(KEY_MAP);
});

// ── HTTP + WebSocket server ──────────────────────────────────────────────────
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let connectedClients = 0;

wss.on("connection", (ws, req) => {
  connectedClients++;
  const ip = req.socket.remoteAddress;
  console.log(`\n📱  iPad connected from ${ip} (${connectedClients} client(s))`);

  ws.on("message", (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    switch (msg.type) {
      case "KEY_PRESS":
        fireKey(msg.action);
        // Echo back for visual feedback on iPad
        ws.send(JSON.stringify({ type: "KEY_ACK", action: msg.action }));
        break;

      case "ENCODER_TICK":
        // msg.direction: "cw" or "ccw", msg.mode: "SCROLL"|"JOG"|"SHUTTLE"
        const encAction = `enc_${msg.mode.toLowerCase()}_${msg.direction === "cw" ? "up" : "down"}`;
        fireKey(encAction);

        // Repeat for velocity — fast spin sends multiple ticks
        const velocity = Math.min(msg.velocity || 1, 6);
        for (let i = 1; i < velocity; i++) {
          setTimeout(() => fireKey(encAction), i * 18);
        }
        ws.send(JSON.stringify({ type: "ENC_ACK", action: encAction, velocity }));
        break;

      case "PING":
        ws.send(JSON.stringify({ type: "PONG", ts: Date.now() }));
        break;
    }
  });

  ws.on("close", () => {
    connectedClients--;
    console.log(`📱  iPad disconnected (${connectedClients} client(s))`);
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = 3000;
server.listen(PORT, "0.0.0.0", () => {
  // Print all local IPs
  const nets = os.networkInterfaces();
  const ips = [];
  for (const iface of Object.values(nets)) {
    for (const addr of iface) {
      if (addr.family === "IPv4" && !addr.internal) ips.push(addr.address);
    }
  }

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║         DialEdit Prototype Server            ║");
  console.log("╚══════════════════════════════════════════════╝\n");
  console.log("🖥   Server running. Open on your iPad:\n");
  ips.forEach(ip => console.log(`     http://${ip}:${PORT}`));
  console.log(`     http://localhost:${PORT}  (same Mac)\n`);
  console.log("📋  Make sure:");
  console.log("    1. iPad and Mac are on the same WiFi");
  console.log("    2. Terminal has Accessibility access in System Settings");
  console.log("    3. DaVinci Resolve is in focus when you tap keys\n");
});
