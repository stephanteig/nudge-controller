/**
 * renderer.jsx — React entry point (the Electron renderer process).
 * Mounts <App /> into #root. main.js / preload.js run in separate processes.
 */
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
