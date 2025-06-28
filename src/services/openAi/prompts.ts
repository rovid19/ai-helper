class Prompts {
  private promptType: "activeWebApp" | "activeApp";

  constructor(type: "activeWebApp" | "activeApp") {
    this.promptType = type;
  }

  private activeWebAppPrompt(webAppUrl: string, userQuestion: string): string {
    return `The user is currently on the website: ${webAppUrl} and his questions will be related to this website even if he is not mentioning the website name. ${userQuestion}`;
  }

  private activeAppPrompt(appName: string, userQuestion: string): string {
    return `The user is currently in the application ${appName} and his questions will be related to this application even if he is not mentioning the application name. ${userQuestion}`;
  }

  private structureResponsePrompt(): string {
    return `Please analyze the screenshot and provide a step-by-step guide to help the user. Follow these rules:

1. Break down your response into clear, numbered steps
2. Each step should be a single, specific action
3. Use precise UI element descriptions (e.g. "Click the blue 'Submit' button in the top-right corner")
4. Keep steps concise and actionable
5. Include 3-7 steps total
6. End with a confirmation of task completion

Format your response like this:
Step 1: [First action]
Step 2: [Second action]
Step 3: [Third action]
...
Completion: [What the user should see/expect when done]`;
  }

  getContextPrompt(
    userQuestion: string,
    activeApp?: string,
    activeWebApp?: string
  ): string {
    let contextPrompt = "";

    if (this.promptType === "activeWebApp" && activeWebApp) {
      contextPrompt = this.activeWebAppPrompt(activeWebApp, userQuestion);
    } else if (this.promptType === "activeApp" && activeApp) {
      contextPrompt = this.activeAppPrompt(activeApp, userQuestion);
    } else {
      contextPrompt = userQuestion;
    }

    return `${contextPrompt}\n${this.structureResponsePrompt()}`;
  }
}

export default Prompts;
