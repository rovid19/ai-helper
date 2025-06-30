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

1. **Use screenshot context intelligently**: If the screenshot shows the user is already on the relevant screen/page for their question, start directly with answering their question rather than giving navigation instructions
2. **Identify UI element coordinates**: When the user asks about specific UI elements (buttons, text, fields, etc.), identify their approximate coordinates in the format [x, y] where x is horizontal position (0-100%) and y is vertical position (0-100%)
3. Break down your response into clear, numbered steps
4. Each step should be a single, specific action
5. Use precise UI element descriptions (e.g. "Click the blue 'Submit' button in the top-right corner")
6. Keep steps concise and actionable
7. Include 3-7 steps total
8. End with a confirmation of task completion

**Important**: If the user asks about information visible in the screenshot (like "how much money did I spend?" and you can see spending data in the image), include the direct answer as Step 1, then provide any additional context or next steps if needed.

**Coordinate Requirements**: 
- Every step that involves clicking, typing, or interacting with a UI element MUST have a corresponding coordinate
- If a step is informational only (like "You have spent $0.10"), it doesn't need a coordinate
- The number of coordinates should match the number of interactive steps
- Each coordinate should correspond to the exact element mentioned in its step

**Coordinate Format**: When mentioning UI elements, include their coordinates like this: "the blue 'Submit' button [85, 15]" where the first number is horizontal position and second is vertical position as percentages of screen width/height.

Format your response like this:

**Steps:**
Step 1: [Direct answer to user's question OR first action]
Step 2: [Second action]
Step 3: [Third action]
...
Completion: [What the user should see/expect when done]

**Coordinates:**
Element 1: [element description] - [x, y]
Element 2: [element description] - [x, y]
Element 3: [element description] - [x, y]
...`;
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
