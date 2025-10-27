// List available Google Gemini models
require('dotenv').config({ path: '.env.local' });

const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  console.log('Listing available Google Gemini models...');
  
  // Check if API key is present
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: GOOGLE_GEMINI_API_KEY not found in environment variables');
    return;
  }
  
  try {
    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // List models
    const result = await genAI.listModels();
    const models = result.models;
    
    console.log('Available models:');
    models.forEach(model => {
      console.log(`- ${model.name} (${model.displayName})`);
      if (model.description) {
        console.log(`  Description: ${model.description}`);
      }
      console.log(`  Supported methods: ${model.supportedGenerationMethods?.join(', ') || 'None'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error listing models:', error.message);
  }
}

listModels();