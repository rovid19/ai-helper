import Prompts from "./prompts";

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
  ): Promise<string[] | string[][]> {
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
  ): Promise<string[] | string[][]> {
    console.log("promptAnalyze");
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
  ): Promise<string[] | string[][]> {
    console.log("screenshotAnalyze");
    console.log(
      `Analyzing screenshot of size: ~${Math.round(
        screenshotBase64.length * 0.75
      )} bytes`
    );

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

  private async makeApiCall(messages: any[]): Promise<string[][] | string[]> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
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

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Unexpected API response structure");
    }

    const steps = this.parseStepsFromResponse(data.choices[0].message.content);
    if (this.deepLens) {
      const coordinates = this.parseCoordinatesFromResponse(
        data.choices[0].message.content
      );
      return [[...steps], [...coordinates]];
    } else {
      return steps;
    }
  }

  private parseStepsFromResponse(response: string): string[] {
    const lines = response.split("\n");
    const steps: string[] = [];
    const stepPattern = /^Step \d+:\s*(.*)/;

    for (const line of lines) {
      const match = line.trim().match(stepPattern);
      if (match) {
        // Remove all backslashes before quotes
        const stepContent = match[1].trim().replace(/\\/g, "");
        steps.push(stepContent);
      }
    }

    return steps;
  }

  private parseCoordinatesFromResponse(response: string): string[] {
    const lines = response.split("\n");
    const coordinates: string[] = [];
    const coordinatePattern = /^Element \d+:\s*(.*)/;
    let inCoordinatesSection = false;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check if we're entering the coordinates section
      if (trimmedLine === "**Coordinates:**") {
        inCoordinatesSection = true;
        continue;
      }

      // Check if we're exiting the coordinates section (entering another section)
      if (trimmedLine.startsWith("**") && trimmedLine !== "**Coordinates:**") {
        inCoordinatesSection = false;
        continue;
      }

      if (inCoordinatesSection) {
        const coordinateMatch = trimmedLine.match(coordinatePattern);
        if (coordinateMatch) {
          const coordinateContent = coordinateMatch[1]
            .trim()
            .replace(/\\/g, "");
          coordinates.push(coordinateContent);
        }
      }
    }

    return coordinates;
  }
}

export default ChatGPTService;
