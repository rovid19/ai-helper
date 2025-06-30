export class DeepLensService {
  // Change this value to test different JPEG qualities (0.0 - 1.0)
  private readonly JPEG_QUALITY = 0.7;
  private readonly MAX_WIDTH = 1000; // Start with 800px width
  private readonly QUALITY_LEVELS = [0.8, 0.6, 0.4, 0.2]; // JPEG quality levels to test

  async analyzeImage(): Promise<string> {
    try {
      const screenshotBase64 = await window.electronAPI.captureScreenshot();
      const optimizedImage = await this.optimizeImage(screenshotBase64);
      return optimizedImage;
    } catch (error) {
      console.error("Error in DeepLens analysis:", error);
      throw error;
    }
  }

  // Method to test different quality levels and find optimal balance
  async testQualityLevels(
    base64Image: string
  ): Promise<{ quality: number; size: number; analysis: string[] }[]> {
    const results = [];

    for (const quality of this.QUALITY_LEVELS) {
      try {
        const optimizedImage = await this.optimizeImageWithQuality(
          base64Image,
          quality
        );
        const size = Math.round(optimizedImage.length * 0.75);

        // You could run a test analysis here to compare quality
        // For now, we'll just return the size info
        results.push({
          quality,
          size,
          analysis: [], // Placeholder for actual analysis comparison
        });

        console.log(`Quality ${quality}: ${size} bytes`);
      } catch (error) {
        console.error(`Error testing quality ${quality}:`, error);
      }
    }

    return results;
  }

  private async optimizeImage(base64Image: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          // Calculate new dimensions maintaining aspect ratio
          const aspectRatio = img.width / img.height;
          const newWidth = Math.min(img.width, this.MAX_WIDTH);
          const newHeight = newWidth / aspectRatio;

          // Set canvas dimensions
          canvas.width = newWidth;
          canvas.height = newHeight;

          // Draw and scale the image
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          // Convert to base64 with compression
          const optimizedBase64 = canvas.toDataURL(
            "image/jpeg",
            this.JPEG_QUALITY
          );

          // Extract just the base64 part (remove data:image/jpeg;base64, prefix)
          const base64Data = optimizedBase64.split(",")[1];

          console.log(
            `Image optimized: ${img.width}x${img.height} -> ${newWidth}x${newHeight}`
          );
          console.log(
            `Original size: ~${Math.round(base64Image.length * 0.75)} bytes`
          );
          console.log(
            `Optimized size: ~${Math.round(base64Data.length * 0.75)} bytes`
          );
          console.log(
            `Size reduction: ~${Math.round(
              (1 - base64Data.length / base64Image.length) * 100
            )}%`
          );

          resolve(base64Data);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image for optimization"));
      };

      // Load the image from base64
      img.src = `data:image/png;base64,${base64Image}`;
    });
  }

  private async optimizeImageWithQuality(
    base64Image: string,
    quality: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          const aspectRatio = img.width / img.height;
          const newWidth = Math.min(img.width, this.MAX_WIDTH);
          const newHeight = newWidth / aspectRatio;

          canvas.width = newWidth;
          canvas.height = newHeight;
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          const optimizedBase64 = canvas.toDataURL("image/jpeg", quality);
          const base64Data = optimizedBase64.split(",")[1];

          resolve(base64Data);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image for optimization"));
      };

      img.src = `data:image/png;base64,${base64Image}`;
    });
  }
}
