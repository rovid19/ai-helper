const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  hideWindow: () => ipcRenderer.send("hide-window"),
  onActiveAppDetected: (callback) => {
    ipcRenderer.on("active-app-detected", (event, appName) => {
      callback(appName);
    });
  },
});
