import { globalShortcut } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const hotReload = async (win) => {
  // Hot reload for development
  if (process.env.NODE_ENV === "development") {
    // Watch for changes in the src directory
    const chokidar = await import("chokidar");
    const watcher = chokidar.default.watch(
      path.join(__dirname, "../src/**/*"),
      {
        ignored: /node_modules/,
        persistent: true,
      }
    );

    watcher.on("change", (filePath) => {
      console.log(`File changed: ${filePath}`);
      // Reload the window when files change
      win.reload();
    });
  }
};

export const shortcutToShowWindow = async (win) => {
  console.log("registerGlobalShortcuts");
  // Register Cmd+Shift+S to show window
  const ret = globalShortcut.register("CommandOrControl+Shift+S", () => {
    console.log("Global shortcut triggered");
    if (win) {
      win.show();
      win.focus();
    }
  });

  if (!ret) {
    console.log("Global shortcut registration failed");
  }
};

export const shortcutToHideWindow = async (win) => {
  console.log("Setting up Escape listener");

  // Register Escape as a global shortcut
  const escapeRet = globalShortcut.register("Escape", () => {
    console.log("Escape pressed - global shortcut");
    if (win && win.isVisible()) {
      win.hide();
    }
  });

  if (!escapeRet) {
    console.log("Escape shortcut registration failed");
  } else {
    console.log("Escape shortcut registered successfully");
  }
};
