# Contributing to Nudge Controller

Thanks for helping build an open editing controller! Contributions are welcome
across hardware, firmware, the app, and docs.

## Run the prototype locally

```bash
cd prototype
npm install
npm start
```

Find your Mac's IP with `ipconfig getifaddr en0`, then open
`https://stephanteig.github.io/nudge-controller/controller` on a tablet and enter
that IP (or open `prototype/public/index.html` directly). The server injects
keystrokes via robotjs and needs macOS Accessibility permission.

## Edit and build the docs site

The docs are a Nextra 4 (Next.js 15) site in `docs-site/`.

```bash
cd docs-site
npm install
npm run dev      # local preview at http://localhost:3000
npm run build    # static export to docs-site/out/
```

- Content lives in `docs-site/content/**` as `.mdx`.
- Sidebar grouping/order is controlled by the `_meta.js` files.
- On push to `main`, GitHub Actions builds the site and the prototype and
  deploys both to GitHub Pages.

## Build the Electron app

```bash
cd app
npm install
npm run dev      # Vite + Electron
npm run build    # renderer → dist/, main/preload → dist-electron/
```

## Build the firmware

Firmware is [ZMK](https://zmk.dev). Pushing changes under `firmware/**` triggers
the **Build ZMK Firmware** workflow, which uploads the `.uf2` as an artifact. See
the [firmware docs](https://stephanteig.github.io/nudge-controller/firmware/flashing).

## Commit message format

Use `type(scope): description`:

- `feat(firmware): add BT layer`
- `fix(prototype): configurable WS IP`
- `docs: update BOM`

Common types: `feat`, `fix`, `docs`, `chore`, `refactor`. Keep the subject in the
imperative mood and under ~72 characters.

## After a meaningful change

Per the update rules in [`CLAUDE.md`](CLAUDE.md):

1. Update `CLAUDE.md` to reflect the new state.
2. Update `README.md` if setup/architecture/features changed.
3. Update the relevant page(s) in `docs-site/content/`.

## Reporting issues

When opening an issue, please separate:

- **Hardware issues** (pin mapping, soldering, PCB, case): include your board
  revision, a clear photo, and any multimeter readings.
- **Software issues** (firmware, app, prototype, docs): include your OS, Node
  version, exact reproduction steps, and relevant console/build output.
