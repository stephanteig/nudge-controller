/**
 * Dashboard.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Connection status + Web Bluetooth pairing + "push keymap over the air".
 *
 * The connect flow uses the browser Web Bluetooth API (navigator.bluetooth).
 * Electron suppresses its built-in device chooser, so main.js forwards the
 * candidate list to us via window.nudge.onBluetoothDevices and we reply with
 * window.nudge.selectBluetoothDevice — see preload.js / main.js.
 */

import React, { useEffect, useState } from "react";

// ⚠️ HARDWARE TODO: ZMK exposes its config service over GATT (the same channel
// ZMK Studio uses). Fill in the real service/characteristic UUIDs once decided;
// these placeholders let the UI compile and the connection flow run.
const ZMK_SERVICE_UUID = "00000000-0000-0000-0000-000000000000"; // TODO
const ZMK_KEYMAP_CHARACTERISTIC = "00000000-0000-0000-0000-000000000001"; // TODO

export default function Dashboard({ layout }) {
  const [status, setStatus] = useState("disconnected"); // disconnected | connecting | connected
  const [deviceName, setDeviceName] = useState(null);
  const [battery, setBattery] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [log, setLog] = useState("");

  // Subscribe to the candidate-device list pushed from the main process.
  useEffect(() => {
    if (!window.nudge?.onBluetoothDevices) return;
    return window.nudge.onBluetoothDevices((devices) => setCandidates(devices));
  }, []);

  function append(line) {
    setLog((prev) => (prev ? prev + "\n" : "") + line);
  }

  async function connect() {
    if (!navigator.bluetooth) {
      append("Web Bluetooth is unavailable in this build.");
      return;
    }
    setStatus("connecting");
    try {
      const device = await navigator.bluetooth.requestDevice({
        // Match ZMK controllers by name prefix; also accept our service.
        filters: [{ namePrefix: "Nudge" }],
        optionalServices: [ZMK_SERVICE_UUID, "battery_service"],
      });
      setDeviceName(device.name || "Nudge Controller");
      const server = await device.gatt.connect();
      setStatus("connected");
      append(`Connected to ${device.name || "controller"}.`);

      // Read battery level if the device exposes the standard service.
      try {
        const svc = await server.getPrimaryService("battery_service");
        const ch = await svc.getCharacteristic("battery_level");
        const val = await ch.readValue();
        setBattery(val.getUint8(0));
      } catch {
        /* battery service optional */
      }

      device.addEventListener("gattserverdisconnected", () => {
        setStatus("disconnected");
        setDeviceName(null);
        append("Controller disconnected.");
      });
    } catch (err) {
      setStatus("disconnected");
      append(`Connect failed: ${err.message}`);
    }
  }

  async function pushKeymap() {
    append("Generating keymap…");
    const keymap = await window.nudge.generateKeymap(layout);
    append(`Generated ${keymap.split("\n").length} lines of ZMK config.`);
    // ⚠️ HARDWARE TODO: once ZMK_SERVICE_UUID / characteristic are real, write
    // the keymap (or its compiled form) here over GATT, e.g.:
    //   const svc = await server.getPrimaryService(ZMK_SERVICE_UUID);
    //   const ch  = await svc.getCharacteristic(ZMK_KEYMAP_CHARACTERISTIC);
    //   await ch.writeValue(new TextEncoder().encode(keymap));
    append("OTA push not yet wired — see Dashboard.jsx TODO (needs ZMK GATT UUIDs).");
  }

  const dot =
    status === "connected" ? "bg-green-400" : status === "connecting" ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Connection card */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Controller
          </h2>
          <span className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-400">
            <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
            {status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <Stat label="Device" value={deviceName || "—"} />
          <Stat label="Battery" value={battery != null ? `${battery}%` : "—"} />
          <Stat label="Profile" value={layout.name} />
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={connect}
            disabled={status === "connected"}
            className="rounded-md bg-amber-400 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-amber-300 disabled:opacity-40"
          >
            {status === "connected" ? "Connected" : "Connect via Bluetooth"}
          </button>
          <button
            onClick={pushKeymap}
            disabled={status !== "connected"}
            className="rounded-md border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800 disabled:opacity-40"
          >
            Push keymap (OTA)
          </button>
        </div>
      </section>

      {/* In-app device picker (Electron has no native chooser) */}
      {candidates.length > 0 && (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h3 className="mb-3 text-sm font-semibold text-zinc-300">Select a device</h3>
          <ul className="space-y-2">
            {candidates.map((d) => (
              <li key={d.deviceId}>
                <button
                  onClick={() => {
                    window.nudge.selectBluetoothDevice(d.deviceId);
                    setCandidates([]);
                  }}
                  className="w-full rounded-md border border-zinc-700 px-3 py-2 text-left text-sm hover:bg-zinc-800"
                >
                  {d.deviceName}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Activity log */}
      <section className="rounded-xl border border-zinc-800 bg-black/40 p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Log</h3>
        <pre className="whitespace-pre-wrap text-xs text-zinc-400">{log || "—"}</pre>
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 truncate text-zinc-200">{value}</div>
    </div>
  );
}
