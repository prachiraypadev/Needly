import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Log in — Jod",
  description: "Log in to your Jod account to access your community marketplace.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[var(--color-neutral-50)] px-4 py-12">
      {/* 🌟 JOD CARD BOX */}
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-neutral-200)] bg-white p-8 shadow-sm">
        {/* Logo / Brand */}
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-1">
            <span className="text-2xl font-extrabold tracking-tight text-[var(--color-primary-600)]">
              Jod
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
            Log in to your account
          </p>
        </div>

        {/* Google Sign In */}
        <GoogleSignInButton text="Sign in with Google" />

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[var(--color-neutral-200)]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-[var(--color-neutral-400)] font-medium">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Form */}
        <LoginForm />

        {/* Sign up link */}
        <p className="mt-6 text-center text-sm text-[var(--color-neutral-500)]">
          New to Jod?{" "}
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
