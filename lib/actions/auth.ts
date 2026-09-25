"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignUpSchema, SignInSchema, AuthFormState } from "@/lib/validations/auth";

// ---------------------------------------------------------------------------
// SIGN UP
// ---------------------------------------------------------------------------

/**
 * Server Action for user registration.
 * Validates input, creates a Supabase Auth user, and redirects to /profile.
 * The profile row is created automatically by the database trigger.
 */
export async function signUp(
  _state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  // 1. Validate input
  const raw = {
    display_name: formData.get("display_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  };

  const validated = SignUpSchema.safeParse(raw);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { display_name, email, password } = validated.data;

  // Check if Supabase URL is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes("placeholder-project") || supabaseUrl.includes("YOUR_PROJECT_REF")) {
    console.error("[Auth] Supabase URL is missing or set to placeholder in .env.local");
    return {
      message: "Supabase Project URL is not configured. Please set NEXT_PUBLIC_SUPABASE_URL in .env.local.",
    };
  }

  // 2. Create auth user via Supabase
  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Pass display_name in metadata so the DB trigger can seed profiles.display_name
      data: { display_name },
      emailRedirectTo: `${appUrl}/auth/callback`,
    },
  });

  if (error) {
    console.error("[Auth] Supabase signUp error:", error);
    // Map Supabase errors to user-friendly messages without leaking internals
    if (
      error.message.toLowerCase().includes("already registered") ||
      error.message.toLowerCase().includes("already exists") ||
      error.message.toLowerCase().includes("user already")
    ) {
      return {
        message: "An account with this email already exists. Please sign in instead.",
      };
    }
    return {
      message:
        process.env.NODE_ENV === "development"
          ? `Signup failed: ${error.message}`
          : "We could not create your account. Please try again.",
    };
  }

  // Handle case where user already exists but Supabase obfuscation returned empty identities
  if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return {
      message: "An account with this email already exists. Please sign in instead.",
    };
  }

  // If email confirmation is enabled in Supabase, data.session will be null
  if (!data?.session && data?.user) {
    return {
      requiresEmailConfirmation: true,
      email,
      message: `A verification email has been sent to ${email}. Please check your inbox and click the link to activate your account.`,
    };
  }

  // 3. Redirect to profile on immediate session creation (when email confirmation is disabled)
  redirect("/profile");
}

// ---------------------------------------------------------------------------
// SIGN IN
// ---------------------------------------------------------------------------

/**
 * Server Action for email + password login.
 * Validates input, authenticates via Supabase, and redirects to /profile.
 */
export async function signIn(
  _state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  // 1. Validate input
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validated = SignInSchema.safeParse(raw);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validated.data;

  // 2. Authenticate via Supabase
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[Auth] Supabase signIn error:", error);
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return {
        message:
          "Your email has not been confirmed yet. Please check your email inbox for the confirmation link, or disable 'Confirm email' in Supabase Dashboard (Authentication > Providers > Email).",
      };
    }
    // Use a generic invalid credentials message — never reveal whether the
    // email exists or the password is wrong (enumeration attack prevention)
    return {
      message: "Invalid email or password. Please check your credentials and try again.",
    };
  }

  // 3. Redirect to profile on success
  redirect("/profile");
}

// ---------------------------------------------------------------------------
// SIGN OUT
// ---------------------------------------------------------------------------

/**
 * Server Action for logout.
 * Clears the Supabase session and redirects to the home page.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

// ---------------------------------------------------------------------------
// GOOGLE OAUTH
// ---------------------------------------------------------------------------

/**
 * Server Action for Google OAuth authentication.
 * Initiates the OAuth 2.0 PKCE flow via Supabase and redirects the user to Google.
 */
export async function signInWithGoogle(): Promise<{ error?: string; url?: string }> {
  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appUrl}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("[Auth] Google OAuth error:", error);
    return {
      error: error.message.toLowerCase().includes("not enabled")
        ? "Google login is not enabled in your Supabase project yet. Please enable Google provider in your Supabase Dashboard (Authentication > Providers > Google)."
        : error.message,
    };
  }

  if (data?.url) {
    // Check if the provider is actually active in Supabase
    try {
      const probeRes = await fetch(data.url, { method: "GET", redirect: "manual" });
      if (probeRes.status === 400) {
        const errBody = (await probeRes.json().catch(() => null)) as {
          msg?: string;
          error_code?: string;
        } | null;
        if (
          errBody?.msg?.toLowerCase().includes("not enabled") ||
          errBody?.error_code === "validation_failed"
        ) {
          return {
            error:
              "Google Login is not enabled in your Supabase project yet. Please enable the Google provider in your Supabase Dashboard (Authentication → Providers → Google), or continue with Email & Password below.",
          };
        }
      }
    } catch {
      // If probe fails for network reasons, proceed with the URL
    }

    return { url: data.url };
  }

  return { error: "Failed to generate Google authentication link." };
}
