import React, { useEffect, useState } from "react";

type appDetectionReturn = {
  activeApp: string | null;
  activeWebApp: string | null;
};

const useAppDetection = (): appDetectionReturn => {
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [activeWebApp, setActiveWebApp] = useState<string | null>(null);

  useEffect(() => {
    console.log("Setting up app detection listener");

    if (window.electronAPI) {
      window.electronAPI.onActiveAppDetected(
        (data: { app: string | null; webApp: string | null }) => {
          console.log("Active app detected:", data);
          setActiveApp(data.app);

          if (data.webApp) {
            setActiveWebApp(data.webApp);
          } else {
            setActiveWebApp(null);
          }
        }
      );
    }
  }, []);

  return {
    activeApp,
    activeWebApp,
  };
};

export default useAppDetection;
