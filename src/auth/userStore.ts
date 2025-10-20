// Simple in-memory user store for authentication
// In a real application, this would be a database

export interface User {
  id: string;
  email: string;
  name: string;
  password: string; // In a real app, this would be hashed
}

// Simple in-memory store
export const users: { [key: string]: User } = {
  // Default test user
  'test@example.com': {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'password123',
  }
};