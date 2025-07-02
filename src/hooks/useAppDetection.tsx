import { useEffect } from "react";
import { useAppDetectionStore } from "../stores/appDetectionStore";

const useAppDetection = () => {
  const setActiveApp = useAppDetectionStore((state) => state.setActiveApp);
  const setActiveWebApp = useAppDetectionStore(
    (state) => state.setActiveWebApp
  );

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onActiveAppDetected(
        (data: { app: string | null; webApp: string | null }) => {
          setActiveApp(data.app);
          setActiveWebApp(data.webApp ?? null);
        }
      );
    }
  }, [setActiveApp, setActiveWebApp]);
};

export default useAppDetection;
