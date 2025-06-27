import { app, BrowserWindow, screen, globalShortcut } from "electron";
import {
  hotReload,
  shortcutToHideWindow,
  shortcutToShowWindow,
} from "./utils.js";

let win; // Store window reference globally

async function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  win = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    resizable: true,
    show: false, // Don't show window initially
    webPreferences: {
      nodeIntegration: true, // enables using Node APIs in renderer
    },
  });
  console.log("listenToHideWindow1");
  // Load Vite dev server during development
  win.loadURL("http://localhost:5173");

  // Open DevTools in development mode
  if (process.env.NODE_ENV === "development") {
    win.webContents.openDevTools();
  }

  // Hot reload for development
  hotReload(win);

  // Register global shortcut
  shortcutToShowWindow(win);
  shortcutToHideWindow(win);

  // Hide window instead of closing it
  win.on("close", (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      win.hide();
    }
  });
}

app.whenReady().then(createWindow);

// Handle macOS behavior when no windows are open
app.on("window-all-closed", () => {
  // Don't quit the app when window is closed, keep it running in background
  // Only quit on non-macOS platforms if explicitly requested
  if (process.platform !== "darwin") {
    // Keep app running in background
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Clean up global shortcuts when app quits
app.on("will-quit", () => {
  app.isQuiting = true;
  globalShortcut.unregisterAll();
});
