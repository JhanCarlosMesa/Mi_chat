// Simple test to verify API key
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

// Extract GOOGLE_GEMINI_API_KEY
const apiKeyMatch = envContent.match(/GOOGLE_GEMINI_API_KEY=(.+)/);
if (apiKeyMatch && apiKeyMatch[1]) {
  const apiKey = apiKeyMatch[1].trim();
  console.log('API Key found:', apiKey ? 'Yes' : 'No');
  console.log('API Key length:', apiKey.length);
  console.log('API Key starts with:', apiKey.substring(0, 10) + '...');
  
  // Check if it looks like a valid API key
  if (apiKey.length < 30) {
    console.log('Warning: API Key seems too short to be valid');
  } else {
    console.log('API Key appears to be of correct length');
  }
} else {
  console.log('API Key not found in .env.local');
}