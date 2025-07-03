import { useEffect } from "react";
import ChatUi from "./components/chatUi";
import ChatGPTService from "./services/openAi/chatGpt";
import { useStepStore } from "./stores/stepStore";
import { useAppDetectionStore } from "./stores/appDetectionStore";
import { useAssistantApiStore } from "./stores/assistantApiStore";
import { AssistantApiService } from "./services/openAi/assistantApi";

const App = () => {
  const {
    userStuckOn,
    steps,
    screenshotBase64,
    setScreenshotBase64,
    setCurrentStepIndex,
    setSteps,
    currentStepIndex,
  } = useStepStore();
  const activeApp = useAppDetectionStore((state) => state.activeApp);
  const activeWebApp = useAppDetectionStore((state) => state.activeWebApp);
  const { assistantApiService } = useAssistantApiStore();

  useEffect(() => {
    const resumeAssistantChat = async () => {
      if (
        userStuckOn &&
        screenshotBase64 &&
        assistantApiService &&
        steps &&
        currentStepIndex !== null
      ) {
        console.log(steps[currentStepIndex]);
        // Compose stuck prompt
        const stuckPrompt = `User got stuck on step ${currentStepIndex}. Analyze the user's screenshot to determine why they got stuck 
        (most likely, the UI element you suggested is not visible to the user). 
        Continue the tutorial from this step, but this time,
         only provide steps that use elements you can actually see in the user's screenshot. For each step, instruct the user to click on something that is clearly visible in the screenshot.`;
        // Send stuck message and screenshot to assistant
        console.log(stuckPrompt);
        await assistantApiService.sendMessage(stuckPrompt, screenshotBase64);
        // Run and get response
        const response = await assistantApiService.runAndGetResponse();
        // Parse steps
        let responseText = "";
        if (Array.isArray(response)) {
          // Find the first text block in the response content array
          const textBlock = response.find(
            (block: any) =>
              block.type === "text" &&
              (typeof (block as any).text === "string" ||
                (block.text && typeof block.text.value === "string"))
          );
          if (textBlock && "text" in textBlock) {
            responseText =
              typeof textBlock.text === "string"
                ? textBlock.text
                : textBlock.text.value;
          }
        } else if (typeof response === "string") {
          responseText = response;
        }
        const steps2 = ChatGPTService.parseStepsWithTargetText(responseText);
        console.log("Steps from resuming convo", steps2);
        // Store steps in your state/store as needed
        setSteps(steps2);
        console.log("Steps from zustand store after resuming convo", steps);
      }
    };
    resumeAssistantChat();
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
