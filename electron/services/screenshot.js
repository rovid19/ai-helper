import { desktopCapturer } from "electron";

/**
 * Capture a screenshot of the entire screen
 * @returns {Promise<string>} Base64 encoded screenshot
 */
export const captureScreenshot = async (win) => {
  console.log("Capturing screenshot...");
  try {
    const sources = await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: { width: 1920, height: 1080 },
    });

    if (sources.length === 0) {
      throw new Error("No screen sources found");
    }

    // Get the primary display screenshot
    const primarySource = sources[0];
    const base64Image = primarySource.thumbnail.toDataURL();

    // Extract just the base64 part (remove data:image/png;base64, prefix)
    const base64Data = base64Image.split(",")[1];

    //win.hide();
    console.log("Screenshot captured successfully");
    return base64Data;
  } catch (error) {
    console.error("Error capturing screenshot:", error);
    throw error;
  }
};
