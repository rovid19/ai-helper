import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Get the currently active application using AppleScript
 * @returns {Promise<string|null>} The name of the active application
 */
export const getActiveApplication = async () => {
  try {
    const appleScript = `
      tell application "System Events"
        set frontApp to name of first application process whose frontmost is true
        return frontApp
      end tell
    `;

    const { stdout } = await execAsync(`osascript -e '${appleScript}'`);
    const activeApp = stdout.trim();
    console.log("Active application:", activeApp);
    return activeApp;
  } catch (error) {
    console.error("Error getting active application:", error);
    return null;
  }
};

/**
 * Get the current browser URL if the active app is a browser
 * @param {string} appName - The active application name
 * @returns {Promise<string|null>} The current URL or null if not a browser
 */
export const getBrowserURL = async (appName) => {
  const browsers = {
    Safari:
      'tell application "Safari" to get URL of current tab of front window',
    "Google Chrome":
      'tell application "Google Chrome" to get URL of active tab of front window',
    Firefox: 'tell application "Firefox" to get URL of current tab',
  };

  const script = browsers[appName];
  if (!script) return null;

  try {
    const { stdout } = await execAsync(`osascript -e '${script}'`);
    const url = stdout.trim();
    console.log("Browser URL:", url);
    return url;
  } catch (error) {
    console.error("Error getting browser URL:", error);
    return null;
  }
};
