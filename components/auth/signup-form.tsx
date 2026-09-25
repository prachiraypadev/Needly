"use client";

import { useState, useActionState } from "react";
import { signUp } from "@/lib/actions/auth";
import type { AuthFormState } from "@/lib/validations/auth";
import Link from "next/link";
import { AlertCircle, Loader2, Mail, Lock, User, CheckCircle2, Inbox, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const PASSWORD_REQUIREMENTS = [
  { label: "At least 8 characters", regex: /.{8,}/ },
  { label: "At least one letter", regex: /[a-zA-Z]/ },
  { label: "At least one number", regex: /[0-9]/ },
  { label: "At least one special character", regex: /[^a-zA-Z0-9]/ },
];

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    signUp,
    undefined
  );

  if (state?.requiresEmailConfirmation) {
    return (
      <div
        role="region"
        aria-label="Email Verification Notice"
        className="rounded-2xl border border-[var(--color-neutral-200)] bg-white p-6 sm:p-8 text-center shadow-sm"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(142,70%,94%)] text-[var(--color-primary-600)]">
          <Inbox className="h-8 w-8" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-[var(--color-neutral-900)]">
          Check your email
        </h2>
        <p className="mb-3 text-sm text-[var(--color-neutral-600)] leading-relaxed">
          We sent a verification link to:
        </p>
        <div className="mb-5 inline-block rounded-md bg-[var(--color-neutral-100)] px-3 py-1.5 text-sm font-semibold text-[var(--color-neutral-900)]">
          {state.email}
        </div>
        <p className="mb-6 text-xs text-[var(--color-neutral-500)] leading-relaxed">
          Click the link in the email to activate your account. If you don&apos;t see it in your inbox, please check your <strong>Spam</strong> or <strong>Promotions</strong> folder.
        </p>
        <Link href="/login" className="block w-full">
          <Button variant="primary" size="lg" className="w-full">
            Proceed to Sign In
          </Button>
        </Link>
      </div>
    );
  }

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

      {/* Full name field */}
      <div className="mb-4">
        <label
          htmlFor="signup-display-name"
          className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
        >
          Full name
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-400)]" />
          <input
            id="signup-display-name"
            name="display_name"
            type="text"
            autoComplete="name"
            required
            aria-describedby={
              state?.errors?.display_name ? "signup-name-error" : undefined
            }
            aria-invalid={!!state?.errors?.display_name}
            placeholder="Rahul Sharma"
            className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 disabled:opacity-60 aria-invalid:border-[hsl(0,70%,55%)]"
          />
        </div>
        {state?.errors?.display_name && (
          <p
            id="signup-name-error"
            role="alert"
            className="mt-1.5 text-xs text-[hsl(0,65%,45%)]"
          >
            {state.errors.display_name[0]}
          </p>
        )}
      </div>

      {/* Email field */}
      <div className="mb-4">
        <label
          htmlFor="signup-email"
          className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
        >
          Email address
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-400)]" />
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-describedby={state?.errors?.email ? "signup-email-error" : undefined}
            aria-invalid={!!state?.errors?.email}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 disabled:opacity-60 aria-invalid:border-[hsl(0,70%,55%)]"
          />
        </div>
        {state?.errors?.email && (
          <p
            id="signup-email-error"
            role="alert"
            className="mt-1.5 text-xs text-[hsl(0,65%,45%)]"
          >
            {state.errors.email[0]}
          </p>
        )}
      </div>

      {/* Password field */}
      <div className="mb-4">
        <label
          htmlFor="signup-password"
          className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
        >
          Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-400)]" />
          <input
            id="signup-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            aria-describedby="signup-password-requirements"
            aria-invalid={!!state?.errors?.password}
            placeholder="••••••••"
            className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 pl-10 pr-10 text-sm text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 disabled:opacity-60 aria-invalid:border-[hsl(0,70%,55%)]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-700)] focus:outline-none cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Password requirements */}
        {state?.errors?.password ? (
          <ul
            id="signup-password-requirements"
            role="alert"
            className="mt-2 space-y-1"
          >
            {state.errors.password.map((err) => (
              <li
                key={err}
                className="flex items-center gap-1.5 text-xs text-[hsl(0,65%,45%)]"
              >
                <AlertCircle className="h-3 w-3 shrink-0" />
                {err}
              </li>
            ))}
          </ul>
        ) : (
          <ul
            id="signup-password-requirements"
            className="mt-2 space-y-1"
            aria-label="Password requirements"
          >
            {PASSWORD_REQUIREMENTS.map(({ label }) => (
              <li
                key={label}
                className="flex items-center gap-1.5 text-xs text-[var(--color-neutral-500)]"
              >
                <CheckCircle2 className="h-3 w-3 shrink-0 text-[var(--color-neutral-300)]" />
                {label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Confirm password field */}
      <div className="mb-6">
        <label
          htmlFor="signup-confirm-password"
          className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
        >
          Confirm password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-400)]" />
          <input
            id="signup-confirm-password"
            name="confirm_password"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            aria-describedby={
              state?.errors?.confirm_password
                ? "signup-confirm-password-error"
                : undefined
            }
            aria-invalid={!!state?.errors?.confirm_password}
            placeholder="••••••••"
            className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 pl-10 pr-10 text-sm text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 disabled:opacity-60 aria-invalid:border-[hsl(0,70%,55%)]"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-700)] focus:outline-none cursor-pointer"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {state?.errors?.confirm_password && (
          <p
            id="signup-confirm-password-error"
            role="alert"
            className="mt-1.5 text-xs text-[hsl(0,65%,45%)]"
          >
            {state.errors.confirm_password[0]}
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
            Creating account…
          </>
        ) : (
          "Create account"
        )}
      </Button>

      <p className="mt-4 text-center text-xs text-[var(--color-neutral-400)]">
        By creating an account, you agree to participate responsibly within your community.
      </p>
    </form>
  );
}
