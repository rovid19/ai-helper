import Prompts from "./prompts";
import { useStepStore } from "../../stores/stepStore";
import Prompt1 from "./prompt1";

class ChatGPTService {
  private apiKey: string = import.meta.env.VITE_OPENAI_API_KEY;
  private contextPrompt: string = "";
  private deepLens: boolean = false;
  //private useMock: boolean = true; // Set to false to use real API

  async analyze(
    screenshotBase64: string | null,
    userQuestion: string,
    activeApp?: string,
    activeWebApp?: string
  ): Promise<{ targetText: string | null; description: string }[]> {
    if (screenshotBase64) {
      this.deepLens = true;
      return this.screenshotAnalyze(
        screenshotBase64,
        userQuestion,
        activeApp,
        activeWebApp
      );
    } else {
      return this.promptAnalyze(userQuestion, activeApp, activeWebApp);
    }
  }

  async promptAnalyze(
    userQuestion: string,
    activeApp?: string,
    activeWebApp?: string
  ): Promise<{ targetText: string | null; description: string }[]> {
    this.determineContextPrompt(userQuestion, activeApp, activeWebApp);

    const messages = [
      {
        role: "user",
        content: this.contextPrompt,
      },
    ];

    return this.makeApiCall(messages);
  }

  async screenshotAnalyze(
    screenshotBase64: string,
    userQuestion: string,
    activeApp?: string,
    activeWebApp?: string
  ): Promise<{ targetText: string | null; description: string }[]> {
    this.determineContextPrompt(userQuestion, activeApp, activeWebApp);
    const messages = [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${screenshotBase64}`,
              detail: "high",
            },
          },
          {
            type: "text",
            text: this.contextPrompt,
          },
        ],
      },
    ];

    return this.makeApiCall(messages);
  }

  private determineContextPrompt(
    userQuestion: string,
    activeApp?: string,
    activeWebApp?: string
  ): void {
    // Check if user is stuck on a step
    const userStuckOn = useStepStore.getState().userStuckOn;
    if (userStuckOn) {
      this.contextPrompt = new Prompts("userStuck").getContextPrompt(
        userQuestion
      );
      return;
    }
    if (activeWebApp) {
      this.contextPrompt = new Prompts("activeWebApp").getContextPrompt(
        userQuestion,
        activeWebApp
      );
    } else if (activeApp) {
      this.contextPrompt = new Prompts("activeApp").getContextPrompt(
        userQuestion,
        activeApp
      );
    }
  }

  private async makeApiCall(
    messages: any[]
  ): Promise<{ targetText: string | null; description: string }[]> {
    console.log(this.contextPrompt);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        max_tokens: 1000,
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

    console.log("Raw GPT response:", data.choices[0].message.content);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Unexpected API response structure");
    }

    const steps = ChatGPTService.parseStepsWithTargetText(
      data.choices[0].message.content
    );
    console.log("Parsed steps:", steps);
    useStepStore.getState().setSteps(steps);
    return steps;
  }

  // Change to public static so it can be used outside
  public static parseStepsWithTargetText(
    response: string
  ): { targetText: string | null; description: string }[] {
    const lines = response.split("\n");
    const stepPattern = /^Step \d+:\s*(.*)\|\s*Target:\s*(.*)$/i;
    const steps: { targetText: string | null; description: string }[] = [];

    for (const line of lines) {
      const match = line.trim().match(stepPattern);
      if (match) {
        const description = match[1].trim();
        let targetText: string | null = match[2].trim();
        if (
          targetText.toLowerCase() === "none" ||
          targetText.toLowerCase() === "null"
        ) {
          targetText = null;
        }
        steps.push({ description, targetText });
      }
    }

    return steps;
  }

  // New method: create thread, send screenshot and prompt, get steps
  async analyzeWithAssistantApi(
    assistantApiService: any, // expects an instance of AssistantApiService
    screenshotBase64: string,
    userQuestion: string
  ): Promise<{ targetText: string | null; description: string }[]> {
    // 1. Create a new thread
    await assistantApiService.createThread();
    // 2. Generate the initial prompt
    const prompt = Prompt1.getInitialPrompt(userQuestion);
    // 3. Send the screenshot and prompt as a message
    await assistantApiService.sendMessage(prompt, screenshotBase64);
    // 4. Run the assistant and get the response
    const responseContent = await assistantApiService.runAndGetResponse();
    console.log("Response from assistant", responseContent);
    // 5. Parse the response using the existing parser
    const steps = ChatGPTService.parseStepsWithTargetText(
      Array.isArray(responseContent) &&
        responseContent.length > 0 &&
        responseContent[0].text
        ? responseContent[0].text.value || responseContent[0].text
        : typeof responseContent === "string"
        ? responseContent
        : ""
    );

    useStepStore.getState().setSteps(steps);
    console.log("Steps from assistant", steps);
    return steps;
  }
}

export default ChatGPTService;
