import { app, BrowserWindow, screen, globalShortcut, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import fs from "fs";
import {
  registerShowShortcut,
  registerHideShortcut,
} from "./services/shortcuts.js";
import { setupHotReload } from "./services/hotReload.js";
import { captureScreenshot } from "./services/screenshot.js";
import { DEVELOPMENT, WINDOW_CONFIG } from "./config/constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win; // Store window reference globally

// Register IPC handlers at module level
ipcMain.handle("capture-screenshot", async () => {
  console.log("capture-screenshot in main");
  try {
    const screenshot = await captureScreenshot(win);
    return screenshot;
  } catch (error) {
    console.error("Error capturing screenshot:", error);
    throw error;
  }
});

// Write steps to file handler
ipcMain.handle("write-steps-to-file", async (event, steps) => {
  console.log("write-steps-to-file in main");
  try {
    fs.writeFileSync("/tmp/overlay_steps.json", JSON.stringify(steps), "utf-8");
    console.log("Steps written to /tmp/overlay_steps.json successfully");
    return { success: true };
  } catch (error) {
    console.error("Error writing steps to file:", error);
    throw error;
  }
});

// Simple overlay handler
ipcMain.handle("start-simple-overlay", async () => {
  try {
    await simpleOverlayService.startOverlay();
    return { success: true };
  } catch (error) {
    console.error("Error starting simple overlay:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("launch-native-overlay", async () => {
  const overlayAppPath = path.join(
    __dirname,
    "../native/Ai Overlay Instructions.app"
  );
  spawn("open", [overlayAppPath]);
});

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
