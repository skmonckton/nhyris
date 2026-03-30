![Project banner](./images/banner.png)

[![npm](https://img.shields.io/badge/npm-1.0.0-CB3837?logo=npm&style=for-the-badge&logoColor=white)](https://www.npmjs.com/package/nhyris)

# nhyris

The minimal framework for transform R shiny application into standalone

## Changes on this fork

**Modifications for Windows deployment**:
- `init` command from nhyris v1.0.1 initially failed on Windows, requiring modifications to `utils/pak-pkgs.R` and `utils/r.sh`.
- `template/src/index.js` modified to configure electron autoUpdater.

**Better integration with GitHub**:
- Modified `commands/update.js` to "patch" an already initialized project if standalone R and/or Node.js modules are missing. This makes it possible to work with GitHub repos while keeping large code libraries `.gitignore`'d. Thus they can simply be added to the locally cloned repo or at build time (e.g. using a GitHub Actions workflow) with `nhyris update app`.
- Added ignore patterns to `template/forge-config.js` to exclude git and RStudio files from build (which required a modification to `utils/zzz.js`).

**Modifications for multi-platform deployment**:
- Explicit platform-dependent maker configuration added to `template/forge-config.js`.
- Modifications to `commands/install.js`, `utils/r.sh`, and `utils/pak-pkgs.R` to ensure successful R installation on all platforms regardless of build system.
- Added new release notification to `template/src/index.js` for macOS & Linux (auto update not available without signed code).

**Support for co-existing apps**:
- nhyris v1.0.1 always launches the Shiny server on port 1124; this has been updated to find a free port, avoiding collision with already-running nhyris-built apps.
- Previously, closing one app would terminate all running Shiny processes; this has been disabled.

**Miscellaneous non-critical modifications**:
- Arbitrary changes to default assets, loading page, etc.
- Fixed some issues with icon handling.

## Dependencies

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node.js-22.13.1-5FA04E?logo=nodedotjs&style=for-the-badge&logoColor=white)]()
[![Electron](https://img.shields.io/badge/electron-36.4.0-47848F?logo=electron&style=for-the-badge&logoColor=white)](https://www.electronjs.org/)
[![Electron Forge](https://img.shields.io/badge/electron--forge-7.8.0-6aa4b4?logo=electron&style=for-the-badge&logoColor=white)](https://www.electronforge.io/)
[![R](https://img.shields.io/badge/R-4.5.0-276DC3?logo=R&style=for-the-badge&logoColor=white)](https://www.r-project.org/)
[![pak](https://img.shields.io/badge/pak-0.9.0-1E90FF?style=for-the-badge&logoColor=white)](https://pak.r-lib.org/)

## How to install

You can install nhyris globally using npm:

```sh
npm i -g nhyris
```

Or for this fork:

```sh
npm install -g github:skmonckton/nhyris
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

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.


