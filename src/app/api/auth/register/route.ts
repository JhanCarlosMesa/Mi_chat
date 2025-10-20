import { NextRequest } from 'next/server';

// Simple in-memory user store
const users: { [key: string]: { id: string; email: string; name: string; password: string } } = {
  'test@example.com': {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'password123',
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate input
    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ error: 'Name, email, and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already exists
    if (users[email.toLowerCase()]) {
      return new Response(
        JSON.stringify({ error: 'User already exists' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      name,
      password, // In a real app, this would be hashed
    };

    users[email.toLowerCase()] = newUser;

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser;
    
    return new Response(
      JSON.stringify(userWithoutPassword),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}