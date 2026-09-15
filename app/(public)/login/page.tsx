import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign In — Needly",
  description: "Sign in to your Needly account to access your community marketplace.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-1">
            <span className="text-2xl font-extrabold tracking-tight text-[var(--color-neutral-900)]">
              Needly
            </span>
            <span className="text-xs text-[var(--color-neutral-500)]">
              Your community, made useful.
            </span>
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-[var(--color-neutral-900)]">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
            Sign in to your community account
          </p>
        </div>

        {/* Form */}
        <LoginForm />

        {/* Sign up link */}
        <p className="mt-6 text-center text-sm text-[var(--color-neutral-500)]">
          New to Needly?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
