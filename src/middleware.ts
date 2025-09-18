import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Redirect from the root to the default locale
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/en', request.url));
  }

  // 2. Check if the path is for a public i18n route
  const isPublicI18nRoute = /^\/(en|de|ko|fr|es|ja|zh)(\/.*)?$/.test(pathname);

  // If it's a public route, just let it pass through.
  // This prevents any default auth middleware from trying to protect it.
  if (isPublicI18nRoute) {
    return NextResponse.next();
  }

  // For any other route, let the default Next.js and next-auth handling apply.
  // This includes the /admin routes, which will be protected by the SessionProvider
  // in the admin layout.
  return NextResponse.next();
}

export const config = {
  // We need to match more than just the root now.
  // This matcher will run the middleware on all paths except for a few specific ones.
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};