import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeminiAiService {
  private readonly MODEL_NAME = 'gemini-1.5-flash';
  
  async getImageAsBase64(imageUrl: string): Promise<string> {
    const fetchResponse = await fetch(imageUrl);
    const blob = await fetchResponse.blob();
    const base64data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    return base64data.split(',')[1];
  }

  async generateRecipe(imageBase64: string, prompt: string): Promise<string> {
    try {
      const genAI = new GoogleGenerativeAI(environment.apiKey);
      const model = genAI.getGenerativeModel({ model: this.MODEL_NAME });

      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { 
              inlineData: { 
                mimeType: 'image/jpeg', 
                data: imageBase64
              } 
            },
            { text: prompt }
          ]
        }]
      });

      return result.response.text();
      
    } catch (error) {
      throw new Error('Failed to generate recipe');
    }
  }
}