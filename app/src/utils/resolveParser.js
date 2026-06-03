/**
 * resolveParser.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Parses a DaVinci Resolve keyboard-shortcut export (plain .txt) into a flat
 * map of { "Action Name": "Key Combo" }.
 *
 * Resolve exports one shortcut per line as an action name, a run of whitespace
 * (two-or-more spaces, or a tab), then the key combo. The action name itself can
 * contain single spaces, which is why we split on a *run* of whitespace rather
 * than the first space:
 *
 *     Mark In        I
 *     Mark Out       O
 *     Cut            Cmd+X
 *     Ripple Delete  Shift+Forward Delete
 *     Undo           ⌘Z
 *
 * Category headers and blank lines (anything without a key combo) are skipped.
 *
 * ES module — no dependencies, runs in the Electron renderer or main process.
 */

// Mac glyphs Resolve sometimes uses, normalised to plain words so the rest of
// the toolchain (zmkGenerator) only ever sees Cmd / Ctrl / Alt / Shift.
const MODIFIER_GLYPHS = {
  "⌘": "Cmd",
  "⌃": "Ctrl",
  "⌥": "Alt",
  "⇧": "Shift",
};

// Canonical capitalisation for modifier words, however the export spelled them.
const MODIFIER_ALIASES = {
  cmd: "Cmd",
  command: "Cmd",
  ctrl: "Ctrl",
  control: "Ctrl",
  alt: "Alt",
  opt: "Alt",
  option: "Alt",
  shift: "Shift",
};

/**
 * Normalise a single key combo into a consistent "Mod+Mod+Key" string.
 * Expands glued Mac glyphs (e.g. "⌘⇧Z" → "Cmd+Shift+Z"), canonicalises modifier
 * spelling, and orders modifiers consistently (Cmd, Ctrl, Alt, Shift) so that
 * two exports of the same chord compare equal.
 *
 * @param {string} combo raw combo text from one export line
 * @returns {string} normalised combo, e.g. "Cmd+Shift+Z"
 */
export function normalizeCombo(combo) {
  let text = combo.trim();
  if (!text) return "";

  // Expand any leading glyphs (⌘⇧Z) into "+"-joined tokens (Cmd+Shift+Z).
  let expanded = "";
  for (const ch of text) {
    if (MODIFIER_GLYPHS[ch]) {
      expanded += MODIFIER_GLYPHS[ch] + "+";
    } else {
      expanded += ch;
    }
  }

  // Split into tokens on "+" (chords) — but keep a lone "+" key intact.
  const rawTokens = expanded === "+" ? ["+"] : expanded.split("+").map((t) => t.trim()).filter(Boolean);

  const modifiers = [];
  const keys = [];
  for (const token of rawTokens) {
    const alias = MODIFIER_ALIASES[token.toLowerCase()];
    if (alias) {
      if (!modifiers.includes(alias)) modifiers.push(alias);
    } else {
      keys.push(token);
    }
  }

  // Stable modifier order so equal chords stringify identically.
  const ORDER = ["Cmd", "Ctrl", "Alt", "Shift"];
  modifiers.sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));

  return [...modifiers, ...keys].join("+");
}

/**
 * Parse a full Resolve shortcut export.
 *
 * @param {string} text the raw .txt file contents
 * @returns {Record<string, string>} map of action name → normalised key combo
 */
export function parseResolveShortcuts(text) {
  if (typeof text !== "string") return {};

  const map = {};

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (!line.trim()) continue; // blank line

    // Split on a tab, or a run of 2+ spaces — the action/combo column gap.
    const parts = line.split(/\t+|\s{2,}/).map((p) => p.trim()).filter(Boolean);

    // Need at least an action and a combo; single-column lines are category
    // headers ("Edit", "Playback", …) — skip them.
    if (parts.length < 2) continue;

    const action = parts[0];
    // Everything after the action column is the combo (some exports add a
    // trailing context column; the combo is the second column).
    const combo = normalizeCombo(parts[1]);
    if (!combo) continue;

    map[action] = combo;
  }

  return map;
}

export default parseResolveShortcuts;
