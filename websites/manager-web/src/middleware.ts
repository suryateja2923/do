import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PUBLIC_PATHS } from '@/config/routes';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static resources and internal Next.js chunks
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Read session cookie written by TokenManager
  const token = request.cookies.get('homiepg_manager_token')?.value;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!token) {
    if (!isPublicPath) {
      // Unauthenticated: redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  } else {
    // Decode role from JWT payload using Edge-runtime-safe atob
    let role: string | null = null;
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const decoded = atob(base64);
        const payload = JSON.parse(decoded);
        role = payload.role;
      }
    } catch {
      // Malformed token: clear and redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      const response = NextResponse.redirect(url);
      response.cookies.delete('homiepg_manager_token');
      return response;
    }

    // Manager Web portal is restricted to MANAGER and ADMIN roles only
    if (role !== 'MANAGER' && role !== 'ADMIN' && !isPublicPath) {
      const url = request.nextUrl.clone();
      url.pathname = '/403';
      return NextResponse.redirect(url);
    }

    // Redirect authenticated managers away from guest-only pages
    if (pathname === '/login' || pathname === '/forgot-password') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
