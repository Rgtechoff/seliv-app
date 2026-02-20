import { NextRequest, NextResponse } from 'next/server';

// ── Beta access gate ──────────────────────────────────────────────────────────
const BETA_COOKIE = 'seliv_beta_access';

// ── JWT auth ──────────────────────────────────────────────────────────────────
const PUBLIC_PATHS = ['/login', '/register', '/access', '/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Beta access gate (only active when ACCESS_CODE env var is set)
  const accessCode = process.env.ACCESS_CODE;
  if (accessCode) {
    const betaCookie = request.cookies.get(BETA_COOKIE);
    const isAccessPage = pathname === '/access';

    if (!isAccessPage && betaCookie?.value !== accessCode) {
      const url = request.nextUrl.clone();
      url.pathname = '/access';
      url.search = '';
      if (pathname !== '/') {
        url.searchParams.set('redirect', pathname);
      }
      const response = NextResponse.redirect(url);
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return response;
    }
  }

  // 2. JWT auth guard (existing logic)
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith('/_next') || pathname.startsWith('/api'),
  );

  if (isPublic) {
    const response = NextResponse.next();
    if (process.env.ACCESS_CODE) {
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    }
    return response;
  }

  const token = request.cookies.get('seliv_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const response = NextResponse.next();
  if (process.env.ACCESS_CODE) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
