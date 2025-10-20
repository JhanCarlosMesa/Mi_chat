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
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find user
    const user = users[email.toLowerCase()];
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check password
    if (user.password !== password) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    
    return new Response(
      JSON.stringify(userWithoutPassword),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}