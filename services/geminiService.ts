import { GoogleGenAI } from "@google/genai";

// Initialize the client
// Note: API_KEY is guaranteed to be available in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fixJsonWithGemini = async (input: string): Promise<string> => {
  const model = 'gemini-2.5-flash';
  
  const prompt = `
    You are a smart JSON repair engine.
    The user has provided an input string that represents a data structure but is not valid JSON.
    
    Common issues to fix:
    1. Python dictionary syntax (single quotes, None, True, False).
    2. Trailing commas.
    3. Stringified JSON that is double-escaped (e.g. "{\\"a\\": 1}").
    4. Missing quotes around keys.
    
    Your Task:
    - Convert the input into valid, standard JSON.
    - Return ONLY the raw JSON string.
    - Do NOT use Markdown formatting (no \`\`\`json).
    - Do NOT add explanations.

    Input to fix:
    ${input}
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    let text = response.text;
    
    if (!text) {
      throw new Error("Empty response from AI");
    }

    // Cleanup if the model added markdown despite instructions
    text = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    
    return text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to repair JSON with AI.");
  }
};
