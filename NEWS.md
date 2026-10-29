# NEWS

Changes in this fork of [jahnen/nhyris](https://github.com/jahnen/nhyris) are described below. Changes made prior to versioned history of this fork are summarized in the README.

## 1.1.0 (unreleased)

First versioned release of the fork, based on nhyris 1.0.1.

**Building**
- R 4.6.1 (current release from CRAN). On R 4.5, certain packages lacked binaries for macOS (e.g. arrow), causing builds to fail. macOS builds now require macOS 14 (Sonoma) or later.
- On macOS, links to R folders were repaired to fix failures during packaging.
- R package scans by `pak-pkgs.R` now also reads R files in the `shiny` folder's subfolders (e.g. `shiny/R`).
- Non-CRAN packages can be automatically discovered from `app.R`.
- `nhyris build` merges its maker settings into makers the project already configures (previously they were replaced, losing e.g. a short installer description).
- `nhyris update --electron` and `nhyris build` check that the project's Electron version is still supported.

**Template**
- Uses Electron 45 and Electron Forge 8, with DMG (macOS) and AppImage (Linux) makers alongside zip and Squirrel (Windows).
- Electron fuses for improved safety: no running as Node, `NODE_OPTIONS` or inspect switches, and no extra `file://` privileges; cookie encryption on.
- The R server only serves the app's window (a per-launch secret), and a content security policy limits connections. R now runs in an isolated environment.
- A loading screen with startup progress and an error page when R fails to start (or stops while the app is open). R output and app errors are written to `logs/` in the app's profile.
- Much faster readiness check, which asks for one of Shiny's own files instead of the app's page.
- One instance per app; launching it again focuses the open window.
- External links open directly only for sites listed in the app's `package.json` or written in its `shiny` files (otherwise the user is asked).
- Downloads get a save dialog and a message when one fails. Apps have file, folder and clipboard bridges.
- App menu removed (including the Reload shortcut, which would end the R session), except on macOS, which keeps only its required menus.
- For builds without Squirrel, update checks look for GitHub releases. No update check on the first launch after installing.
