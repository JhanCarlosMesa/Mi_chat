import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
  locales: ['es'],
  defaultLocale: 'es'
});

export default function middleware(request: NextRequest) {
  // First, let the internationalization middleware handle the request
  const intlResponse = intlMiddleware(request);
  
  // If intl middleware already determined a response, return it
  if (intlResponse) {
    return intlResponse;
  }
  
  // Get the pathname
  const pathname = request.nextUrl.pathname;
  
  // Check if user is authenticated for protected routes
  const isProtectedRoute = pathname === '/' || pathname.startsWith('/chat');
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  
  // Try to get user from localStorage (this is a simplified check)
  // In a real app, you'd check a session token or JWT
  const user = request.cookies.get('chatUser') || null;
  
  // Redirect authenticated users away from auth pages
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Redirect unauthenticated users to login
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return intlResponse || NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};