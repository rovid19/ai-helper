import { useEffect } from "react";
import ChatUi from "./components/chatUi";
import ChatGPTService from "./services/openAi/chatGpt";
import { useStepStore } from "./stores/stepStore";
import { useAppDetectionStore } from "./stores/appDetectionStore";

const App = () => {
  const {
    userStuckOn,
    screenshotBase64,
    setScreenshotBase64,
    setCurrentStepIndex,
    setSteps,
  } = useStepStore();
  const activeApp = useAppDetectionStore((state) => state.activeApp);
  const activeWebApp = useAppDetectionStore((state) => state.activeWebApp);

  useEffect(() => {
    if (userStuckOn && screenshotBase64) {
      const chatGPTService = new ChatGPTService();
      chatGPTService.analyze(
        screenshotBase64,
        userStuckOn.description,
        activeApp ?? undefined,
        activeWebApp ?? undefined
      );
    }
  }, [userStuckOn, screenshotBase64]);

  useEffect(() => {
    if (window.electronAPI) {
      (window.electronAPI as any).onClearStepStore(() => {
        setCurrentStepIndex(null);
        setSteps(null);
      });
    }
  }, []);

  useEffect(() => {
    if (window.electronAPI) {
      (window.electronAPI as any).onScreenshotUpdate(
        (screenshotBase64: string, metadata: any) => {
          setScreenshotBase64(screenshotBase64);
          setCurrentStepIndex(metadata.stepIndex);
        }
      );
    }
  }, []);

  return (
    <div>
      <ChatUi />
    </div>
  );
};

export default App;
