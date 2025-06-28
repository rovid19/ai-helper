import { globalShortcut } from "electron";
import { getActiveApplication, getBrowserURL } from "./appDetection.js";
import { SHORTCUTS } from "../config/constants.js";

/**
 * Register the shortcut to show the window
 * @param {BrowserWindow} win - The Electron window instance
 */
export const registerShowShortcut = async (win) => {
  console.log("Registering show window shortcut");

  const ret = globalShortcut.register(SHORTCUTS.SHOW, async () => {
    console.log("Global shortcut triggered");

    // Get the active application BEFORE showing our window
    const activeApp = await getActiveApplication();

    // If it's a browser, get the current URL
    const browserURL = activeApp ? await getBrowserURL(activeApp) : null;

    if (win) {
      win.show();
      win.focus();

      // Send both active app and browser URL to the renderer
      win.webContents.send("active-app-detected", {
        app: activeApp,
        webApp: browserURL,
      });
    }
  });

  if (!ret) {
    console.log("Show shortcut registration failed");
  } else {
    console.log("Show shortcut registered successfully");
  }
};

/**
 * Register the shortcut to hide the window
 * @param {BrowserWindow} win - The Electron window instance
 */
export const registerHideShortcut = async (win) => {
  console.log("Setting up hide window shortcut");

  const escapeRet = globalShortcut.register(SHORTCUTS.HIDE, () => {
    console.log("Escape pressed - global shortcut");
    if (win && win.isVisible()) {
      win.hide();
    }
  });

  if (!escapeRet) {
    console.log("Hide shortcut registration failed");
  } else {
    console.log("Hide shortcut registered successfully");
  }
};
