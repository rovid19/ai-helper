import { app, BrowserWindow, screen, globalShortcut, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import {
  registerShowShortcut,
  registerHideShortcut,
} from "./services/shortcuts.js";
import { setupHotReload } from "./services/hotReload.js";
import { DEVELOPMENT, WINDOW_CONFIG } from "./config/constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win; // Store window reference globally

async function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  win = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    resizable: WINDOW_CONFIG.RESIZABLE,
    show: WINDOW_CONFIG.SHOW_INITIALLY,
    webPreferences: {
      nodeIntegration: WINDOW_CONFIG.NODE_INTEGRATION,
      contextIsolation: WINDOW_CONFIG.CONTEXT_ISOLATION,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load Vite dev server during development
  win.loadURL("http://localhost:5173");

  // Open DevTools in development mode
  if (DEVELOPMENT.DEV_TOOLS_ENABLED) {
    win.webContents.openDevTools();
  }

  // Setup hot reload for development
  await setupHotReload(win);

  // Register global shortcuts
  await registerShowShortcut(win);
  await registerHideShortcut(win);

  // Handle IPC messages
  ipcMain.on("hide-window", () => {
    if (win) {
      win.hide();
    }
  });

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
