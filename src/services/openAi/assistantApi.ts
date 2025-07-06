import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Only if running in browser context!
});

export class AssistantApiService {
  private assistantId: string;
  private threadId: string | null = null;

  constructor(assistantId: string) {
    this.assistantId = assistantId;
  }

  // Create a new thread (call this at the start of a new session)
  async createThread() {
    const thread = await openai.beta.threads.create();
    this.threadId = thread.id;
    return thread.id;
  }

  // Send a message (text or image) to the thread
  async sendMessage(content: string, imageBase64?: string) {
    if (!this.threadId) throw new Error("Thread not initialized");
    let messageContent: any = content;
    if (imageBase64) {
      // Convert base64 to Blob and File (browser context)
      const byteCharacters = atob(imageBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/jpeg" });
      const file = new File([blob], "screenshot.jpg", { type: "image/jpeg" });

      // Upload image to OpenAI and get file_id
      const uploaded = await openai.files.create({
        file,
        purpose: "assistants",
      });

      messageContent = [
        {
          type: "image_file",
          image_file: { file_id: uploaded.id },
        },
        { type: "text", text: content },
      ];
    }
    await openai.beta.threads.messages.create(this.threadId, {
      role: "user",
      content: messageContent,
    });
  }

  // Run the assistant and get the latest response
  async runAndGetResponse() {
    if (!this.threadId) throw new Error("Thread not initialized");
    const run = await openai.beta.threads.runs.create(this.threadId, {
      assistant_id: this.assistantId,
    });

    // Poll for completion
    let status = run.status;
    let runId = run.id;
    while (
      status !== "completed" &&
      status !== "failed" &&
      status !== "cancelled"
    ) {
      await new Promise((res) => setTimeout(res, 1000));
      const updatedRun = await openai.beta.threads.runs.retrieve(runId, {
        thread_id: this.threadId!,
      });
      status = updatedRun.status;
    }

    // Get the latest assistant message
    const messages = await openai.beta.threads.messages.list(this.threadId);
    const lastMsg = messages.data.find((msg) => msg.role === "assistant");
    return lastMsg?.content;
  }

  // Retrieve and log all messages in the current thread
  async logThreadMessages() {
    if (!this.threadId) {
      console.warn("No threadId set in AssistantApiService");
      return;
    }
    try {
      const messages = await openai.beta.threads.messages.list(this.threadId);
      messages.data.forEach((msg, idx) => {
        console.log(`Message #${messages.data.length - idx}:`);
        console.log("Role:", msg.role);
        console.log("Content:", msg.content);
        if (msg.attachments) {
          console.log("Attachments:", msg.attachments);
        }
      });
      return messages;
    } catch (error) {
      console.error("Error retrieving thread messages:", error);
    }
  }
}
