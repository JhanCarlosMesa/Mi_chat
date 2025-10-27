// Test Google Gemini connection
require('dotenv').config({ path: '.env.local' });

const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testConnection() {
  console.log('Testing Google Gemini connection...');
  
  // Check if API key is present
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: GOOGLE_GEMINI_API_KEY not found in environment variables');
    return;
  }
  
  console.log('API Key present: Yes');
  console.log('API Key length:', apiKey.length);
  
  try {
    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Get the model (using gemini-1.5-flash instead of gemini-pro)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log('Model initialized successfully');
    
    // Test with a simple prompt
    console.log('Sending test prompt to Gemini...');
    const prompt = "Say hello in one word";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Response from Gemini:', text);
    console.log('Connection test: PASSED');
    
  } catch (error) {
    console.error('Connection test: FAILED');
    console.error('Error details:', error.message);
    
    // Check for specific error types
    if (error.message.includes('API key not valid')) {
      console.error('The API key appears to be invalid. Please check your .env.local file.');
    } else if (error.message.includes('400')) {
      console.error('Bad request error. This might indicate an invalid API key or other issue.');
    } else if (error.message.includes('403')) {
      console.error('Forbidden error. The API key might not have the correct permissions.');
    } else if (error.message.includes('404')) {
      console.error('Not found error. This might indicate an incorrect model name.');
    }
  }
}

testConnection();