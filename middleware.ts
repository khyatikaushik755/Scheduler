import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow access to login page
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // Allow access to API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Allow access to booking pages (public)
  if (pathname.startsWith('/booking/')) {
    return NextResponse.next();
  }

  // For admin routes, let the page component handle authentication
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/booking/:path*'],
};