/**
 * AIAssist.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Describe how you edit in plain language ("I cut a lot of multicam interviews,
 * keep undo/redo near the encoder") and Claude proposes a full 21-key layout +
 * encoder mapping. Review the suggestion, then apply it into the editor.
 *
 * The Anthropic API key is supplied by the user and kept in localStorage — it
 * never leaves the machine except in the direct call to api.anthropic.com.
 */

import React, { useState } from "react";

const MODEL = "claude-sonnet-4-6";
const API_URL = "https://api.anthropic.com/v1/messages";

// We ask Claude to return strict JSON matching our layout shape.
const SYSTEM_PROMPT = `You design key layouts for the Nudge Controller, a 21-key
(3 rows × 7 columns) Bluetooth editing keypad with a rotary encoder, used mainly
with DaVinci Resolve. Given a user's editing style, return ONLY a JSON object
(no prose, no markdown fence) of this exact shape:

{
  "name": "short profile name",
  "keys": [ { "action": "Mark In", "combo": "I", "label": "MARK IN" }, ... exactly 21 items, row-major ],
  "encoder": {
    "scroll":  { "cw": "Down", "ccw": "Up" },
    "jog":     { "cw": "Shift+Right", "ccw": "Shift+Left" },
    "shuttle": { "cw": "]", "ccw": "[" }
  }
}

Combos use words joined by "+": Cmd, Ctrl, Alt, Shift plus a key (letters,
digits, F1–F12, Up/Down/Left/Right, or symbols like [ ] = -). Labels are short
UPPERCASE strings. Return all 21 keys.`;

export default function AIAssist({ layout, setLayout }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("nudge.anthropicKey") || "");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [suggestion, setSuggestion] = useState(null);

  function saveKey(value) {
    setApiKey(value);
    localStorage.setItem("nudge.anthropicKey", value);
  }

  async function suggest() {
    setError("");
    setSuggestion(null);
    if (!apiKey) {
      setError("Enter your Anthropic API key first.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          // Required to call the API directly from a browser/renderer context.
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: `My editing style / request:\n${description}\n\nCurrent profile name: ${layout.name}`,
            },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error(`API ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      const text = data?.content?.[0]?.text ?? "";
      const parsed = extractJson(text);
      if (!parsed || !Array.isArray(parsed.keys)) {
        throw new Error("Claude did not return a valid layout. Try rephrasing.");
      }
      setSuggestion(parsed);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function applySuggestion() {
    if (!suggestion) return;
    // Trust our own shape; clamp to 21 keys and keep encoder defaults if absent.
    setLayout((prev) => ({
      name: suggestion.name || prev.name,
      keys: suggestion.keys.slice(0, 21),
      encoder: suggestion.encoder || prev.encoder,
    }));
    setSuggestion(null);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          AI layout assistant
        </h2>

        <label className="block text-xs text-zinc-500">
          Anthropic API key
          <input
            type="password"
            value={apiKey}
            onChange={(e) => saveKey(e.target.value)}
            placeholder="sk-ant-…"
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-200 focus:border-amber-400 focus:outline-none"
          />
        </label>

        <label className="mt-4 block text-xs text-zinc-500">
          Describe how you edit
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="e.g. I cut fast-paced multicam interviews. I want camera selects up top, trim on the encoder, and undo/redo easy to reach."
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-amber-400 focus:outline-none"
          />
        </label>

        <button
          onClick={suggest}
          disabled={busy}
          className="mt-4 rounded-md bg-amber-400 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-amber-300 disabled:opacity-40"
        >
          {busy ? "Thinking…" : "Suggest a layout"}
        </button>

        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      </section>

      {/* Suggestion preview */}
      {suggestion && (
        <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-amber-300">
              Suggested: {suggestion.name}
            </h3>
            <button
              onClick={applySuggestion}
              className="rounded-md bg-amber-400 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-amber-300"
            >
              Apply to editor
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {suggestion.keys.slice(0, 21).map((k, i) => (
              <div
                key={i}
                className="flex aspect-square flex-col items-center justify-center rounded-md border border-zinc-700 bg-zinc-900/60 p-1 text-center"
              >
                <div className="text-[9px] font-bold text-zinc-200">{k.label || k.action}</div>
                <div className="font-mono text-[8px] text-zinc-500">{k.combo}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/** Pull a JSON object out of a model response, tolerating stray prose or fences. */
function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}
