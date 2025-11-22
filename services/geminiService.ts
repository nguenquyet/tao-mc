
import { GoogleGenAI, Modality } from "@google/genai";
import type { FaceImage } from "../types";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAnchorImage = async (prompt: string, aspectRatio: string, faceImage: FaceImage | null): Promise<string> => {
  try {
    if (faceImage) {
      // Sử dụng gemini-2.5-flash-image cho đầu vào đa phương thức
      const imagePart = {
        inlineData: {
          data: faceImage.base64,
          mimeType: faceImage.mimeType,
        },
      };
      const textPart = { text: prompt };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });
      
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
      }
      throw new Error("API không trả về hình ảnh nào trong phản hồi đa phương thức.");

    } else {
      // Giữ logic hiện tại cho text-to-image bằng imagen
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
      } else {
        throw new Error("API không trả về hình ảnh nào.");
      }
    }
  } catch (error) {
    console.error("Lỗi khi tạo ảnh với Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Không thể tạo ảnh: ${error.message}. Kiểm tra console để biết thêm chi tiết.`);
    }
    throw new Error("Không thể tạo ảnh. Đã xảy ra lỗi không xác định.");
  }
};
