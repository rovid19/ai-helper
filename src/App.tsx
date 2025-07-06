import { useEffect } from "react";
import ChatUi from "./components/chatUi";
import ChatGPTService from "./services/openAi/chatGpt";
import { useStepStore, type Step } from "./stores/stepStore";
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
    userQuestion,
    userOptionalQuestion,
    setUserOptionalQuestion,
  } = useStepStore();
  const activeApp = useAppDetectionStore((state) => state.activeApp);
  const activeWebApp = useAppDetectionStore((state) => state.activeWebApp);
  const { assistantApiService } = useAssistantApiStore();

  useEffect(() => {
    // Write steps to /tmp/overlay_steps.json for the native overlay
    const sendStepsToNativeOverlay = async () => {
      if (steps && steps.length > 0) {
        await window.electronAPI.writeStepsToFile(steps);
      }
    };
    sendStepsToNativeOverlay();
  }, [steps]);

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
        const stuckPrompt = `User got stuck on step ${currentStepIndex + 1}: "${
          steps[currentStepIndex].description
        }". Analyze the user's screenshot to determine why they got stuck (most likely, the UI element you suggested is not visible to the user). Then, continue the tutorial from this step all the way to the user's goal: "${userQuestion}". Provide all remaining steps in the same step-by-step format as before, starting from step ${
          currentStepIndex + 1
        }. Do not skip any steps.`;
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
        // Log the full thread for debugging
        if (assistantApiService && assistantApiService.logThreadMessages) {
          await assistantApiService.logThreadMessages();
        }
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
        (
          screenshotBase64: string,
          metadata: any,
          userOptionalQuestion: string | null
        ) => {
          setScreenshotBase64(screenshotBase64);
          setCurrentStepIndex(metadata.stepIndex);
          setUserOptionalQuestion(userOptionalQuestion);
          console.log("userOptionalQuestion", userOptionalQuestion);
          console.log("metadata", metadata);
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
