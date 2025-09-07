import { NextRequest } from 'next/server';
import type { ChatRequest, ChatResponse } from '@/types/chat';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatInput, topK = 5, temperature = 0.7 } = body as ChatRequest;

    if (!chatInput || chatInput.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'chatInput is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get n8n configuration from environment
    const n8nBaseUrl = process.env.N8N_BASE_URL;
    const n8nWebhookPath = process.env.N8N_WEBHOOK_PATH;

    if (!n8nBaseUrl || !n8nWebhookPath) {
      return new Response(
        JSON.stringify({ error: 'N8N configuration missing' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create SSE response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send request to n8n webhook
          const n8nResponse = await fetch(`${n8nBaseUrl}${n8nWebhookPath}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chatInput: chatInput.trim(),
              topK,
              temperature,
            }),
          });

          if (!n8nResponse.ok) {
            throw new Error(`N8N request failed: ${n8nResponse.status}`);
          }

          const n8nData: ChatResponse = await n8nResponse.json();
          
          // If n8n returns a complete response, chunk it for streaming
          if (n8nData.output) {
            const chunks = chunkText(n8nData.output);
            
            // Send chunks with delay to simulate streaming
            for (let i = 0; i < chunks.length; i++) {
              const isLast = i === chunks.length - 1;
              
              const eventData = {
                chunk: chunks[i],
                isLast,
                sources: isLast ? n8nData.sources : undefined,
                usage: isLast ? n8nData.usage : undefined,
              };

              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`)
              );

              // Add small delay between chunks (except for the last one)
              if (!isLast) {
                await new Promise(resolve => setTimeout(resolve, 50));
              }
            }
          } else {
            // If no output, send error
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: 'No response from AI' })}\n\n`)
            );
          }

        } catch (error) {
          console.error('Chat API error:', error);
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

  } catch (error) {
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