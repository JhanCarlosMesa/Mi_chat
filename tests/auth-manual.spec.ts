import { test, expect } from '@playwright/test';

test('should allow user to register and login via UI', async ({ page }) => {
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
  await page.waitForURL(/.*es.*/, { timeout: 30000 });
  await expect(page).toHaveURL(/.*es.*/);
  
  // Check that we're on the chat page by checking for the chat input
  // Wait for the element to appear
  await expect(page.getByTestId('chat-input')).toBeVisible({ timeout: 30000 });
  
  // Logout
  await page.getByText('Cerrar sesión').click();
  
  // Should be redirected to login page
  await expect(page).toHaveURL(/.*login.*/);
  
  // Fill login form
  await page.getByPlaceholder('tu@ejemplo.com').fill(email);
  await page.locator('#password').fill('password123');
  
  // Submit login form
  await page.locator('button[type="submit"]').click();
  
  // Should be redirected to chat page
  await page.waitForURL(/.*es.*/, { timeout: 30000 });
  await expect(page).toHaveURL(/.*es.*/);
  
  // Check that we're on the chat page by checking for the chat input
  // Wait for the element to appear
  await expect(page.getByTestId('chat-input')).toBeVisible({ timeout: 30000 });
});