import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Next.js 16 `proxy.ts` (Edge Request Boundary)
 *
 * Responsibilities:
 * 1. Refresh Supabase auth session token cookies seamlessly on every request.
 * 2. Enforce route protection:
 *    - Protected routes: redirect unauthenticated users to /login
 *    - Auth routes (/login, /signup): redirect authenticated users to /profile
 *
 * NOTE: This is an optimistic check using the Supabase cookie session.
 * Server Components and Server Actions MUST independently verify the session
 * via lib/auth/dal.ts verifySession() — the authoritative security boundary.
 */

// ---------------------------------------------------------------------------
// Route classification
// ---------------------------------------------------------------------------

/**
 * Path prefixes that require an authenticated session.
 * Uses startsWith() matching — any sub-path is also protected.
 * Add new authenticated route groups here as they are implemented.
 */
const PROTECTED_PREFIXES = [
  "/profile",
  "/communities",
  "/create-community",
  "/join-community",
  "/needs",
  "/listings",
  "/my-listings",
  // Future authenticated routes — add when implemented:
  // "/dashboard",
  // "/messages",
  // "/transactions",
];

/**
 * Exact paths for authentication pages.
 * Authenticated users visiting these are redirected to /profile.
 */
const AUTH_ROUTES = ["/login", "/signup"];

/**
 * Paths that must always pass through without any session check.
 * The auth callback MUST be exempted to avoid redirect loops.
 */
const ALWAYS_PUBLIC_PREFIXES = [
  "/auth/callback",
  "/about",
  "/how-it-works",
];

// ---------------------------------------------------------------------------
// Helper: classify the current path
// ---------------------------------------------------------------------------

function classifyPath(pathname: string): "protected" | "auth" | "public" {
  // Always-public paths take priority
  if (ALWAYS_PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return "public";
  }

  // Exact match for auth routes
  if (AUTH_ROUTES.includes(pathname)) {
    return "auth";
  }

  // Prefix match for protected routes
  if (PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return "protected";
  }

  // Everything else: public (home, static pages, unknown/404 routes, etc.)
  return "public";
}

// ---------------------------------------------------------------------------
// Proxy function
// ---------------------------------------------------------------------------

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const routeType = classifyPath(pathname);

  // 1. Fast path for public routes: Never block with network calls
  if (routeType === "public") {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }

  // 2. Fast check: Check if any Supabase session cookies exist locally in the browser request
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.includes("auth-token") || c.name.startsWith("sb-")
  );

  // If visiting protected route with NO cookie, redirect to /login immediately in 0ms
  if (routeType === "protected" && !hasAuthCookie) {
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If visiting /login or /signup with NO cookie, show form immediately in 0ms
  if (routeType === "auth" && !hasAuthCookie) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }

  // 3. For users with auth cookies, configure Supabase client to verify session and refresh token
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;

  // Unauthenticated user attempting to access a protected route
  if (routeType === "protected" && !isAuthenticated) {
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user visiting /login or /signup — send them to their profile
  if (routeType === "auth" && isAuthenticated) {
    return NextResponse.redirect(new URL("/profile", request.nextUrl.origin));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public static assets (svg, png, jpg, jpeg, gif, webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
