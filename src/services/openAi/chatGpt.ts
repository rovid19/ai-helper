import Prompts from "./prompts";

class ChatGPTService {
  private apiKey: string = import.meta.env.VITE_OPENAI_API_KEY;
  private contextPrompt: string = "";
  //private useMock: boolean = true; // Set to false to use real API

  async analyzeScreenshot(
    screenshotBase64: string,
    userQuestion: string,
    activeApp?: string,
    activeWebApp?: string
  ): Promise<string[]> {
    // Use mock response for testing
    /* if (this.useMock) {
      return this.getMockResponse(userQuestion, activeApp, activeWebApp);
    }*/

    if (!this.apiKey) {
      throw new Error(
        "OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env file"
      );
    }

    if (activeWebApp) {
      this.contextPrompt = new Prompts("activeWebApp").getContextPrompt(
        userQuestion,
        activeWebApp
      );
    } else if (activeApp) {
      console.log("activeApp");
      this.contextPrompt = new Prompts("activeApp").getContextPrompt(
        userQuestion,
        activeApp
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: this.contextPrompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${screenshotBase64}`,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error: ${response.status} - ${
          errorData.error?.message || response.statusText
        }`
      );
    }

    const data = await response.json();
    console.log("OpenAI API response:", data);

    const steps = this.parseStepsFromResponse(data.choices[0].message.content);
    console.log("Steps:", steps);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Unexpected API response structure");
    }

    return steps;
  }

  private parseStepsFromResponse(response: string): string[] {
    const lines = response.split("\n");
    const steps: string[] = [];
    const stepPattern = /^Step \d+:\s*(.*)/;

    for (const line of lines) {
      const match = line.trim().match(stepPattern);
      if (match) {
        // Remove all backslashes before quotes
        console.log("match", match);
        const stepContent = match[1].trim().replace(/\\/g, "");
        steps.push(stepContent);
      }
    }

    return steps;
  }

  /*private async getMockResponse(
    userQuestion: string,
    activeApp?: string,
    activeWebApp?: string
  ): Promise<string> {
    console.log("Using mock response for testing");
    console.log("Question:", userQuestion);
    console.log("Active App:", activeApp);
    console.log("Active Web App:", activeWebApp);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate context-aware mock responses
    let context = "";
    if (activeWebApp) {
      context = `Based on what I can see on ${activeWebApp}, `;
    } else if (activeApp) {
      context = `Looking at your ${activeApp} application, `;
    } else {
      context = "Based on the screenshot, ";
    }

    // Simple mock responses based on question keywords
    const question = userQuestion.toLowerCase();

    if (question.includes("what") || question.includes("how")) {
      return `${context}I can see the interface clearly. This appears to be a typical application with various UI elements. The layout looks well-organized and user-friendly. Is there something specific you'd like me to help you with regarding this interface?`;
    }

    if (question.includes("help") || question.includes("guide")) {
      return `${context}I'd be happy to help you navigate this interface! I can see several interactive elements that you might want to explore. Would you like me to highlight specific areas or explain particular features?`;
    }

    if (question.includes("button") || question.includes("click")) {
      return `${context}I can see several clickable elements in the interface. To help you better, could you tell me what specific action you're trying to perform? I can then guide you to the right button or menu option.`;
    }

    if (question.includes("menu") || question.includes("navigation")) {
      return `${context}I can see the navigation structure of this application. There appear to be several menu options and navigation elements available. What specific menu or section are you looking for?`;
    }

    if (question.includes("error") || question.includes("problem")) {
      return `${context}I can see the current state of the application. If you're experiencing an issue, could you describe what specific problem you're encountering? I can help you troubleshoot or find the right solution.`;
    }

    // Default response
    return `${context}I can see the current state of your screen. The interface looks well-designed and functional. How can I assist you with this application or website? I'm here to help with navigation, troubleshooting, or any questions you might have about the features and functionality.`;
  }*/
}

export default ChatGPTService;
