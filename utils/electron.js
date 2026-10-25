import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Electron supports only its latest three major versions with security fixes (https://www.electronjs.org/docs/latest/tutorial/electron-timelines)
// An app built on an older major still runs, but no longer receives Chromium security fixes
const SUPPORTED_MAJORS = 3;

// Electron version installed in a project (from node_modules), or null
export function installedElectronVersion(projectPath) {
  try {
    const pkg = path.join(projectPath, "node_modules", "electron", "package.json");
    return JSON.parse(fs.readFileSync(pkg, "utf-8")).version;
  } catch {
    return null;
  }
}

// Latest Electron release from the npm registry, or null when offline
export function latestElectronVersion() {
  try {
    return execSync("npm view electron dist-tags.latest", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim() || null;
  } catch {
    return null;
  }
}

const major = (v) => parseInt(String(v).split(".")[0], 10);

// Reports whether the project's Electron is still supported; returns { installed, latest, supported }
export function checkElectronSupport(projectPath, { quiet = false } = {}) {
  const installed = installedElectronVersion(projectPath);
  const latest = latestElectronVersion();
  if (!installed || !latest) {
    if (!quiet) console.log("Could not check the Electron version (not installed, or the npm registry isn't reachable).");
    return { installed, latest, supported: null };
  }
  const oldest = major(latest) - SUPPORTED_MAJORS + 1;
  const supported = major(installed) >= oldest;
  if (!quiet) {
    if (supported) {
      console.log(`Electron ${installed} is supported (latest: ${latest}).`);
    } else {
      console.warn(
        `WARNING: Electron ${installed} is no longer supported and gets no security fixes ` +
          `(supported: ${oldest}.x to ${major(latest)}.x).\n` +
          `Upgrade with: nhyris update <name> --electron`
      );
    }
  }
  return { installed, latest, supported };
}

// Upgrades the project to the latest Electron major (and Electron Forge, which tracks it)
export function upgradeElectron(projectPath) {
  const latest = latestElectronVersion();
  if (!latest) throw new Error("the npm registry isn't reachable");
  const pkg = JSON.parse(fs.readFileSync(path.join(projectPath, "package.json"), "utf-8"));
  const forge = Object.keys(pkg.devDependencies || {}).filter((d) => d.startsWith("@electron-forge/"));
  const targets = [`electron@^${major(latest)}.0.0`, ...forge.map((d) => `${d}@latest`)];
  console.log(`Upgrading: ${targets.join(" ")}`);
  execSync(`npm install --save-dev ${targets.join(" ")}`, { stdio: "inherit", cwd: projectPath });
  console.log("Done. Rebuild and test the app: Electron majors can change APIs (see Electron's breaking changes).");
}
