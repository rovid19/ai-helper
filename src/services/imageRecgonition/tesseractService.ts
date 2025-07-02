import Tesseract from "tesseract.js";

interface TextDetection {
  text: string;
  confidence: number;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

class TesseractService {
  private worker: any = null;

  async initialize(): Promise<void> {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker();
      await this.worker.loadLanguage("eng");
      await this.worker.initialize("eng");
    }
  }

  async detectAllText(imageBase64: string): Promise<TextDetection[]> {
    await this.initialize();

    if (!this.worker) {
      throw new Error("Tesseract worker not initialized");
    }

    const result = await this.worker.recognize(
      `data:image/png;base64,${imageBase64}`
    );

    const textDetections: TextDetection[] = [];

    // Handle both words and lines depending on what's available
    const words =
      (result.data as any).words || (result.data as any).lines || [];

    words.forEach((word: any) => {
      textDetections.push({
        text: word.text,
        confidence: word.confidence,
        bbox: {
          x0: word.bbox.x0,
          y0: word.bbox.y0,
          x1: word.bbox.x1,
          y1: word.bbox.y1,
        },
      });
    });

    return textDetections;
  }

  async findTargetText(
    imageBase64: string,
    targetText: string
  ): Promise<TextDetection | null> {
    const allText = await this.detectAllText(imageBase64);

    // Find exact match (case insensitive)
    const exactMatch = allText.find(
      (detection) => detection.text.toLowerCase() === targetText.toLowerCase()
    );

    if (exactMatch) {
      return exactMatch;
    }

    // Find partial match
    const partialMatch = allText.find(
      (detection) =>
        detection.text.toLowerCase().includes(targetText.toLowerCase()) ||
        targetText.toLowerCase().includes(detection.text.toLowerCase())
    );

    return partialMatch || null;
  }

  // Convert bounding box to percentage coordinates
  convertBboxToPercentages(
    bbox: any,
    imageWidth: number,
    imageHeight: number
  ): [number, number] {
    const centerX = (bbox.x0 + bbox.x1) / 2;
    const centerY = (bbox.y0 + bbox.y1) / 2;

    const xPercent = (centerX / imageWidth) * 100;
    const yPercent = (centerY / imageHeight) * 100;

    return [Math.round(xPercent), Math.round(yPercent)];
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export default TesseractService;
