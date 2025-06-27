import React, { useEffect, useState } from "react";
import sonomaImage from "./assets/images/sonoma.png";
import sendIcon from "./assets/images/sendIcon.svg";

const App = () => {
  const [activeApp, setActiveApp] = useState<string | null>(null);

  useEffect(() => {
    // Listen for active app detection from Electron
    if (window.electronAPI) {
      window.electronAPI.onActiveAppDetected((appName: string) => {
        console.log("Active app detected:", appName);
        setActiveApp(appName);
      });
    }
  }, []);

  return (
    <div className="bg-transparent h-screen flex items-center justify-center p-4 relative">
      <img src={sonomaImage} alt="sonoma" className="w-full h-full absolute " />

      <div className="h-[20%] w-[50%] rounded-[50px] bg-black/30  backdrop-blur-[35px] border  border-white/20  p-8 flex flex-col gap-2">
        {/* Header */}
        <div className="w-full px-2 text-white text-[28px]">
          {" "}
          <h2 className=" ">What can I help you with?</h2>
        </div>

        {/* Input */}
        <div className="h-auto w-full px-2 text-white text-[14px] rounded-[50px] flex items-center justify-center gap-2">
          <input
            type="text"
            placeholder={`Ask me anything about ${activeApp}...`}
            className="w-[90%] py-2 px-4 rounded-[50px] bg-white/10 outline-none focus:outline-none focus:ring-2 focus:ring-white/20 hover:shadow-[0_0_15px_rgba(217,70,239,0.5)] transition-shadow duration-300"
          />

          <button className="w-[10%] h-full bg-black rounded-[50px] bg-fuchsia-500 flex justify-center items-center cursor-pointer hover:shadow-[0_0_15px_rgba(217,70,239,0.5)] transition-shadow duration-300">
            <img src={sendIcon} alt="send" className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* footer */}
        <div className=" w-full px-2 text-[#8B8B8B] text-[10px]">
          <h3 className="">Press Shift + S to open settings </h3>
        </div>
      </div>
    </div>
  );
};

export default App;
