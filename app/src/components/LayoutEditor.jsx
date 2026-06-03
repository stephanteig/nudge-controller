/**
 * LayoutEditor.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Visual editor for the 21-key grid (3 rows × 7 columns) and the three encoder
 * modes. You can:
 *   • drag an action from the palette onto a key to assign it,
 *   • drag one key onto another to swap them,
 *   • click a key to edit its combo inline,
 *   • edit the CW/CCW combo for each encoder mode.
 *
 * All edits flow through setLayout so Dashboard / Profiles / AI stay in sync.
 */

import React, { useState } from "react";

// A small palette of common Resolve actions to drag onto keys.
const PALETTE = [
  "Mark In", "Mark Out", "Add Edit", "Insert", "Overwrite", "Ripple Delete",
  "Blade", "Undo", "Redo", "Zoom In", "Zoom Out", "Play", "Stop", "Reverse",
  "Snap", "Next Edit", "Prev Edit", "Cut", "Copy", "Paste",
];

const TYPE_STYLES = {
  cam: "border-indigo-500/40 bg-indigo-500/10 text-indigo-300",
  accent: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  danger: "border-red-500/40 bg-red-500/10 text-red-300",
  transport: "border-teal-500/40 bg-teal-500/10 text-teal-300",
  "": "border-zinc-700 bg-zinc-800/60 text-zinc-300",
};

export default function LayoutEditor({ layout, setLayout }) {
  const [editing, setEditing] = useState(null); // index of key being edited

  function updateKey(index, patch) {
    setLayout((prev) => {
      const keys = prev.keys.map((k, i) => (i === index ? { ...k, ...patch } : k));
      return { ...prev, keys };
    });
  }

  function swapKeys(a, b) {
    if (a === b) return;
    setLayout((prev) => {
      const keys = [...prev.keys];
      [keys[a], keys[b]] = [keys[b], keys[a]];
      return { ...prev, keys };
    });
  }

  function setEncoder(mode, side, value) {
    setLayout((prev) => ({
      ...prev,
      encoder: { ...prev.encoder, [mode]: { ...prev.encoder[mode], [side]: value } },
    }));
  }

  // ── Drag & drop ──────────────────────────────────────────────────────────
  function onDragStart(e, payload) {
    e.dataTransfer.setData("application/json", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "move";
  }

  function onDropKey(e, targetIndex) {
    e.preventDefault();
    let payload;
    try {
      payload = JSON.parse(e.dataTransfer.getData("application/json"));
    } catch {
      return;
    }
    if (payload.kind === "palette") {
      // Assign a new action; keep the existing combo unless empty.
      updateKey(targetIndex, { action: payload.action, label: payload.action.toUpperCase() });
    } else if (payload.kind === "key") {
      swapKeys(payload.index, targetIndex);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Action palette */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Actions — drag onto a key
        </h2>
        <div className="flex flex-wrap gap-2">
          {PALETTE.map((action) => (
            <span
              key={action}
              draggable
              onDragStart={(e) => onDragStart(e, { kind: "palette", action })}
              className="cursor-grab rounded-md border border-zinc-700 bg-zinc-800/60 px-2.5 py-1 text-xs text-zinc-300 hover:border-amber-400/50"
            >
              {action}
            </span>
          ))}
        </div>
      </section>

      {/* 3×7 key grid */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Key grid
        </h2>
        <div className="grid grid-cols-7 gap-2">
          {layout.keys.map((key, i) => (
            <div
              key={i}
              draggable
              onDragStart={(e) => onDragStart(e, { kind: "key", index: i })}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDropKey(e, i)}
              onClick={() => setEditing(i)}
              className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border p-1 text-center transition ${
                TYPE_STYLES[key.type ?? ""] || TYPE_STYLES[""]
              } ${editing === i ? "ring-2 ring-amber-400" : ""}`}
            >
              <div className="text-[10px] font-bold leading-tight">
                {key.label || key.action}
              </div>
              <div className="font-mono text-[9px] text-zinc-500">{key.combo || "—"}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Inline combo editor */}
      {editing != null && (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h3 className="mb-3 text-sm font-semibold text-zinc-300">
            Edit “{layout.keys[editing].action}”
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <Field
              label="Label"
              value={layout.keys[editing].label || ""}
              onChange={(v) => updateKey(editing, { label: v })}
            />
            <Field
              label="Action"
              value={layout.keys[editing].action || ""}
              onChange={(v) => updateKey(editing, { action: v })}
            />
            <Field
              label="Key combo"
              placeholder="e.g. Cmd+Shift+Z"
              value={layout.keys[editing].combo || ""}
              onChange={(v) => updateKey(editing, { combo: v })}
            />
          </div>
          <button
            onClick={() => setEditing(null)}
            className="mt-4 rounded-md border border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-800"
          >
            Done
          </button>
        </section>
      )}

      {/* Encoder modes */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Encoder modes
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {["scroll", "jog", "shuttle"].map((mode) => (
            <div key={mode} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-300">
                {mode}
              </div>
              <Field
                label="Clockwise →"
                value={layout.encoder[mode]?.cw || ""}
                onChange={(v) => setEncoder(mode, "cw", v)}
              />
              <div className="h-2" />
              <Field
                label="Counter-clockwise ←"
                value={layout.encoder[mode]?.ccw || ""}
                onChange={(v) => setEncoder(mode, "ccw", v)}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="block text-xs text-zinc-500">
      {label}
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5 font-mono text-sm text-zinc-200 focus:border-amber-400 focus:outline-none"
      />
    </label>
  );
}
