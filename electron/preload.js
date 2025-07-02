const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  hideWindow: () => ipcRenderer.send("hide-window"),
  onActiveAppDetected: (callback) => {
    // Remove any existing listeners first
    ipcRenderer.removeAllListeners("active-app-detected");

    // Add the new listener
    ipcRenderer.on("active-app-detected", (event, data) => {
      console.log("Preload received data:", data);
      callback(data);
    });
  },

  onScreenshotUpdate: (callback) => {
    console.log("preload.js onScreenshotUpdate");
    // Remove any existing listeners first
    ipcRenderer.removeAllListeners("screenshot-update");

    // Add the new listener
    ipcRenderer.on("screenshot-update", (event, screenshotBase64, metadata) => {
      callback(screenshotBase64, metadata);
    });
  },

  captureScreenshot: async () => {
    try {
      const result = await ipcRenderer.invoke("capture-screenshot");
      console.log("Preload received screenshot result");
      return result;
    } catch (error) {
      console.error("Error in preload captureScreenshot:", error);
      throw error;
    }
  },

  launchNativeOverlay: async () => {
    await ipcRenderer.invoke("launch-native-overlay");
  },

  writeStepsToFile: async (steps) => {
    try {
      const result = await ipcRenderer.invoke("write-steps-to-file", steps);
      console.log("Preload received write steps result");
      return result;
    } catch (error) {
      console.error("Error in preload writeStepsToFile:", error);
      throw error;
    }
  },

  onClearStepStore: (callback) => {
    // Remove any existing listeners first
    ipcRenderer.removeAllListeners("clear-step-store");

    // Add the new listener
    ipcRenderer.on("clear-step-store", () => {
      console.log("Preload received clear step store signal");
      callback();
    });
  },
});
