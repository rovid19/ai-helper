/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    hideWindow: () => void;
    onActiveAppDetected: (
      callback: (data: { app: string | null; webApp: string | null }) => void
    ) => void;
    captureScreenshot: () => Promise<string>;
    startSimpleOverlay: () => Promise<{ success: boolean; error?: string }>;
    launchNativeOverlay: () => Promise<void>;
  };
}
