import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/login',
  '/forgot-password',
  '/unauthorized',
  '/session-expired',
  '/403',
  '/500',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Read session cookie written by TokenManager
  const token = request.cookies.get('homiepg_auth_token')?.value;

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  // Skip middleware intercept on static resources and internal chunks
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  if (!token) {
    if (!isPublicPath) {
      // Redirect unauthenticated guests to login page
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  } else {
    // Decode role from JWT payload using standard browser atob in Next.js Edge Runtime
    let role: string | null = null;
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        // Base64URL to Base64 decode
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const decoded = atob(base64);
        const payload = JSON.parse(decoded);
        role = payload.role;
      }
    } catch {
      // Invalid token format: clear and redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      const response = NextResponse.redirect(url);
      response.cookies.delete('homiepg_auth_token');
      return response;
    }

    // Role verification: Admin Web portal is strictly restricted to ADMIN role
    if (role !== 'ADMIN' && !isPublicPath) {
      const url = request.nextUrl.clone();
      url.pathname = '/403';
      return NextResponse.redirect(url);
    }

    // Prevent authenticated user from accessing login or forgot-password forms
    if (pathname === '/login' || pathname === '/forgot-password') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Support match configurations
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
