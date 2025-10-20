import { test, expect } from '@playwright/test';

test('should allow user to register and see chat interface', async ({ page }) => {
  // Generate unique email for each test run
  const timestamp = Date.now();
  const email = `test${timestamp}@example.com`;
  
  // Go to registration page
  await page.goto('/register');
  
  // Fill registration form
  await page.getByPlaceholder('Tu nombre completo').fill('Test User');
  await page.getByPlaceholder('tu@ejemplo.com').fill(email);
  await page.locator('#password').fill('password123');
  await page.locator('#confirm-password').fill('password123');
  
  // Submit registration form
  await page.locator('button[type="submit"]').click();
  
  // Should be redirected to chat page
  await page.waitForURL(/.*es.*/);
  await expect(page).toHaveURL(/.*es.*/);
  
  // Check if chat elements are visible
  await expect(page.getByTestId('chat-input')).toBeVisible({ timeout: 10000 });
});