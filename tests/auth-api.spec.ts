import { test, expect } from '@playwright/test';

test('should allow user to register and login via API', async ({ request }) => {
  // Generate unique email for each test run
  const timestamp = Date.now();
  const email = `test${timestamp}@example.com`;
  
  // Register a new user
  const registerResponse = await request.post('/api/auth/register', {
    data: {
      name: 'Test User',
      email: email,
      password: 'password123'
    }
  });
  
  expect(registerResponse.status()).toBe(201);
  const registerData = await registerResponse.json();
  expect(registerData.email).toBe(email);
  expect(registerData.name).toBe('Test User');
  expect(registerData.password).toBeUndefined();
  
  // Login with the registered user in the same test run
  const loginResponse = await request.post('/api/auth/login', {
    data: {
      email: email,
      password: 'password123'
    }
  });
  
  // This might fail due to server restart, but let's see
  expect(loginResponse.status()).toBe(200);
  const loginData = await loginResponse.json();
  expect(loginData.email).toBe(email);
  expect(loginData.name).toBe('Test User');
  expect(loginData.password).toBeUndefined();
});