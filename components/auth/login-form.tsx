"use client";
import { useActionState, useState } from "react";
import { signIn } from "@/lib/actions/auth";
import type { AuthFormState } from "@/lib/validations/auth";
import { AlertCircle, Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    signIn,
    undefined
  );
  // 🌟 NAYA: Password dikhana hai ya chupana hai
  const [showPassword, setShowPassword] = useState(false);


  return (
    <form action={action} noValidate>
      {/* General error banner */}
      {state?.message && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-5 flex items-start gap-2.5 rounded-lg border border-[var(--color-error-light,hsl(0,70%,90%))] bg-[hsl(0,70%,97%)] px-4 py-3 text-sm text-[hsl(0,65%,40%)]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      {/* Email field */}
      <div className="mb-4">
        <label
          htmlFor="login-email"
          className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
        >
          Email address
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-400)]" />
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-describedby={state?.errors?.email ? "login-email-error" : undefined}
            aria-invalid={!!state?.errors?.email}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 disabled:opacity-60 aria-invalid:border-[hsl(0,70%,55%)]"
          />
        </div>
        {state?.errors?.email && (
          <p
            id="login-email-error"
            role="alert"
            className="mt-1.5 text-xs text-[hsl(0,65%,45%)]"
          >
            {state.errors.email[0]}
          </p>
        )}
      </div>

            {/* Password field */}
      <div className="mb-6">
        <label
          htmlFor="login-password"
          className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
        >
          Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-400)]" />
          <input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            aria-describedby={state?.errors?.password ? "login-password-error" : undefined}
            aria-invalid={!!state?.errors?.password}
            placeholder="••••••••"
            className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 pl-10 pr-10 text-sm text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 disabled:opacity-60 aria-invalid:border-[hsl(0,70%,55%)]"
          />
          {/* 👁️ NAYA EYE TOGGLE BUTTON */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-700)] focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {state?.errors?.password && (
          <p
            id="login-password-error"
            role="alert"
            className="mt-1.5 text-xs text-[hsl(0,65%,45%)]"
          >
            {state.errors.password[0]}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={pending}
        aria-disabled={pending}
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in…
          </>
        ) : (
          "Log In"
        )}
      </Button>
    </form>
  );
}
