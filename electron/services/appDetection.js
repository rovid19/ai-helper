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
