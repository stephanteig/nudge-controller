/**
 * App.jsx — root component of the Nudge Controller configurator
 * ─────────────────────────────────────────────────────────────────────────────
 * Holds the active layout + profile in state and switches between the four
 * panels. The layout object is the single source of truth shared by every
 * panel; it matches the shape zmkGenerator expects:
 *
 *   { name, keys: [{ action, combo, label, type }...21], encoder: {scroll,jog,shuttle} }
 */

import React, { useState } from "react";
import Dashboard from "./components/Dashboard.jsx";
import LayoutEditor from "./components/LayoutEditor.jsx";
import ProfileManager from "./components/ProfileManager.jsx";
import AIAssist from "./components/AIAssist.jsx";

// Default layout — mirrors the iPad prototype + firmware so the whole project
// describes the same 21 actions. Cut/Edit-page DaVinci Resolve defaults.
export const DEFAULT_LAYOUT = {
  name: "Resolve · Cut Page",
  keys: [
    // Row 0 — multicam camera selects
    { action: "Cam 1", combo: "Ctrl+1", label: "CAM 1", type: "cam" },
    { action: "Cam 2", combo: "Ctrl+2", label: "CAM 2", type: "cam" },
    { action: "Cam 3", combo: "Ctrl+3", label: "CAM 3", type: "cam" },
    { action: "Cam 4", combo: "Ctrl+4", label: "CAM 4", type: "cam" },
    { action: "Cam 5", combo: "Ctrl+5", label: "CAM 5", type: "cam" },
    { action: "Cam 6", combo: "Ctrl+6", label: "CAM 6", type: "cam" },
    { action: "Cam 7", combo: "Ctrl+7", label: "CAM 7", type: "cam" },
    // Row 1 — edit operations
    { action: "Mark In", combo: "I", label: "MARK IN", type: "accent" },
    { action: "Mark Out", combo: "O", label: "MARK OUT", type: "accent" },
    { action: "Add Edit", combo: "\\", label: "ADD EDIT", type: "accent" },
    { action: "Insert", combo: "F9", label: "INSERT", type: "" },
    { action: "Overwrite", combo: "F10", label: "O-WRITE", type: "" },
    { action: "Ripple Delete", combo: "Shift+Delete", label: "RIP DEL", type: "danger" },
    { action: "Blade", combo: "B", label: "BLADE", type: "" },
    // Row 2 — transport + undo
    { action: "Undo", combo: "Cmd+Z", label: "UNDO", type: "accent" },
    { action: "Redo", combo: "Cmd+Shift+Z", label: "REDO", type: "" },
    { action: "Zoom In", combo: "Cmd+=", label: "ZOOM +", type: "" },
    { action: "Zoom Out", combo: "Cmd+-", label: "ZOOM −", type: "" },
    { action: "Reverse", combo: "J", label: "◀◀", type: "transport" },
    { action: "Stop", combo: "K", label: "■", type: "transport" },
    { action: "Play", combo: "L", label: "▶", type: "transport" },
  ],
  encoder: {
    scroll: { cw: "Down", ccw: "Up" },
    jog: { cw: "Shift+Right", ccw: "Shift+Left" },
    shuttle: { cw: "]", ccw: "[" },
  },
};

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "layout", label: "Layout Editor" },
  { id: "profiles", label: "Profiles" },
  { id: "ai", label: "AI Assist" },
];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  // Deep clone so edits never mutate the exported constant.
  const [layout, setLayout] = useState(() => structuredClone(DEFAULT_LAYOUT));

  return (
    <div className="flex h-screen flex-col bg-[#0e0e0f] text-zinc-100">
      {/* Title / tab bar */}
      <header className="flex items-center gap-6 border-b border-zinc-800 px-5 py-3">
        <div className="text-lg font-extrabold tracking-tight">
          Nudge <span className="text-amber-400">Controller</span>
        </div>
        <nav className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-md px-3 py-1.5 text-sm transition ${
                tab === t.id
                  ? "bg-amber-400/15 text-amber-300"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="ml-auto text-xs text-zinc-500">{layout.name}</div>
      </header>

      {/* Active panel */}
      <main className="min-h-0 flex-1 overflow-auto p-5">
        {tab === "dashboard" && <Dashboard layout={layout} />}
        {tab === "layout" && <LayoutEditor layout={layout} setLayout={setLayout} />}
        {tab === "profiles" && (
          <ProfileManager layout={layout} setLayout={setLayout} />
        )}
        {tab === "ai" && <AIAssist layout={layout} setLayout={setLayout} />}
      </main>
    </div>
  );
}
