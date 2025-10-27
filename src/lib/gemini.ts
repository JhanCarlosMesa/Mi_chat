import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicializar Google Generative AI
// NOTA: Deberás agregar tu API key en las variables de entorno
const apiKey = process.env.GOOGLE_GEMINI_API_KEY || "";
console.log("Google Gemini API Key present:", !!apiKey);
console.log("API Key length:", apiKey.length);

if (!apiKey) {
  console.warn("Google Gemini API Key is missing. Please add it to your .env.local file.");
} else if (apiKey.length < 30) {
  console.warn("Google Gemini API Key seems too short. Please verify it's correct.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Modelo para chat (usando gemini-1.5-pro-001 que está disponible)
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro-001" });

// Modelo para embedding (si lo necesitas en el futuro)
export const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });