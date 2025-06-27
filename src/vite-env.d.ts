/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    hideWindow: () => void;
    onActiveAppDetected: (callback: (appName: string) => void) => void;
  };
}
