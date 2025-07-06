import { useStepStore } from "../../stores/stepStore";

class Prompts {
  /*private promptType: "activeWebApp" | "activeApp" | "userStuck";

  constructor(type: "activeWebApp" | "activeApp" | "userStuck") {
    this.promptType = type;
  }

  private activeWebAppPrompt(webAppUrl: string, userQuestion: string): string {
    return `The user is currently on the website: ${webAppUrl} and his questions will be related to this website even if he is not mentioning the website name. ${userQuestion}`;
  }

  private activeAppPrompt(appName: string, userQuestion: string): string {
    return `The user is currently in the application ${appName} and his questions will be related to this application even if he is not mentioning the application name. ${userQuestion}`;
  }

  private structureResponsePrompt(): string {
    return `Please carefully analyze the screenshot and provide a response based on the user's question type. Follow these rules:

**CRITICAL: The screenshot represents the user's current location in the app. You MUST use this as your starting point and build a tutorial from here. NEVER say "I can't see" or "I'm unable to see" - instead, start with what IS visible and guide the user from their current position.**

1. **Always start from the screenshot**: The screenshot shows exactly where the user is right now. Your first step must be something the user can actually do from this screen. Look for:
   - Navigation menus (top, left, right, bottom)
   - Buttons, links, or interactive elements
   - Settings icons, profile icons, menu buttons
   - Any clickable elements visible in the screenshot

2. **Build the tutorial from current position**: Even if you can't see the exact final destination, start with what's visible and guide the user step by step. For example:
   - If user wants to deactivate account but you see a profile icon → Step 1: "Click on your profile icon"
   - If user wants settings but you see a menu → Step 1: "Click on the menu button"
   - If user wants to find something but you see a search bar → Step 1: "Click on the search bar"

3. **Prefer Shortcuts**: If there is a keyboard shortcut available in the app to perform the requested action, instruct the user to use the shortcut. For such steps, set target text to "none".

4. **Target General Menus**: When guiding the user to interact with the UI, the target text should refer to the general menu or section (e.g., "Layout", "Appearance") where the action is performed, not the specific button or field. Only use a more specific target if the action cannot be performed from a general menu.

5. **Single Atomic Actions**: Each step must be a single, atomic action. Do not combine multiple actions into one step. For example:
   - WRONG: "Click on 'Settings' from the menu" (two actions: click menu + click settings)
   - CORRECT: Step 1: "Click on the menu" | Target: "Menu", Step 2: "Click on 'Settings'" | Target: "Settings"

6. **Break down your response into clear, numbered steps**:
   - Each step should be a single click or action that the user needs to perform
   - Do not combine multiple clicks or actions into one step
   - Use precise UI element descriptions based on what you actually see in the screenshot
   - Include as many steps as needed - each click should be its own step
   - End with a confirmation of task completion

**IMPORTANT RULES**:
- **NEVER say "I can't see" or "I'm unable to see"**
- **ALWAYS start with what IS visible in the screenshot**
- **ALWAYS build the tutorial from the user's current position**
- **For information questions**: Start with the direct answer as Step 1
- **For action questions**: Provide step-by-step instructions starting with Step 1
- **Always base your instructions on what you can actually see in the screenshot**

Format your response like this:

**Steps:**
Step 1: [Direct answer OR first action from current screen] | Target: [general menu/section, or "none" if using a shortcut]
Step 2: [Second action if needed] | Target: [general menu/section, or "none"]
Step 3: [Third action if needed] | Target: [general menu/section, or "none"]
...
Completion: [What the user should see/expect when done]`;
  }

  private userStuckPrompt(): string {
    const state = useStepStore.getState();
    const userQuestion = state.userQuestion;
    const steps = state.steps;
    const currentStepIndex = state.currentStepIndex;
    const stepNumber = currentStepIndex !== null ? currentStepIndex + 1 : 1;

    return `You were previously asked by a user this question: "${userQuestion}"

You formed this tutorial for the user:
${
  steps
    ? steps
        .map(
          (step, index) =>
            `Step ${index + 1}: ${step.description} | Target: ${
              step.targetText || "none"
            }`
        )
        .join("\n")
    : "No steps available"
}

The user got stuck on step: ${stepNumber}

The user may have followed your previous instructions, but the UI did not match what you described. Analyze the user's current UI (from the new screenshot) and compare it to the step above. Most likely, you referenced something that does not exist in the user's UI. Carefully review the UI and generate a new, correct set of step-by-step instructions that match what is actually present in the user's UI. If the user's question is relevant, answer it with the correct steps. If not, explain why the action cannot be performed. Be concise and clear.

**IMPORTANT**: Return a complete tutorial from the step where the user stopped (step ${stepNumber}), but this time updated to match what you actually see in the current screenshot.

${this.structureResponsePrompt()}`;
  }

  getContextPrompt(
    userQuestion: string,
    activeApp?: string,
    activeWebApp?: string
  ): string {
    let contextPrompt = "";

    if (this.promptType === "userStuck") {
      contextPrompt = this.userStuckPrompt();
    } else if (this.promptType === "activeWebApp" && activeWebApp) {
      contextPrompt = this.activeWebAppPrompt(activeWebApp, userQuestion);
    } else if (this.promptType === "activeApp" && activeApp) {
      contextPrompt = this.activeAppPrompt(activeApp, userQuestion);
    } else {
      contextPrompt = userQuestion;
    }

    return `${contextPrompt}\n${this.structureResponsePrompt()}`;
  }*/
}

export default Prompts;
