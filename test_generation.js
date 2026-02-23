import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const modelsToTest = [
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash-lite-001",
  "gemini-2.5-flash-lite",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemma-3-1b-it"
];

async function run() {
  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing ${modelName}...`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: "Hi, respond with the single word 'ok'."
      });
      console.log(`✅ Success for ${modelName}: ${response.text.trim()}`);
      return; // Exit on first success
    } catch (err) {
      console.log(`❌ Failed for ${modelName}: ${err.message}`);
    }
  }
}
run();
