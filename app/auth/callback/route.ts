import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /auth/callback
 *
 * Supabase auth callback route handler.
 * Exchanges the `code` query parameter for a Supabase session.
 *
 * This route is required for:
 * - Email confirmation links
 * - Magic link sign-in (if enabled in future)
 * - OAuth provider callbacks (e.g. Google — if enabled in future)
 *
 * The `auth/callback` path is exempted from proxy route protection to prevent
 * redirect loops during the session establishment flow.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  // Preserve a `next` redirect param if passed through the OAuth flow
  const next = searchParams.get("next") ?? "/profile";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Ensure next is a relative path (prevent open redirect)
      const safeNext = next.startsWith("/") ? next : "/profile";
      return NextResponse.redirect(new URL(safeNext, origin));
    }
  }

  // If no code or exchange failed, redirect to login with error indicator
  return NextResponse.redirect(
    new URL("/login?error=auth_callback_failed", origin)
  );
}
