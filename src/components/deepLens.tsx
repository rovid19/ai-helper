import React from "react";

interface DeepLensProps {
  isOn: boolean;
  setIsOn: (value: boolean) => void;
}

const DeepLens: React.FC<DeepLensProps> = ({ isOn, setIsOn }) => {
  const toggleSlider = () => {
    setIsOn(!isOn);
  };

  return (
    <div className="flex flex-col gap-1 py-1 px-1">
      <div className="w-full bg-white/10 rounded-[20px] relative h-[10px]">
        <button
          className={`w-[30%] rounded-[50px] h-full absolute cursor-pointer hover:shadow-[0_0_15px_rgba(217,70,239,0.5)] transition-all duration-300 ease-in-out ${
            isOn
              ? "bg-fuchsia-500 translate-x-[233%]"
              : "bg-white/30 translate-x-0"
          }`}
          onClick={toggleSlider}
        ></button>
      </div>
      <h3 className="text-[#8B8B8B] text-[8px]">
        DeepLens: <span>{isOn ? "On" : "Off"}</span>
      </h3>
    </div>
  );
};

export default DeepLens;
