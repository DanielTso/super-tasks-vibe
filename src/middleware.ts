import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth/session";

// Public paths that don't require authentication
const publicPaths = ["/login", "/register", "/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if path is public
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Get session token from cookie
  const sessionToken = request.cookies.get("session")?.value;

  // Verify session
  let isAuthenticated = false;
  if (sessionToken) {
    const session = await verifySessionToken(sessionToken);
    if (session && session.exp > Date.now() / 1000) {
      isAuthenticated = true;
    }
  }

  // Redirect logic
  if (isPublicPath && isAuthenticated) {
    // Authenticated users shouldn't access login/register pages
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isPublicPath && !isAuthenticated) {
    // Unauthenticated users should be redirected to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Add user info to headers for server components
  if (isAuthenticated && sessionToken) {
    const session = await verifySessionToken(sessionToken);
    if (session) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", session.userId);
      requestHeaders.set("x-user-email", session.email);
      requestHeaders.set("x-user-username", session.username);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
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
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
