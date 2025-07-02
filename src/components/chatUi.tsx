import React, { useState } from "react";
import sonomaImage from "../assets/images/sonoma.png";
import sendIcon from "../assets/images/sendIcon.svg";
import { useAppDetectionStore } from "../stores/appDetectionStore";
import { useStepStore } from "../stores/stepStore";
import ChatGPTService from "../services/openAi/chatGpt";
import DeepLens from "./deepLens";
import { DeepLensService } from "../services/deepLens.ts";
import useAppDetection from "../hooks/useAppDetection.tsx";

const chatUi = () => {
  const activeApp = useAppDetectionStore((state) => state.activeApp);
  const activeWebApp = useAppDetectionStore((state) => state.activeWebApp);
  const setUserQuestion = useStepStore((state) => state.setUserQuestion);
  const [userInput, setUserInput] = useState("");
  const [isDeepLensOn, setIsDeepLensOn] = useState(false);

  useAppDetection();

  const getPlaceholderText = () => {
    if (activeWebApp) {
      try {
        const domain = new URL(activeWebApp).hostname;
        return `Ask me anything about ${domain}...`;
      } catch {
        return `Ask me anything about ${activeWebApp}...`;
      }
    }
    return `Ask me anything about ${activeApp}...`;
  };

  const handleSubmitUserInput = async () => {
    try {
      // Store the user question
      setUserQuestion(userInput);

      // Hide the Electron window first
      window.electronAPI.hideWindow();

      // Capture screenshot of the current app if deepLens is on
      const screenShot = isDeepLensOn
        ? await new DeepLensService().analyzeImage()
        : null;

      // Create ChatGPT service instance
      const chatGPT = new ChatGPTService();

      // Make the API request with context
      const steps = await chatGPT.analyze(
        screenShot,
        userInput,
        activeApp || undefined,
        activeWebApp || undefined
      );

      // Start the native overlay
      await window.electronAPI.launchNativeOverlay();

      // Write steps to /tmp/overlay_steps.json for the native overlay
      await window.electronAPI.writeStepsToFile(steps);

      // Clear the input after successful request
      setUserInput("");
    } catch (error) {
      console.error("Error calling ChatGPT API:", error);
    }
  };

  return (
    <div className="bg-transparent h-screen flex items-center justify-center p-4 relative">
      <img src={sonomaImage} alt="sonoma" className="w-full h-full absolute " />

      <div className="h-[20%] w-[50%] rounded-[50px] bg-black/20  backdrop-blur-[35px] border  border-white/20  p-8 flex flex-col gap-2">
        {/* Header */}
        <div className="w-full px-2 text-white text-[28px]">
          {" "}
          <h2 className=" ">What can I help you with?</h2>
        </div>

        {/* Input */}
        <div className="h-auto w-full px-2 text-white text-[14px] rounded-[50px] flex items-center justify-center gap-2">
          <input
            type="text"
            placeholder={getPlaceholderText()}
            className="w-[90%] py-2 px-4 rounded-[50px] bg-white/10 outline-none focus:outline-none focus:ring-2 focus:ring-white/20 hover:shadow-[0_0_15px_rgba(217,70,239,0.5)] transition-shadow duration-300"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />

          <button
            onClick={handleSubmitUserInput}
            className="w-[10%] h-full bg-black rounded-[50px] bg-fuchsia-500 flex justify-center items-center cursor-pointer hover:shadow-[0_0_15px_rgba(217,70,239,0.5)] transition-shadow duration-300"
          >
            <img src={sendIcon} alt="send" className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* footer */}
        <div className=" w-full px-2 text-[#8B8B8B] text-[10px] flex justify-between">
          <h3 className="">Press Shift + S to open settings </h3>
          <DeepLens isOn={isDeepLensOn} setIsOn={setIsDeepLensOn} />
        </div>
      </div>
    </div>
  );
};

export default chatUi;
