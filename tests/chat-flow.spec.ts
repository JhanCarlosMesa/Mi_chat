import { test, expect } from '@playwright/test';

test.describe('Chat Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the chat page
    await page.goto('/es');
  });

  test('should display chat interface correctly', async ({ page }) => {
    // Check if main chat elements are present
    await expect(page.getByTestId('chat-title')).toBeVisible();
    await expect(page.getByTestId('chat-title')).toHaveText('Chat IA');
    
    await expect(page.getByTestId('chat-input')).toBeVisible();
    await expect(page.getByTestId('send-button')).toBeVisible();
    await expect(page.getByTestId('clear-chat-button')).toBeVisible();
    
    await expect(page.getByTestId('chat-messages')).toBeVisible();
  });

  test('should handle empty message correctly', async ({ page }) => {
    // Try to send empty message
    await page.getByTestId('send-button').click();
    
    // Should not send anything and button should remain disabled for empty input
    await expect(page.getByTestId('chat-messages')).not.toContainText('');
  });

  test('should send message and receive response', async ({ page }) => {
    // Mock the API response
    await page.route('/api/chat/send', async route => {
      const mockResponse = new Response(
        'data: {"chunk": "Hola, ", "isLast": false}\n\n' +
        'data: {"chunk": "¿cómo puedo ayudarte hoy?", "isLast": true, "sources": ["Test source"], "usage": {"tokens": 15, "cost": 0.001}}\n\n',
        {
          status: 200,
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        }
      );
      await route.fulfill({ response: mockResponse });
    });

    // Type a message
    const testMessage = 'Hola, ¿cómo estás?';
    await page.getByTestId('chat-input').fill(testMessage);
    
    // Send the message
    await page.getByTestId('send-button').click();
    
    // Check if user message appears
    await expect(page.getByTestId('user-message')).toBeVisible();
    await expect(page.getByTestId('user-message')).toContainText(testMessage);
    
    // Wait for AI response
    await expect(page.getByTestId('ai-message')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('ai-message')).toContainText('Hola, ¿cómo puedo ayudarte hoy?');
    
    // Check if sources and usage are displayed
    await expect(page.getByTestId('ai-message')).toContainText('Fuentes:');
    await expect(page.getByTestId('ai-message')).toContainText('Test source');
    await expect(page.getByTestId('ai-message')).toContainText('Uso:');
    await expect(page.getByTestId('ai-message')).toContainText('15 tokens');
  });

  test('should handle streaming response', async ({ page }) => {
    // Mock streaming response
    await page.route('/api/chat/send', async route => {
      const mockResponse = new Response(
        'data: {"chunk": "Esta es ", "isLast": false}\n\n' +
        'data: {"chunk": "una respuesta ", "isLast": false}\n\n' +
        'data: {"chunk": "en streaming.", "isLast": true}\n\n',
        {
          status: 200,
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        }
      );
      await route.fulfill({ response: mockResponse });
    });

    // Send a message
    await page.getByTestId('chat-input').fill('Test streaming');
    await page.getByTestId('send-button').click();
    
    // Check for streaming message indicator
    await expect(page.getByTestId('streaming-message')).toBeVisible({ timeout: 5000 });
    
    // Wait for final message
    await expect(page.getByTestId('ai-message')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('ai-message')).toContainText('Esta es una respuesta en streaming.');
  });

  test('should clear chat messages', async ({ page }) => {
    // Mock API response
    await page.route('/api/chat/send', async route => {
      const mockResponse = new Response(
        'data: {"chunk": "Respuesta de prueba", "isLast": true}\n\n',
        {
          status: 200,
          headers: {
            'Content-Type': 'text/event-stream',
          },
        }
      );
      await route.fulfill({ response: mockResponse });
    });

    // Send a message first
    await page.getByTestId('chat-input').fill('Mensaje de prueba');
    await page.getByTestId('send-button').click();
    
    // Wait for messages to appear
    await expect(page.getByTestId('user-message')).toBeVisible();
    await expect(page.getByTestId('ai-message')).toBeVisible();
    
    // Clear the chat
    await page.getByTestId('clear-chat-button').click();
    
    // Check that messages are cleared
    await expect(page.getByTestId('user-message')).not.toBeVisible();
    await expect(page.getByTestId('ai-message')).not.toBeVisible();
  });

  test('should handle API error correctly', async ({ page }) => {
    // Mock API error
    await page.route('/api/chat/send', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    // Send a message
    await page.getByTestId('chat-input').fill('Test error handling');
    await page.getByTestId('send-button').click();
    
    // Check if user message appears
    await expect(page.getByTestId('user-message')).toBeVisible();
    
    // Check if error message appears
    await expect(page.getByTestId('ai-message')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('ai-message')).toContainText('Error al procesar la solicitud');
  });

  test('should support keyboard shortcuts', async ({ page }) => {
    // Mock API response
    await page.route('/api/chat/send', async route => {
      const mockResponse = new Response(
        'data: {"chunk": "Respuesta con Enter", "isLast": true}\n\n',
        {
          status: 200,
          headers: {
            'Content-Type': 'text/event-stream',
          },
        }
      );
      await route.fulfill({ response: mockResponse });
    });

    // Type message and press Enter
    await page.getByTestId('chat-input').fill('Mensaje con Enter');
    await page.getByTestId('chat-input').press('Enter');
    
    // Check if message was sent
    await expect(page.getByTestId('user-message')).toBeVisible();
    await expect(page.getByTestId('user-message')).toContainText('Mensaje con Enter');
  });
});