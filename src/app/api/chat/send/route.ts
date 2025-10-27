import { NextRequest } from 'next/server';
import type { ChatRequest, ChatResponse } from '@/types/chat';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { geminiModel } from '@/lib/gemini';

// Log environment variables for debugging
console.log('API Route loaded - GOOGLE_GEMINI_API_KEY present:', !!process.env.GOOGLE_GEMINI_API_KEY);

// Helper function to chunk text into segments of 600-800 characters
function chunkText(text: string, minChunkSize = 600, maxChunkSize = 800): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let currentPos = 0;

  while (currentPos < text.length) {
    let chunkEnd = Math.min(currentPos + maxChunkSize, text.length);
    
    // If we're not at the end, try to find a good break point
    if (chunkEnd < text.length) {
      // Look for sentence ending, then word boundary
      const sentenceBreak = text.lastIndexOf('.', chunkEnd);
      const wordBreak = text.lastIndexOf(' ', chunkEnd);
      
      if (sentenceBreak > currentPos + minChunkSize) {
        chunkEnd = sentenceBreak + 1;
      } else if (wordBreak > currentPos + minChunkSize) {
        chunkEnd = wordBreak + 1;
      }
    }
    
    chunks.push(text.slice(currentPos, chunkEnd));
    currentPos = chunkEnd;
  }

  return chunks;
}

// Helper function to extract text from uploaded files
async function extractTextFromFile(filename: string): Promise<string> {
  try {
    const uploadsDir = join(process.cwd(), 'uploads');
    const textFilePath = join(uploadsDir, `${filename}.txt`);
    
    // Read the extracted text content
    const textContent = await readFile(textFilePath, 'utf-8');
    return textContent;
  } catch (error) {
    console.error('Error reading text from file:', error);
    return '[Error reading file content]';
  }
}

export async function POST(request: NextRequest) {
  try {
    // Log the raw request to debug parsing issues
    console.log('Received request to chat API');
    
    let body;
    try {
      body = await request.json();
      console.log('Parsed request body:', body);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const { chatInput, topK = 5, temperature = 0.7, sessionId, fileName } = body as ChatRequest & { sessionId?: string, fileName?: string };

    console.log('Received chat request:', { chatInput, topK, temperature, sessionId, fileName });

    if (!chatInput || chatInput.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'chatInput is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create SSE response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Prepare the input for Gemini
          let finalInput = chatInput.trim();
          
          // If a file is referenced, include its content in the prompt
          if (fileName && sessionId) {
            const fileContent = await extractTextFromFile(fileName);
            finalInput = `Document Content:
${fileContent}

Question about the document:
${chatInput}`;
          }

          console.log('Sending request to Google Gemini with input:', finalInput);
          
          // Check if geminiModel is properly initialized
          if (!geminiModel) {
            throw new Error('Gemini model is not initialized. Check your API key configuration.');
          }
          
          // Generate content using Google Gemini
          console.log('Calling geminiModel.generateContentStream...');
          const result = await geminiModel.generateContentStream(finalInput);
          console.log('Received response from geminiModel.generateContentStream');
          
          let accumulatedContent = '';
          let chunkCount = 0;
          
          // Process the stream
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            accumulatedContent += chunkText;
            chunkCount++;
            
            console.log(`Received chunk ${chunkCount}:`, chunkText.substring(0, 100) + '...');
            
            // Send chunk immediately without delay for better responsiveness
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ 
                chunk: chunkText,
                isLast: false
              })}\n\n`)
            );
          }
          
          console.log('Finished streaming. Total chunks:', chunkCount, 'Total content length:', accumulatedContent.length);
          
          // Send final chunk
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              chunk: '',
              isLast: true,
              sources: [],
              usage: {
                tokens: accumulatedContent.length / 4 // Rough estimate
              }
            })}\n\n`)
          );

        } catch (error: any) {
          console.error('Chat API error:', error);
          // Check if it's a Google API error
          if (error.message && error.message.includes('API key not valid')) {
            console.error('Google API Key Error: Please verify your API key in .env.local');
          }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              error: 'Internal server error',
              details: error instanceof Error ? error.message : 'Unknown error'
            })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error: any) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}