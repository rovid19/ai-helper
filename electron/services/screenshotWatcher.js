import fs from "fs";

class ScreenshotWatcherService {
  constructor() {
    this.screenshotPath = "/tmp/screenshot.jpg";
    this.metadataPath = "/tmp/screenshot_metadata.json";
    this.signalPath = "/tmp/native_overlay_signal.json";
    this.screenshotDebounceTimer = null;
    this.screenshotWatcher = null;
    this.metadataWatcher = null;
    this.signalWatcher = null;
    this.onScreenshotUpdate = null;
    this.onOverlayClosed = null;
  }

  startWatching(onUpdate, onOverlayClosed) {
    // these are two callback functions that are passed in from the main process
    // onUpdate is called when a new screenshot is detected
    // onOverlayClosed is called when the native overlay is closed
    this.onScreenshotUpdate = onUpdate;
    this.onOverlayClosed = onOverlayClosed;

    // Remove previous watchers if any
    if (this.screenshotWatcher) {
      fs.unwatchFile(this.screenshotPath, this.screenshotWatcher);
    }
    if (this.metadataWatcher) {
      fs.unwatchFile(this.metadataPath, this.metadataWatcher);
    }
    if (this.signalWatcher) {
      fs.unwatchFile(this.signalPath, this.signalWatcher);
    }

    // Shared handler for both files
    const handleUpdate = () => {
      if (this.screenshotDebounceTimer) {
        clearTimeout(this.screenshotDebounceTimer);
      }
      this.screenshotDebounceTimer = setTimeout(() => {
        try {
          const screenshotBuffer = fs.readFileSync(this.screenshotPath);
          const screenshotBase64 = screenshotBuffer.toString("base64");
          const metadata = JSON.parse(
            fs.readFileSync(this.metadataPath, "utf-8")
          );
          if (this.onScreenshotUpdate) {
            this.onScreenshotUpdate({ screenshotBase64, metadata });
          }
        } catch (error) {
          console.error("Error reading screenshot or metadata file:", error);
        }
      }, 100);
    };

    this.screenshotWatcher = (curr, prev) => {
      if (curr.mtime > prev.mtime) {
        console.log("New screenshot detected from Swift overlay");
        handleUpdate();
      }
    };

    this.metadataWatcher = (curr, prev) => {
      if (curr.mtime > prev.mtime) {
        console.log("New metadata detected from Swift overlay");
        handleUpdate();
      }
    };

    this.signalWatcher = (curr, prev) => {
      if (curr.mtime > prev.mtime) {
        try {
          const signal = JSON.parse(fs.readFileSync(this.signalPath, "utf-8"));
          if (signal.overlayClosed && this.onOverlayClosed) {
            console.log("Native overlay closed signal received");
            this.onOverlayClosed();
          }
        } catch (error) {
          console.error("Error reading native overlay signal:", error);
        }
      }
    };

    fs.watchFile(this.screenshotPath, this.screenshotWatcher);
    fs.watchFile(this.metadataPath, this.metadataWatcher);
    fs.watchFile(this.signalPath, this.signalWatcher);
  }

  stopWatching() {
    if (this.screenshotWatcher) {
      fs.unwatchFile(this.screenshotPath, this.screenshotWatcher);
      this.screenshotWatcher = null;
    }
    if (this.metadataWatcher) {
      fs.unwatchFile(this.metadataPath, this.metadataWatcher);
      this.metadataWatcher = null;
    }
    if (this.signalWatcher) {
      fs.unwatchFile(this.signalPath, this.signalWatcher);
      this.signalWatcher = null;
    }
    if (this.screenshotDebounceTimer) {
      clearTimeout(this.screenshotDebounceTimer);
      this.screenshotDebounceTimer = null;
    }
    this.onScreenshotUpdate = null;
    this.onOverlayClosed = null;
  }
}

export default ScreenshotWatcherService;
