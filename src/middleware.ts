import { NextRequest, NextResponse } from 'next/server';

import { auth } from './auth';

const publicUrl = ['/login', '/register', '/verify', '/forgot-password'];

export async function middleware(request: NextRequest) {
  const { expires, user } = (await auth()) || {};
  const currentDate = new Date();
  const expirationDate = expires ? new Date(expires) : null;

  const isAuth = !!user?.accessToken;
  const isTokenExpired = expirationDate && currentDate > expirationDate;

  const url = new URL(request.url);
  const pathname = url.pathname as string;

  // If token is expired, redirect to login and clear cookies
  if (isTokenExpired && !publicUrl.some((p) => pathname.startsWith(p))) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    // Clear authentication cookies
    response.cookies.delete('authjs.csrf-token');
    response.cookies.delete('authjs.session-token');
    response.cookies.delete('authjs.callback-url');
    return response;
  }

  // Public routes handling
  if (publicUrl.some((u) => pathname.startsWith(u))) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!isAuth) {
    let from = request.nextUrl.pathname;
    if (request.nextUrl.search) {
      from += request.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register/',
    '/verify',
    '/forgot-password',
    '/',
    '/account',
    '/org-(.+)',
  ],
};
