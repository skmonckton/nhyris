import path from "path";
import fs from "fs";
import { installDependencies } from "./install.js";
import { updatePackageJson, updateForgeConfig } from "./zzz.js";

// GitHub owner and repository from a project's package.json "repository" (a URL, { "url": ... } or "github:owner/repo")
export function githubRepo(projectPath) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(projectPath, "package.json"), "utf-8"));
    const url = typeof pkg.repository === "string" ? pkg.repository : (pkg.repository && pkg.repository.url) || "";
    return (url.match(/(?:github\.com[/:]|^github:)([^/]+)\/([^/#?]+?)(?:\.git)?\/?$/) || []).slice(1);
  } catch {
    return [];
  }
}

export async function handleDmgMaker(
  root,
  projectPath,
  name,
  targetArch = "x64"
) {
  const backgroundSource = path.join(
    root,
    "assets",
    "background-DMG.png"
  );
  const backgroundDestination = path.join(projectPath, "background-DMG.png");

  if (
    !fs.existsSync(backgroundDestination) &&
    fs.existsSync(backgroundSource)
  ) {
    fs.copyFileSync(backgroundSource, backgroundDestination);
    console.log("Copied 'background-DMG.png' to project directory.");
  }

  const dependenciesUpdated = updatePackageJson(projectPath, {
    devDependencies: { "@electron-forge/maker-dmg": "^8.0.1" },
  });

  if (dependenciesUpdated) {
    installDependencies(projectPath);
  }

  const appName = name; // passed as argument

  const dmgMakerConfig = {
    name: "@electron-forge/maker-dmg",
    config: {
      name: `${appName} installer`,
      background: "background-DMG.png",
      icon: "assets/icon.icns",
      // overwrite: true,
      // debug: true,
      iconSize: 200,
      format: "UDZO",
      contents: [
        {
          x: 140,
          y: 276,
          type: "file",
          path: `${process.cwd()}/out/${appName}-darwin-${targetArch}/${appName}.app`,
        },
        { x: 518, y: 276, type: "link", path: "/Applications" },
      ],
    },
  };

  await updateForgeConfig(projectPath, dmgMakerConfig);
}

export async function handleSquirrelMaker(projectPath) {
  const dependenciesUpdated = updatePackageJson(projectPath, {
    dependencies: { "electron-squirrel-startup": "^1.0.1" },
    devDependencies: { "@electron-forge/maker-squirrel": "^8.0.1" },
  });

  if (dependenciesUpdated) {
    installDependencies(projectPath);
  }

  // the installer's icon (shown in Windows' installed apps list) is read from the app's GitHub repository, taken
  // from the app's own package.json; without a GitHub repository, no icon URL is set
  const [owner, repo] = githubRepo(projectPath);

  const squirrelMakerConfig = {
    name: "@electron-forge/maker-squirrel",
    config: {
      setupIcon: "assets/icon.ico",
      ...(repo && { iconUrl: `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/assets/icon.ico` }),
    },
  };

  await updateForgeConfig(projectPath, squirrelMakerConfig);
}

export async function handleDebMaker(projectPath) {
  const dependenciesUpdated = updatePackageJson(projectPath, {
    devDependencies: { "@electron-forge/maker-deb": "^8.0.1" },
  });

  if (dependenciesUpdated) {
    installDependencies(projectPath);
  }

  const debMakerConfig = {
    name: "@electron-forge/maker-deb",
  };

  await updateForgeConfig(projectPath, debMakerConfig);
}
