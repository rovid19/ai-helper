import path from "path";
import { fileURLToPath } from "url";
import { DEVELOPMENT } from "../config/constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Setup hot reload for development
 * @param {BrowserWindow} win - The Electron window instance
 */
export const setupHotReload = async (win) => {
  if (!DEVELOPMENT.HOT_RELOAD_ENABLED) {
    return;
  }

  try {
    // Watch for changes in the src directory
    const chokidar = await import("chokidar");
    const watcher = chokidar.default.watch(
      path.join(__dirname, "../../src/**/*"),
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

    console.log("Hot reload enabled");
  } catch (error) {
    console.error("Failed to setup hot reload:", error);
  }
};
