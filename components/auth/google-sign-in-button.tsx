"use client";

import React, { useState } from "react";
import { signInWithGoogle } from "@/lib/actions/auth";
import { Loader2, AlertCircle } from "lucide-react";

interface GoogleSignInButtonProps {
  text?: string;
}

/**
 * GoogleSignInButton — Industry-standard OAuth 2.0 Google login button.
 * Renders the authentic Google 'G' multicolored icon, handles loading state,
 * and displays informative configuration hints if Google OAuth is not yet enabled in Supabase.
 */
export function GoogleSignInButton({
  text = "Continue with Google",
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await signInWithGoogle();
      if (res?.error) {
        setErrorMessage(res.error);
        setLoading(false);
      }
    } catch (err: unknown) {
      // In Next.js Server Actions, redirect() throws a NEXT_REDIRECT error which is intended behavior!
      const isRedirect =
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        (err as { message: string }).message === "NEXT_REDIRECT";

      if (!isRedirect) {
        console.error("Google sign in failed:", err);
        setErrorMessage("Could not connect to Google. Please try again.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full">
      {errorMessage && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 leading-relaxed animate-in fade-in duration-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <span className="font-semibold block text-amber-950">Notice:</span>
            {errorMessage}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-label={text}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--color-neutral-300)] bg-white py-2.5 px-4 text-sm font-semibold text-[var(--color-neutral-800)] shadow-xs transition-all hover:bg-[var(--color-neutral-50)] hover:border-[var(--color-neutral-400)] active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-[var(--color-neutral-500)]" />
        ) : (
          <svg
            className="h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>{loading ? "Redirecting to Google…" : text}</span>
      </button>
    </div>
  );
}
