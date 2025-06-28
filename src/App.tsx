import React, { useEffect, useState } from "react";
import ChatUi from "./components/chatUi";

const App = () => {
  useEffect(() => {
    if (window.electronAPI) {
      console.log("pklrenuti");
    }
  }, []);
  return (
    <div>
      <ChatUi />
    </div>
  );
};

export default App;
