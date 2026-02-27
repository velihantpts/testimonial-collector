import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedPaths = [
  "/dashboard",
  "/testimonials",
  "/projects",
  "/settings",
];

// Routes that are always public
const publicPaths = [
  "/",
  "/login",
  "/register",
];

// API and path prefixes that are always public
const publicPrefixes = [
  "/api/auth/",
  "/api/collect/",
  "/api/widgets/embed/",
  "/collect/",
  "/_next/",
  "/favicon.ico",
];

function isPublicPath(pathname: string): boolean {
  // Check exact public paths
  if (publicPaths.includes(pathname)) {
    return true;
  }

  // Check public prefixes
  for (const prefix of publicPrefixes) {
    if (pathname.startsWith(prefix)) {
      return true;
    }
  }

  return false;
}

function isProtectedPath(pathname: string): boolean {
  for (const path of protectedPaths) {
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      return true;
    }
  }

  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for session token (next-auth v5 uses this cookie name)
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  // If accessing a protected route without a session, redirect to login
  if (isProtectedPath(pathname) && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
