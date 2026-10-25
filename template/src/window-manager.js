const { BrowserWindow } = require("electron");
const { shell } = require('electron');
const ErrorHandler = require("./error-handler");
const path = require("path");

// Open links in the system's default application; only web and email links are passed on
// (other URLs - e.g. file:, custom protocol handlers - could launch programs if the page were ever made to open them)
function openExternalSafe(url) {
  try {
    const parsed = new URL(url);
    if (["https:", "http:", "mailto:"].includes(parsed.protocol)) {
      shell.openExternal(parsed.href);
    } else {
      ErrorHandler.logError("openExternalSafe", new Error(`blocked link with protocol ${parsed.protocol}`));
    }
  } catch (e) {
    ErrorHandler.logError("openExternalSafe", e);
  }
}

// Create the main window for the Shiny app
function createWindow(appState, shinyUrl, bounds) {
  return ErrorHandler.handleSyncError("createWindow", () => {
    const mainWindow = new BrowserWindow({
      width:  bounds ? bounds.width  : appState.config.mainWindow.width,
      height: bounds ? bounds.height : appState.config.mainWindow.height,
      x:      bounds ? bounds.x      : undefined,
      y:      bounds ? bounds.y      : undefined,
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        nodeIntegration: false,
        contextIsolation: true,
        spellcheck: false
      },
    });

    mainWindow.loadURL(shinyUrl);

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      openExternalSafe(url);
      return { action: 'deny' };
    });

    mainWindow.webContents.on('will-navigate', (event, url) => {
      if (url !== mainWindow.webContents.getURL()) {
        event.preventDefault();
        openExternalSafe(url);
        }
    });

    mainWindow.on("closed", () => {
      appState.setMainWindow(null);
    });

    mainWindow.on("unresponsive", () => {
      ErrorHandler.logError(
        "MainWindow",
        new Error("Window became unresponsive")
      );
    });

    appState.setMainWindow(mainWindow);
    return mainWindow;
  });
}

// Options for splash screens
function getSplashScreenOptions(appState) {
  return {
    width: appState.config.mainWindow.width,
    height: appState.config.mainWindow.height,
    backgroundColor: appState.config.backgroundColor,
  };
}

// Show loading splash screen
function createLoadingSplashScreen(appState) {
  const win = new BrowserWindow({
    width: appState.config.mainWindow.width,
    height: appState.config.mainWindow.height,
    backgroundColor: appState.config.backgroundColor,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, "loading.html"));
  win.once("ready-to-show", () => win.show());
  appState.setLoadingSplashScreen(win); // Use the setter method here
  return win;
}

// Show the error page (failed.html) in a new window, where the main window was
function createErrorScreen(appState, bounds) {
  const win = new BrowserWindow({
    ...getSplashScreenOptions(appState),
    ...(bounds || {}),
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  showErrorPage(appState, win, "later");
  win.once("ready-to-show", () => win.show());
  appState.setErrorSplashScreen(win);
  return win;
}

// Load the error page into a window ("startup": R didn't start; "later": R stopped while the app was open)
function showErrorPage(appState, win, when) {
  win.loadFile(path.join(__dirname, "failed.html"), { query: { when, logs: appState.paths.logPath } });
}

module.exports = {
  openExternalSafe,
  createWindow,
  createLoadingSplashScreen,
  createErrorScreen,
  showErrorPage,
};
