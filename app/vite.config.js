import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron/simple";

// Vite drives both the React renderer and (via vite-plugin-electron) the
// Electron main + preload processes. `npm run dev` starts the dev server, builds
// main.js / preload.js into dist-electron/, and launches Electron pointed at the
// dev server (it sets VITE_DEV_SERVER_URL, which main.js reads).
export default defineConfig({
  plugins: [
    react(),
    electron({
      main: { entry: "src/main.js" },
      preload: { input: "src/preload.js" },
      // Let the renderer use Node built-ins where needed.
      renderer: {},
    }),
  ],
});
