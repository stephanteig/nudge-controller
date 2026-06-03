/**
 * zmkGenerator.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Turns a layout object (as edited in the companion app) into a valid ZMK
 * `.keymap` string. The output mirrors the hand-written
 * firmware/nudge_controller.keymap: a shared 3×7 key grid across three
 * encoder-mode layers (SCROLL / JOG / SHUTTLE) plus a Bluetooth layer, and the
 * tap-cycle / hold-for-BT encoder button.
 *
 * Layout shape:
 *   {
 *     name: "Resolve Cut Page",
 *     keys: [ { action: "Mark In", combo: "I" }, ... up to 21 ],   // row-major
 *     encoder: {
 *       scroll:  { cw: "Down",        ccw: "Up" },
 *       jog:     { cw: "Shift+Right", ccw: "Shift+Left" },
 *       shuttle: { cw: "]",           ccw: "[" },
 *     }
 *   }
 *
 * Combos use the same human notation produced by resolveParser.js
 * ("Cmd+Shift+Z", "Up", "]", "F9"). ES module, no dependencies.
 */

const GRID_SIZE = 21; // 3 rows × 7 columns

// Canonical modifier word → ZMK modifier-function wrapper.
const MODIFIER_TO_ZMK = {
  cmd: "LG",     // left GUI / Command
  command: "LG",
  win: "LG",
  gui: "LG",
  ctrl: "LC",    // left Control
  control: "LC",
  alt: "LA",     // left Alt / Option
  opt: "LA",
  option: "LA",
  shift: "LS",   // left Shift
};

// Named keys / symbols → ZMK keycode. Anything not listed falls through to the
// single-letter / single-digit handling in comboToZmk().
const KEY_TO_ZMK = {
  up: "UP", down: "DOWN", left: "LEFT", right: "RIGHT",
  enter: "RET", return: "RET", esc: "ESC", escape: "ESC",
  tab: "TAB", space: "SPACE", spacebar: "SPACE",
  backspace: "BSPC", del: "DEL", delete: "DEL",
  "forward delete": "DEL", home: "HOME", end: "END",
  pageup: "PG_UP", "page up": "PG_UP", pagedown: "PG_DN", "page down": "PG_DN",
  // symbols
  "\\": "BSLH", "/": "FSLH", "[": "LBKT", "]": "RBKT",
  "=": "EQUAL", "-": "MINUS", ";": "SEMI", "'": "SQT",
  ",": "COMMA", ".": "DOT", "`": "GRAVE",
};

/**
 * Convert a human key combo into a ZMK `&kp` parameter, with modifiers nested
 * outermost-first. E.g. "Cmd+Shift+Z" → "LG(LS(Z))", "I" → "I", "]" → "RBKT".
 *
 * @param {string} combo human combo, e.g. "Cmd+Shift+Z"
 * @returns {string} ZMK keycode expression suitable for `&kp <expr>`
 */
export function comboToZmk(combo) {
  const text = (combo || "").trim();
  if (!text) return "NONE";

  // Lone "+" is the plus key, not a separator.
  const tokens = text === "+" ? ["+"] : text.split("+").map((t) => t.trim()).filter(Boolean);

  const modifiers = [];
  let keyToken = null;
  for (const token of tokens) {
    const mod = MODIFIER_TO_ZMK[token.toLowerCase()];
    if (mod) modifiers.push(mod);
    else keyToken = token; // last non-modifier token is the key
  }

  let keycode = keyCodeFor(keyToken);

  // Nest modifiers: Cmd+Shift+Z → LG(LS(Z))
  for (let i = modifiers.length - 1; i >= 0; i--) {
    keycode = `${modifiers[i]}(${keycode})`;
  }
  return keycode;
}

/** Map a single (already modifier-stripped) key token to a ZMK keycode. */
function keyCodeFor(token) {
  if (!token) return "NONE";
  const lower = token.toLowerCase();

  if (KEY_TO_ZMK[lower]) return KEY_TO_ZMK[lower];

  // Function keys F1–F12
  const fn = lower.match(/^f([1-9]|1[0-2])$/);
  if (fn) return `F${fn[1]}`;

  // Single digit → N0..N9
  if (/^[0-9]$/.test(token)) return `N${token}`;

  // Single letter → uppercase letter keycode
  if (/^[a-zA-Z]$/.test(token)) return token.toUpperCase();

  // "+" key
  if (token === "+") return "PLUS";

  // Fallback: assume it's already a valid ZMK keycode (e.g. "C_PLAY_PAUSE").
  return token.toUpperCase();
}

