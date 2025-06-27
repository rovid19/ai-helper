/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    hideWindow: () => void;
  };
}
