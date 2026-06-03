/**
 * ProfileManager.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Save / load / delete named profiles (persisted as JSON by the main process)
 * and import a DaVinci Resolve shortcut export to bulk-fill key combos.
 *
 * Importing matches Resolve action names against the layout's action names
 * (case-insensitive) and updates the combo for any that line up — so an export
 * with "Mark In  I" sets the Mark In key to "I" automatically.
 */

import React, { useEffect, useState } from "react";

export default function ProfileManager({ layout, setLayout }) {
  const [profiles, setProfiles] = useState([]);
  const [name, setName] = useState(layout.name);
  const [status, setStatus] = useState("");

  async function refresh() {
    if (!window.nudge?.listProfiles) return;
    setProfiles(await window.nudge.listProfiles());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function save() {
    const profile = { ...layout, name: name.trim() || "untitled" };
    const { name: saved } = await window.nudge.saveProfile(profile);
    setLayout(profile);
    setStatus(`Saved “${saved}”.`);
    refresh();
  }

  async function load(profileName) {
    const profile = await window.nudge.loadProfile(profileName);
    setLayout(profile);
    setName(profile.name || profileName);
    setStatus(`Loaded “${profileName}”.`);
  }

  async function remove(profileName) {
    await window.nudge.deleteProfile(profileName);
    setStatus(`Deleted “${profileName}”.`);
    refresh();
  }

  async function importResolve() {
    const result = await window.nudge.importResolve();
    if (!result) return; // user cancelled
    const { shortcuts, filePath } = result;

    // Build a lower-cased lookup of imported actions.
    const lookup = {};
    for (const [action, combo] of Object.entries(shortcuts)) {
      lookup[action.toLowerCase()] = combo;
    }

    let matched = 0;
    setLayout((prev) => {
      const keys = prev.keys.map((k) => {
        const combo = lookup[(k.action || "").toLowerCase()];
        if (combo) {
          matched++;
          return { ...k, combo };
        }
        return k;
      });
      return { ...prev, keys };
    });

    const total = Object.keys(shortcuts).length;
    setStatus(
      `Imported ${total} shortcuts from ${filePath.split(/[\\/]/).pop()} — matched ${matched} keys.`
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Save current layout */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Current profile
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Profile name"
            className="flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-amber-400 focus:outline-none"
          />
          <button
            onClick={save}
            className="rounded-md bg-amber-400 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-amber-300"
          >
            Save
          </button>
          <button
            onClick={importResolve}
            className="rounded-md border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
          >
            Import Resolve .txt
          </button>
        </div>
      </section>

      {/* Saved profiles */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Saved profiles
        </h2>
        {profiles.length === 0 ? (
          <p className="text-sm text-zinc-500">No profiles saved yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {profiles.map((p) => (
              <li key={p} className="flex items-center justify-between py-2">
                <span className="text-sm text-zinc-200">{p}</span>
                <span className="flex gap-2">
                  <button
                    onClick={() => load(p)}
                    className="rounded-md border border-zinc-700 px-3 py-1 text-xs hover:bg-zinc-800"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => remove(p)}
                    className="rounded-md border border-red-500/40 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {status && <p className="text-xs text-zinc-500">{status}</p>}
    </div>
  );
}