/** Build the `&kp …` binding for one combo (or `&trans` for an empty slot). */
function keyBinding(combo) {
  if (!combo) return "&trans";
  return `&kp ${comboToZmk(combo)}`;
}

/** Format a flat array of 21 binding strings as 3 aligned rows of 7. */
function formatGrid(bindings) {
  const rows = [];
  for (let r = 0; r < 3; r++) {
    const slice = bindings.slice(r * 7, r * 7 + 7);
    rows.push("                " + slice.join(" "));
  }
  return rows.join("\n");
}

/** `sensor-bindings` line for an encoder mode (cw first, ccw second). */
function sensorBinding(mode) {
  const cw = comboToZmk(mode?.cw || "");
  const ccw = comboToZmk(mode?.ccw || "");
  return `<&inc_dec_kp ${cw} ${ccw}>`;
}

/**
 * Generate a full ZMK `.keymap` string from a layout.
 *
 * @param {object} layout see shape in the file header
 * @returns {string} the contents of a ready-to-build nudge_controller.keymap
 */
export function generateKeymap(layout = {}) {
  const keys = Array.isArray(layout.keys) ? layout.keys : [];
  if (keys.length > GRID_SIZE) {
    throw new Error(`Layout has ${keys.length} keys; the Nudge Controller grid holds ${GRID_SIZE}.`);
  }

  // Pad to 21 slots so missing keys become &trans.
  const padded = [...keys];
  while (padded.length < GRID_SIZE) padded.push(null);

  const gridBindings = padded.map((k) => keyBinding(k && k.combo));
  const grid = formatGrid(gridBindings);

  const enc = layout.encoder || {};
  const scroll = sensorBinding(enc.scroll || { cw: "Down", ccw: "Up" });
  const jog = sensorBinding(enc.jog || { cw: "Shift+Right", ccw: "Shift+Left" });
  const shuttle = sensorBinding(enc.shuttle || { cw: "]", ccw: "[" });

  const name = layout.name || "Nudge Controller";

  return `/*
 * Generated by the Nudge Controller configurator — do not hand-edit.
 * Layout: ${name}
 */

#include <behaviors.dtsi>
#include <dt-bindings/zmk/keys.h>
#include <dt-bindings/zmk/bt.h>

#define SCROLL  0
#define JOG     1
#define SHUTTLE 2
#define BT      3

/ {
    behaviors {
        enc_btn: encoder_button_hold_tap {
            compatible = "zmk,behavior-hold-tap";
            #binding-cells = <2>;
            flavor = "tap-preferred";
            tapping-term-ms = <220>;
            bindings = <&to>, <&mo>;
        };
    };

    keymap {
        compatible = "zmk,keymap";

        scroll_layer {
            display-name = "Scroll";
            bindings = <
${grid}
                &enc_btn JOG BT
            >;
            sensor-bindings = ${scroll};
        };

        jog_layer {
            display-name = "Jog";
            bindings = <
${grid}
                &enc_btn SHUTTLE BT
            >;
            sensor-bindings = ${jog};
        };

        shuttle_layer {
            display-name = "Shuttle";
            bindings = <
${grid}
                &enc_btn SCROLL BT
            >;
            sensor-bindings = ${shuttle};
        };

        bt_layer {
            display-name = "Bluetooth";
            bindings = <
                &bt BT_SEL 0 &bt BT_SEL 1 &bt BT_SEL 2 &bt BT_SEL 3 &bt BT_SEL 4 &bt BT_CLR &trans
                &trans       &trans       &trans       &trans       &trans       &trans     &trans
                &trans       &trans       &trans       &trans       &trans       &trans     &trans
                &to SCROLL
            >;
            sensor-bindings = <&inc_dec_kp C_VOL_UP C_VOL_DN>;
        };
    };
};
`;
}

export default generateKeymap;
