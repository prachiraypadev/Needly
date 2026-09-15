import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Data Access Layer (DAL) for authentication.
 *
 * Uses React cache() to memoize results within a single render pass,
 * preventing duplicate supabase.auth.getUser() calls across server components.
 *
 * SECURITY: Always uses supabase.auth.getUser() (not getSession()) because
 * getSession() reads only the cookie without server-side JWT verification.
 * getUser() validates the JWT against Supabase's auth server on every call.
 */

export type SessionUser = {
  userId: string;
  email: string | undefined;
};

/**
 * Verifies the current session and returns the authenticated user.
 * Redirects to /login if there is no valid session.
 * Call this at the top of every protected Server Component or Server Action.
 */
export const verifySession = cache(async (): Promise<SessionUser> => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return {
    userId: user.id,
    email: user.email,
  };
});

/**
 * Returns the current session user without redirecting.
 * Returns null if unauthenticated.
 * Use in layouts and headers that render conditionally for both authenticated
 * and unauthenticated states.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
  };
});
