import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwt(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('mindcare_session');
  const token = sessionCookie?.value;

  let payload: any = null;
  if (token) {
    payload = decodeJwt(token);
    if (payload && payload.exp && payload.exp * 1000 < Date.now()) {
      payload = null;
    }
  }

  const redirectToLogin = () => {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    const response = NextResponse.redirect(loginUrl);
    if (sessionCookie) {
      response.cookies.delete('mindcare_session');
    }
    return response;
  };

  if (pathname.startsWith('/admin')) {
    if (!payload || payload.role !== 'admin') {
      return redirectToLogin();
    }
  }

  if (pathname.startsWith('/consultant')) {
    if (!payload || (payload.role !== 'consultant' && payload.role !== 'admin')) {
      return redirectToLogin();
    }
  }

  const protectedPrefixes = ['/dashboard', '/profile', '/consultations', '/assessment'];
  const isProtected = protectedPrefixes.some(prefix => pathname.startsWith(prefix));

  if (isProtected) {
    if (!payload) {
      return redirectToLogin();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/consultant/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/consultations/:path*',
    '/assessment/:path*',
  ],
};
