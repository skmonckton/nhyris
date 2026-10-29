![Project banner](./images/banner.png)

# nhyris

The minimal framework for transform R shiny application into standalone

> **This is a fork** of [jahnen/nhyris](https://github.com/jahnen/nhyris) by Jinhwan Kim, based on nhyris v1.0.1 and maintained separately by Spencer K. Monckton. It differs significantly from the original: see [Changes on this fork](#changes-on-this-fork) below and [NEWS.md](./NEWS.md). Please report problems with this fork in [its issues](https://github.com/skmonckton/nhyris/issues), not to the upstream project. The [documentation site](https://jahnen.github.io/nhyris/) describes the original nhyris.

## Changes on this fork

**Modifications for Windows deployment**:
- `init` command from nhyris v1.0.1 initially failed on Windows, requiring modifications to `utils/pak-pkgs.R` and `utils/r.sh`.
- `template/src/index.js` modified to configure electron autoUpdater.

**Better integration with GitHub**:
- Modified `commands/update.js` to "patch" an already initialized project if standalone R and/or Node.js modules are missing. This makes it possible to work with GitHub repos while keeping large code libraries `.gitignore`'d. Thus they can simply be added to the locally cloned repo or at build time (e.g. using a GitHub Actions workflow) with `nhyris update app`.
- Added ignore patterns to `template/forge.config.js` to exclude git and RStudio files from build (which required a modification to `utils/zzz.js`).

**Modifications for multi-platform deployment**:
- Explicit platform-dependent maker configuration added to `template/forge.config.js`, including DMG (macOS) and AppImage (Linux) makers.
- `nhyris build` merges its maker settings into makers the project already configures instead of replacing them.
- Modifications to `utils/install.js`, `utils/r.sh`, and `utils/pak-pkgs.R` to ensure successful R installation on all platforms regardless of build system.
- Added new release notification to `template/src/index.js` for macOS & Linux (auto update not available without signed code).
- Advanced to R 4.6.1 (current release) to ensure package binaries are available on every platform. macOS builds therefore need macOS 14 (Sonoma) or later.
- The package scan (`utils/pak-pkgs.R`) also reads R files in the `shiny` folder's subfolders, and finds Bioconductor packages without declaring them.

**Support for co-existing apps**:
- nhyris v1.0.1 always launches the Shiny server on port 1124; this has been updated to find a free port, avoiding collision with already-running nhyris-built apps.
- Previously, closing one app would terminate all running Shiny processes; this has been disabled.

**Links that open outside the app**:
- Links open in the browser directly when they go to a site listed in the app's `package.json` (each with its subdomains), e.g. `"nhyris": { "trustedLinkHosts": ["example.org"] }`, or to a web address written in the app's own files (its `shiny` folder), or below one (`https://github.com/me/app` also covers `https://github.com/me/app/releases`, but not the rest of github.com, where anyone can host pages). Other links ask first.

**Security hardening of the template**:
- The R server only serves the app's own window (a per-launch secret, checked in `start-shiny.R`), and a content security policy limits connections.
- Electron fuses turn off features the app doesn't use (running as Node, `NODE_OPTIONS`, inspect switches, extra `file://` privileges), and cookie encryption is on.
- R runs in an isolated environment and is stopped when the app quits.

**Startup and reliability**:
- `nhyris update --electron` and `nhyris build` check that the project's Electron version is still supported.
- A loading screen shows startup progress and an error page is shown if R fails to start or stops while the app is open; R's output and app errors are written to `logs/` in the app's profile.
- One instance per app, with repeat launches focusing the open window.
- Downloads have a save dialog and a message when a download fails.

**Miscellaneous non-critical modifications**:
- Arbitrary changes to default assets, loading page, etc.
- Fixed some issues with icon handling.

## Dependencies

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node.js-22.13.1-5FA04E?logo=nodedotjs&style=for-the-badge&logoColor=white)]()
[![Electron](https://img.shields.io/badge/electron-45-47848F?logo=electron&style=for-the-badge&logoColor=white)](https://www.electronjs.org/)
[![Electron Forge](https://img.shields.io/badge/electron--forge-8.0.1-6aa4b4?logo=electron&style=for-the-badge&logoColor=white)](https://www.electronforge.io/)
[![R](https://img.shields.io/badge/R-4.6.1-276DC3?logo=R&style=for-the-badge&logoColor=white)](https://www.r-project.org/)
[![pak](https://img.shields.io/badge/pak-0.9.0-1E90FF?style=for-the-badge&logoColor=white)](https://pak.r-lib.org/)

## How to install

This fork is installed from GitHub:

```sh
npm install -g github:skmonckton/nhyris
```

Or install a release tag for consistent behaviour (e.g. if building in a GitHub Actions workflow):

```sh
npm install -g github:skmonckton/nhyris#v1.1.0
```

This will add the `nhyris` command to your PATH.

## How to use

You can use the following commands after installing nhyris:

- Initialize a new project (replace `myapp` with your project name):

```sh
nhyris init myapp
```

- Run your Shiny app in development mode:

```sh
nhyris run myapp
```

- Update dependencies and project files (and re-initialize R and Node.js if applicable):

```sh
nhyris update myapp
```

- Build a standalone Electron application:

```sh
nhyris build myapp
```

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details. The original nhyris is copyright Jinhwan Kim; the changes in this fork are copyright Spencer K. Monckton.


